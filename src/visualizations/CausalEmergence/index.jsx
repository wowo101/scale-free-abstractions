import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BackButton, GlassPanel, Button, ButtonGroup, Tooltip } from '../../components/shared';
import { useAnimationFrame } from '../../hooks';
import { PRESETS, EXPLANATIONS } from './data';
import {
  computeEI,
  coarseGrain,
  computeCausalEmergence,
  getMetrics,
  formatNumber,
} from './utils';
import GuidePanel from './GuidePanel';

const CE_EXPLANATION = `Causal Emergence (CE) measures whether a macro-level description has more causal power than the micro-level.

**Formula:** CE = EI(macro) - EI(micro)

**Interpretation:**
• CE > 0: The macro level captures MORE causal structure – emergence!
• CE = 0: Micro and macro have equal causal power
• CE < 0: Information is lost in coarse-graining

**Why this matters:**
When CE > 0, the higher-level description isn't just convenient – it's more causally accurate. The macro level reveals real patterns that are obscured by micro-level noise.`;

export default function CausalEmergenceCalculator() {
  const canvasRef = useRef(null);

  // State
  const [activePreset, setActivePreset] = useState('noisyCopy');
  const [preset, setPreset] = useState(PRESETS.noisyCopy);
  const [grouping, setGrouping] = useState(PRESETS.noisyCopy.suggestedGrouping);
  const [hoveredState, setHoveredState] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showCEInfo, setShowCEInfo] = useState(false);
  const [tooltip, setTooltip] = useState(null); // { x, y, text }
  const tooltipTimeoutRef = useRef(null);

  // Store positions for hit detection
  const positionsRef = useRef({ micro: [], macro: [], bars: {} });

  // Computed metrics
  const microMetrics = getMetrics(preset.tpm);
  const macroTPM = coarseGrain(preset.tpm, grouping);
  const macroMetrics = getMetrics(macroTPM);
  const causalEmergence = computeCausalEmergence(preset.tpm, grouping);

  // Apply preset
  const applyPreset = useCallback((name) => {
    const p = PRESETS[name];
    setPreset(p);
    setActivePreset(name);
    setGrouping(p.suggestedGrouping);
    setHoveredState(null);
  }, []);

  // Animation
  const animationCallback = useCallback(() => {
    setAnimationPhase(prev => (prev + 0.02) % (Math.PI * 2));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Clear
    ctx.fillStyle = '#0f0f0a';
    ctx.fillRect(0, 0, W, H);

    const tpm = preset.tpm;
    const n = tpm.length;

    // Draw micro-level network (left side)
    const microCenterX = W * 0.3;
    const microCenterY = H * 0.45;
    const microRadius = Math.min(W * 0.18, H * 0.32);

    // Calculate micro state positions (circular layout)
    const microPositions = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      microPositions.push({
        x: microCenterX + Math.cos(angle) * microRadius,
        y: microCenterY + Math.sin(angle) * microRadius,
        label: preset.states[i],
      });
    }

    // Store for hit detection
    positionsRef.current.micro = microPositions;

    // Draw transition arrows (micro)
    for (let from = 0; from < n; from++) {
      for (let to = 0; to < n; to++) {
        const prob = tpm[from][to];
        if (prob > 0.05) {
          const fromPos = microPositions[from];
          const toPos = microPositions[to];

          if (from === to) {
            // Self-loop
            const loopRadius = 15;
            const angle = (from / n) * Math.PI * 2 - Math.PI / 2;
            const cx = fromPos.x + Math.cos(angle) * loopRadius * 1.5;
            const cy = fromPos.y + Math.sin(angle) * loopRadius * 1.5;

            ctx.beginPath();
            ctx.arc(cx, cy, loopRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.15 + prob * 0.7})`;
            ctx.lineWidth = 1.5 + prob * 3;
            ctx.stroke();
          } else {
            // Arrow between states
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / dist;
            const ny = dy / dist;

            const startX = fromPos.x + nx * 20;
            const startY = fromPos.y + ny * 20;
            const endX = toPos.x - nx * 20;
            const endY = toPos.y - ny * 20;

            // Curved arrow
            const midX = (startX + endX) / 2 - ny * 20;
            const midY = (startY + endY) / 2 + nx * 20;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(midX, midY, endX, endY);
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.1 + prob * 0.7})`;
            ctx.lineWidth = 1.5 + prob * 3;
            ctx.stroke();

            // Animated flow
            const t = (animationPhase / (Math.PI * 2) + from / n) % 1;
            const flowX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
            const flowY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;

            if (prob > 0.2) {
              ctx.beginPath();
              ctx.arc(flowX, flowY, 3 * prob, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(251, 191, 36, ${prob})`;
              ctx.fill();
            }
          }
        }
      }
    }

    // Draw micro state nodes
    for (let i = 0; i < n; i++) {
      const pos = microPositions[i];
      const isHovered = hoveredState === i;

      // Glow
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 25);
      gradient.addColorStop(0, isHovered ? 'rgba(245, 158, 11, 0.6)' : 'rgba(245, 158, 11, 0.3)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Node
      ctx.fillStyle = isHovered ? '#fbbf24' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#0f0f0a';
      ctx.font = 'bold 11px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(preset.states[i], pos.x, pos.y);
    }

    // Draw macro-level network (right side)
    const macroCenterX = W * 0.7;
    const macroCenterY = H * 0.45;
    const macroRadius = Math.min(W * 0.12, H * 0.24);
    const nMacro = grouping.length;

    const macroPositions = [];
    for (let i = 0; i < nMacro; i++) {
      const angle = (i / nMacro) * Math.PI * 2 - Math.PI / 2;
      macroPositions.push({
        x: macroCenterX + Math.cos(angle) * macroRadius,
        y: macroCenterY + Math.sin(angle) * macroRadius,
        label: preset.macroLabels?.[i] || `M${i}`,
        microStates: grouping[i].map(idx => preset.states[idx]),
      });
    }

    // Store for hit detection
    positionsRef.current.macro = macroPositions;

    // Draw macro transition arrows
    for (let from = 0; from < nMacro; from++) {
      for (let to = 0; to < nMacro; to++) {
        const prob = macroTPM[from]?.[to] || 0;
        if (prob > 0.05) {
          const fromPos = macroPositions[from];
          const toPos = macroPositions[to];

          if (from === to) {
            const loopRadius = 20;
            const angle = (from / nMacro) * Math.PI * 2 - Math.PI / 2;
            const cx = fromPos.x + Math.cos(angle) * loopRadius * 1.5;
            const cy = fromPos.y + Math.sin(angle) * loopRadius * 1.5;

            ctx.beginPath();
            ctx.arc(cx, cy, loopRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.15 + prob * 0.7})`;
            ctx.lineWidth = 2 + prob * 4;
            ctx.stroke();
          } else {
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / dist;
            const ny = dy / dist;

            const startX = fromPos.x + nx * 30;
            const startY = fromPos.y + ny * 30;
            const endX = toPos.x - nx * 30;
            const endY = toPos.y - ny * 30;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.15 + prob * 0.7})`;
            ctx.lineWidth = 2 + prob * 4;
            ctx.stroke();

            // Arrowhead
            const arrowSize = 8;
            const arrowAngle = Math.atan2(endY - startY, endX - startX);
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
              endX - arrowSize * Math.cos(arrowAngle - 0.4),
              endY - arrowSize * Math.sin(arrowAngle - 0.4)
            );
            ctx.lineTo(
              endX - arrowSize * Math.cos(arrowAngle + 0.4),
              endY - arrowSize * Math.sin(arrowAngle + 0.4)
            );
            ctx.closePath();
            ctx.fillStyle = `rgba(34, 197, 94, ${prob * 0.8})`;
            ctx.fill();
          }
        }
      }
    }

    // Draw macro state nodes
    for (let i = 0; i < nMacro; i++) {
      const pos = macroPositions[i];

      // Glow
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 35);
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 35, 0, Math.PI * 2);
      ctx.fill();

      // Node
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#0f0f0a';
      ctx.font = 'bold 12px Inter, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(preset.macroLabels?.[i] || `M${i}`, pos.x, pos.y);

      // Show constituent micro states
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '9px Inter, system-ui';
      const microStates = grouping[i].map(idx => preset.states[idx]).join(', ');
      ctx.fillText(`{${microStates}}`, pos.x, pos.y + 38);
    }

    // Draw grouping lines connecting micro to macro
    ctx.setLineDash([4, 4]);
    for (let macroIdx = 0; macroIdx < nMacro; macroIdx++) {
      const macroPos = macroPositions[macroIdx];
      for (const microIdx of grouping[macroIdx]) {
        const microPos = microPositions[microIdx];
        ctx.beginPath();
        ctx.moveTo(microPos.x, microPos.y);
        ctx.lineTo(macroPos.x, macroPos.y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '14px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('MICRO LEVEL', microCenterX, H * 0.08);
    ctx.fillText('MACRO LEVEL', macroCenterX, H * 0.08);

    ctx.font = '11px Inter, system-ui';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(`${n} states`, microCenterX, H * 0.12);
    ctx.fillText(`${nMacro} states`, macroCenterX, H * 0.12);

    // Draw EI comparison bars at bottom
    const barY = H * 0.82;
    const barWidth = 120;
    const barHeight = 20;
    const maxEI = Math.max(microMetrics.ei, macroMetrics.ei, 2);

    // Store bar positions for hit detection
    positionsRef.current.bars = {
      microEI: { x: W * 0.25 - barWidth / 2, y: barY, w: barWidth, h: barHeight + 25 },
      macroEI: { x: W * 0.75 - barWidth / 2, y: barY, w: barWidth, h: barHeight + 25 },
      ce: { x: W * 0.5 - 60, y: barY - 5, w: 120, h: barHeight + 30 },
    };

    // Micro EI bar
    const microBarX = W * 0.25 - barWidth / 2;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.fillRect(microBarX, barY, barWidth, barHeight);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(microBarX, barY, barWidth * (microMetrics.ei / maxEI), barHeight);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 11px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Effective Information = ${formatNumber(microMetrics.ei)}`, W * 0.25, barY + barHeight + 18);

    // Macro EI bar
    const macroBarX = W * 0.75 - barWidth / 2;
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.fillRect(macroBarX, barY, barWidth, barHeight);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(macroBarX, barY, barWidth * (macroMetrics.ei / maxEI), barHeight);

    ctx.fillStyle = '#22c55e';
    ctx.fillText(`Effective Information = ${formatNumber(macroMetrics.ei)}`, W * 0.75, barY + barHeight + 18);

    // Causal emergence indicator
    const ceColor = causalEmergence > 0 ? '#22c55e' : (causalEmergence < 0 ? '#ef4444' : '#888');
    const ceSign = causalEmergence > 0 ? '+' : '';
    ctx.fillStyle = ceColor;
    ctx.font = 'bold 14px Inter, system-ui';
    ctx.fillText(`CE = ${ceSign}${formatNumber(causalEmergence)}`, W * 0.5, barY + barHeight / 2 + 5);

    if (causalEmergence > 0) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.font = '11px Inter, system-ui';
      ctx.fillText('Emergence!', W * 0.5, barY + barHeight + 18);
    }

  }, [preset, grouping, hoveredState, animationPhase, microMetrics, macroMetrics, causalEmergence]);

  // Animation loop
  useAnimationFrame({
    callback: animationCallback,
    deps: [animationCallback],
    fps: 30,
  });

  // Mouse move handler for tooltips
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const { micro, macro, bars } = positionsRef.current;

    let newTooltip = null;

    // Check micro states
    for (const pos of micro) {
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist < 20) {
        newTooltip = {
          x: e.clientX,
          y: e.clientY,
          text: `Micro state "${pos.label}": One of ${micro.length} original system states. Arrows show transition probabilities to other states.`
        };
        break;
      }
    }

    // Check macro states
    if (!newTooltip) {
      for (const pos of macro) {
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist < 30) {
          newTooltip = {
            x: e.clientX,
            y: e.clientY,
            text: `Macro state "${pos.label}": Groups micro states {${pos.microStates.join(', ')}}. Coarse-grained transitions may be more deterministic.`
          };
          break;
        }
      }
    }

    // Check EI bars
    if (!newTooltip && bars.microEI && x >= bars.microEI.x && x <= bars.microEI.x + bars.microEI.w &&
        y >= bars.microEI.y && y <= bars.microEI.y + bars.microEI.h) {
      newTooltip = {
        x: e.clientX,
        y: e.clientY,
        text: `Micro Effective Information: ${formatNumber(microMetrics.ei)} bits. Measures causal power at the original micro level.`
      };
    }

    if (!newTooltip && bars.macroEI && x >= bars.macroEI.x && x <= bars.macroEI.x + bars.macroEI.w &&
        y >= bars.macroEI.y && y <= bars.macroEI.y + bars.macroEI.h) {
      newTooltip = {
        x: e.clientX,
        y: e.clientY,
        text: `Macro Effective Information: ${formatNumber(macroMetrics.ei)} bits. Measures causal power at the coarse-grained macro level.`
      };
    }

    if (!newTooltip && bars.ce && x >= bars.ce.x && x <= bars.ce.x + bars.ce.w &&
        y >= bars.ce.y && y <= bars.ce.y + bars.ce.h) {
      newTooltip = {
        x: e.clientX,
        y: e.clientY,
        text: `Causal Emergence = EI(macro) - EI(micro). When positive, the macro level has more causal power than the micro level.`
      };
    }

    // Clear any pending timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    if (newTooltip) {
      // Show tooltip immediately when hovering over an element
      setTooltip(newTooltip);
    } else if (tooltip) {
      // Delay hiding tooltip to reduce flicker
      tooltipTimeoutRef.current = setTimeout(() => {
        setTooltip(null);
      }, 100);
    }
  }, [microMetrics.ei, macroMetrics.ei, tooltip]);

  const handleMouseLeave = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setTooltip(null);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#0f0f0a] font-sans text-slate-200 overflow-hidden">
      {/* Canvas container - positioned between left (240px) and right (300px) panels */}
      <div
        className="absolute inset-0"
        style={{ left: 240, right: 300 }}
      >
        <canvas
          ref={canvasRef}
          width={900}
          height={700}
          className="w-full h-full"
          style={{ objectFit: 'contain' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Canvas tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1.5 bg-black/90 border border-white/20 rounded text-[10px] text-slate-300 max-w-[200px] pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Controls Panel */}
      <GlassPanel
        position="top-left"
        width={220}
        accent="amber"
        style={{ background: 'rgba(15, 15, 10, 0.95)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BackButton />
          <span className="text-sm font-semibold">Causal Emergence</span>
        </div>

        {/* Preset buttons */}
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Systems</div>
        <div className="space-y-1.5 mb-4">
          {Object.entries(PRESETS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-all ${
                activePreset === key
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="h-px bg-white/10 mb-3" />

        {/* Metrics */}
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Micro Metrics</div>
        <div className="space-y-1 text-[11px] mb-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Determinism</span>
            <span className="text-amber-400">{formatNumber(microMetrics.determinism)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Degeneracy</span>
            <span className="text-amber-400">{formatNumber(microMetrics.degeneracy)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Effectiveness</span>
            <span className="text-amber-400">{formatNumber(microMetrics.effectiveness)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-slate-400">Effective Information</span>
            <span className="text-amber-400">{formatNumber(microMetrics.ei)}</span>
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Macro Metrics</div>
        <div className="space-y-1 text-[11px] mb-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Determinism</span>
            <span className="text-green-400">{formatNumber(macroMetrics.determinism)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Degeneracy</span>
            <span className="text-green-400">{formatNumber(macroMetrics.degeneracy)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Effectiveness</span>
            <span className="text-green-400">{formatNumber(macroMetrics.effectiveness)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-slate-400">Effective Information</span>
            <span className="text-green-400">{formatNumber(macroMetrics.ei)}</span>
          </div>
        </div>

        <div className="h-px bg-white/10 mb-3" />

        {/* Causal Emergence result */}
        <div className={`relative text-center py-2 rounded ${
          causalEmergence > 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5'
        }`}>
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            <span>Causal Emergence</span>
            <button
              onClick={() => setShowCEInfo(!showCEInfo)}
              className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-slate-200 text-[9px] font-bold transition flex items-center justify-center"
              title="What is Causal Emergence?"
            >
              i
            </button>
          </div>
          <div className={`text-lg font-bold ${
            causalEmergence > 0 ? 'text-green-400' : 'text-slate-400'
          }`}>
            {causalEmergence > 0 ? '+' : ''}{formatNumber(causalEmergence)}
          </div>
          {causalEmergence > 0 && (
            <div className="text-[10px] text-green-400 mt-1">
              Macro has more causal power!
            </div>
          )}
        </div>

        {/* CE Info popup */}
        {showCEInfo && (
          <div className="mt-2 p-2 bg-black/40 rounded border border-white/10 text-[10px] text-slate-400 leading-relaxed">
            <div className="flex justify-between items-start mb-1">
              <span className="text-amber-400 font-semibold text-[11px]">What is Causal Emergence?</span>
              <button
                onClick={() => setShowCEInfo(false)}
                className="text-slate-500 hover:text-slate-300 text-sm leading-none"
              >
                ×
              </button>
            </div>
            <p className="mb-1">
              <strong className="text-slate-300">CE = EI(macro) - EI(micro)</strong>
            </p>
            <p className="mb-1">
              Measures whether a macro-level description has more causal power than the micro-level.
            </p>
            <p className="text-slate-500">
              <strong className="text-green-400">CE &gt; 0</strong>: Emergence! The macro level captures more causal structure.
            </p>
          </div>
        )}
      </GlassPanel>

      {/* Description panel */}
      <div
        className="absolute top-5 glass-panel px-3 py-2 max-w-sm"
        style={{ left: 250 }}
      >
        <div className="text-xs font-semibold text-amber-400 mb-1">{preset.name}</div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {preset.description}
        </p>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] text-slate-600">
        Compare micro and macro levels • Watch probability flow animate
      </div>

      {/* Guide panel */}
      <GuidePanel />
    </div>
  );
}

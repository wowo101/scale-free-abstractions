import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BackButton, GlassPanel, Button, ButtonGroup } from '../../components/shared';
import { useAnimationFrame } from '../../hooks';
import { PHASES } from './data';
import {
  getCyclePosition,
  stepCycle,
  getSystemMetrics,
  getPhaseLabels,
  getPhaseColor,
  resetTrajectory,
} from './utils';

// 3D Projection Constants
const BASE_TILT = -0.5;       // ~30 degrees tilt, looking DOWN from above
const FOCAL_LENGTH = 2.5;
const CAMERA_DISTANCE = 4.0;

function project3D(p, scale, offset, rotationY) {
  const rx = BASE_TILT;
  const ry = rotationY;
  
  // Apply Y-axis rotation (user-controlled left-right rotation)
  const cosRy = Math.cos(ry);
  const sinRy = Math.sin(ry);
  let x = p.x * cosRy - p.z * sinRy;
  let y = p.y;
  let z = p.x * sinRy + p.z * cosRy;
  
  // Apply X-axis rotation (fixed tilt)
  const cosRx = Math.cos(rx);
  const sinRx = Math.sin(rx);
  const y2 = y * cosRx - z * sinRx;
  const z2 = y * sinRx + z * cosRx;
  
  // Perspective projection
  z = Math.max(z2 + CAMERA_DISTANCE, 0.1);
  const perspectiveScale = FOCAL_LENGTH / z;
  
  return {
    x: offset.x + x * perspectiveScale * scale,
    y: offset.y - y2 * perspectiveScale * scale,
    z,
  };
}

// Attractor Basin visualization component
function AttractorBasin({ metrics }) {
  const { basinWidth, basinDepth, phase } = metrics;
  const phaseColor = PHASES[phase]?.color || '#14b8a6';
  
  const width = Math.max(0.2, Math.min(0.9, basinWidth || 0.5));
  const depth = Math.max(0.2, Math.min(0.9, basinDepth || 0.5));
  
  const edgeY = 8;
  const leftX = 50 - width * 40;
  const rightX = 50 + width * 40;
  const controlY = edgeY + depth * 40;
  const basinBottomY = 0.5 * edgeY + 0.5 * controlY;
  const ballY = basinBottomY - 4;
  
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
        Attractor Basin
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed mb-2">
        The basin shape shows system stability. Wide basins absorb perturbations; 
        narrow ones are fragile. The ball represents the current system state.
      </p>
      <svg viewBox="0 0 100 55" className="w-full h-14">
        <path
          d={`M ${leftX} ${edgeY} Q 50 ${controlY}, ${rightX} ${edgeY}`}
          fill="none"
          stroke={phaseColor}
          strokeWidth="2"
          opacity="0.7"
        />
        <circle cx="50" cy={ballY} r="4" fill={phaseColor} />
      </svg>
    </div>
  );
}

// Phase list component
function PhaseList({ currentPhase }) {
  const phases = ['alpha', 'r', 'K', 'omega'];
  
  return (
    <div className="space-y-1">
      {phases.map((phaseKey) => {
        const phase = PHASES[phaseKey];
        const isActive = currentPhase === phaseKey;
        
        return (
          <div
            key={phaseKey}
            className={`rounded-lg transition-colors duration-500 ${
              isActive 
                ? 'bg-white/5 border border-white/10' 
                : 'border border-transparent opacity-60 hover:opacity-80'
            }`}
          >
            <div className={`flex items-center gap-2 px-2.5 py-1.5 ${isActive ? '' : 'py-1'}`}>
              <div
                className={`rounded-full transition-all duration-300 ${isActive ? 'w-2.5 h-2.5' : 'w-2 h-2'}`}
                style={{ backgroundColor: phase.color }}
              />
              <span 
                className={`font-medium transition-colors duration-300 ${isActive ? 'text-xs' : 'text-[10px] text-slate-400'}`}
                style={{ color: isActive ? phase.color : undefined }}
              >
                {phase.shortName} – {phase.name.split('(')[0].trim()}
              </span>
            </div>
            
            {isActive && (
              <div className="px-2.5 pb-2.5 pt-1">
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                  {phase.description}
                </p>
                <div className="space-y-0.5 text-[10px]">
                  <div>
                    <span className="text-slate-500">Potential: </span>
                    <span className="text-teal-400">{phase.characteristics.potential}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Connectedness: </span>
                    <span className="text-teal-400">{phase.characteristics.connectedness}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Resilience: </span>
                    <span className="text-teal-400">{phase.characteristics.resilience}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Draw 3D arrow with label
function drawArrow3D(ctx, start3D, end3D, label, labelOffset, scale, offset, rotationY) {
  const startProj = project3D(start3D, scale, offset, rotationY);
  const endProj = project3D(end3D, scale, offset, rotationY);
  
  ctx.beginPath();
  ctx.moveTo(startProj.x, startProj.y);
  ctx.lineTo(endProj.x, endProj.y);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  const dx = endProj.x - startProj.x;
  const dy = endProj.y - startProj.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len > 0) {
    const ux = dx / len;
    const uy = dy / len;
    const arrowSize = 6;
    
    ctx.beginPath();
    ctx.moveTo(endProj.x, endProj.y);
    ctx.lineTo(endProj.x - arrowSize * ux + arrowSize * 0.5 * uy, 
               endProj.y - arrowSize * uy - arrowSize * 0.5 * ux);
    ctx.lineTo(endProj.x - arrowSize * ux - arrowSize * 0.5 * uy, 
               endProj.y - arrowSize * uy + arrowSize * 0.5 * ux);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
  }
  
  const midProj = {
    x: (startProj.x + endProj.x) / 2 + labelOffset.x,
    y: (startProj.y + endProj.y) / 2 + labelOffset.y,
  };
  ctx.font = '10px Inter, system-ui';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, midProj.x, midProj.y);
}

export default function AdaptiveCycleExplorer() {
  const canvasRef = useRef(null);
  const trailRef = useRef([]);
  
  // Rotation state
  const [rotationY, setRotationY] = useState(-0.25);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, rotation: 0 });
  
  // Simulation state
  const [state, setState] = useState({
    t: 0,
    potential: 0,
    connectedness: 0,
    resilience: 0.5,
    phase: 'alpha',
  });
  
  const [paused, setPaused] = useState(false);
  const [metrics, setMetrics] = useState(() => getSystemMetrics(0));
  
  // Mouse drag handlers
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, rotation: rotationY };
  }, [rotationY]);
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    setRotationY(dragStartRef.current.rotation + dx * 0.005);
  }, [isDragging]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  const perturb = useCallback(() => {
    if (state.phase === 'K') {
      setState(prev => ({ ...prev, t: 0.5, phase: 'omega' }));
      trailRef.current = [];
    }
  }, [state.phase]);
  
  const reset = useCallback(() => {
    setState({ t: 0, potential: 0, connectedness: 0, resilience: 0.5, phase: 'alpha' });
    trailRef.current = [];
    resetTrajectory();
  }, []);
  
  const animationCallback = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    // Auto-rotation when not dragging
    if (!isDragging && !paused) {
      setRotationY(prev => prev + 0.005);
    }
    
    // Clear
    ctx.fillStyle = '#0a0f10';
    ctx.fillRect(0, 0, W, H);
    
    const scale = 210;
    const offset = { x: W * 0.5, y: H * 0.4 };
    
    // Update simulation
    if (!paused) {
      const newState = stepCycle(state);
      setState(newState);
      setMetrics(getSystemMetrics(newState.t));
      
      trailRef.current.push({ 
        x: newState.connectedness, 
        y: newState.potential, 
        z: newState.resilience, 
        phase: newState.phase, 
      });
      if (trailRef.current.length > 1500) {
        trailRef.current.shift();
      }
    }
    
    // Draw bounding box cage
    const s = 1.0;
    const boxVertices = [
      { x: -s, y: -s, z: -s }, { x:  s, y: -s, z: -s },
      { x:  s, y: -s, z:  s }, { x: -s, y: -s, z:  s },
      { x: -s, y:  s, z: -s }, { x:  s, y:  s, z: -s },
      { x:  s, y:  s, z:  s }, { x: -s, y:  s, z:  s },
    ];
    
    const boxEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];
    
    const projectedVertices = boxVertices.map(v => project3D(v, scale, offset, rotationY));
    
    // Draw shaded bottom face
    ctx.beginPath();
    ctx.moveTo(projectedVertices[0].x, projectedVertices[0].y);
    ctx.lineTo(projectedVertices[1].x, projectedVertices[1].y);
    ctx.lineTo(projectedVertices[2].x, projectedVertices[2].y);
    ctx.lineTo(projectedVertices[3].x, projectedVertices[3].y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fill();
    
    // Draw cage edges
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    boxEdges.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(projectedVertices[i].x, projectedVertices[i].y);
      ctx.lineTo(projectedVertices[j].x, projectedVertices[j].y);
      ctx.stroke();
    });
    
    // Draw dimension arrows
    drawArrow3D(ctx, { x: -s, y: -s, z: s }, { x: -s, y: s, z: s }, 'potential', { x: -20, y: 0 }, scale, offset, rotationY);
    drawArrow3D(ctx, { x: -s, y: -s, z: s }, { x: s, y: -s, z: s }, 'connectedness', { x: 0, y: 18 }, scale, offset, rotationY);
    drawArrow3D(ctx, { x: -s, y: -s, z: s }, { x: -s, y: -s, z: -s }, 'resilience', { x: -20, y: 0 }, scale, offset, rotationY);
    
    // Draw phase labels
    const phaseLabels = getPhaseLabels();
    ctx.font = 'bold 14px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    phaseLabels.forEach(({ phase, t, label }) => {
      const pos = getCyclePosition(t);
      const labelOffset = { ...pos };
      if (phase === 'r') { labelOffset.x -= 0.15; labelOffset.y -= 0.1; }
      if (phase === 'K') { labelOffset.x += 0.18; labelOffset.y -= 0.05; }
      if (phase === 'omega') { labelOffset.x += 0.15; labelOffset.y -= 0.1; }
      if (phase === 'alpha') { labelOffset.x -= 0.15; labelOffset.y += 0.1; }
      
      const proj = project3D(labelOffset, scale, offset, rotationY);
      ctx.fillStyle = PHASES[phase].color;
      ctx.fillText(label, proj.x, proj.y);
    });
    
    // Draw trail
    const trail = trailRef.current;
    if (trail.length > 2) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      for (let i = 2; i < trail.length; i++) {
        const alpha = (i / trail.length) * 0.8;
        const pt = trail[i];
        const prevPt = trail[i - 1];
        const proj = project3D(pt, scale, offset, rotationY);
        const prevProj = project3D(prevPt, scale, offset, rotationY);
        
        ctx.beginPath();
        ctx.moveTo(prevProj.x, prevProj.y);
        ctx.lineTo(proj.x, proj.y);
        ctx.strokeStyle = getPhaseColor(pt.phase, alpha);
        ctx.lineWidth = 1 + alpha * 1.5;
        ctx.stroke();
      }
    }
    
    // Draw current position with glow
    const currentPos = { x: state.connectedness, y: state.potential, z: state.resilience };
    const currentProj = project3D(currentPos, scale, offset, rotationY);
    const phaseColor = PHASES[state.phase].color;
    
    const gradient = ctx.createRadialGradient(
      currentProj.x, currentProj.y, 0,
      currentProj.x, currentProj.y, 25
    );
    gradient.addColorStop(0, phaseColor);
    gradient.addColorStop(0.4, getPhaseColor(state.phase, 0.5));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(currentProj.x, currentProj.y, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(currentProj.x, currentProj.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
  }, [state, paused, rotationY, isDragging]);
  
  useAnimationFrame({
    callback: animationCallback,
    deps: [animationCallback],
    fps: 60,
  });
  
  return (
    <div className="w-screen h-screen bg-[#0a0f10] font-sans text-slate-200 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={900}
        height={700}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ objectFit: 'cover' }}
        onMouseDown={handleMouseDown}
      />
      
      {/* Left Panel */}
      <GlassPanel
        position="top-left"
        width={220}
        accent="teal"
        style={{ background: 'rgba(10, 15, 16, 0.95)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BackButton />
          <span className="text-sm font-semibold">Adaptive Cycle</span>
        </div>
        
        <div className="text-[11px] text-slate-400 leading-relaxed">
          Holling's adaptive cycle describes how complex systems – ecosystems, economies, societies – cycle 
          through phases of growth, rigidity, collapse, and renewal. The cycle you see isn't a 
          predetermined path but an <em className="text-teal-400/80">attractor pattern</em> that emerges 
          as the system moves through its state space.
        </div>
      </GlassPanel>
      
      {/* Right Panel */}
      <GlassPanel
        position="top-right"
        width={260}
        accent="teal"
        style={{ background: 'rgba(10, 15, 16, 0.95)' }}
      >
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">
          Cycle Phases
        </div>
        <PhaseList currentPhase={state.phase} />
        
        <div className="h-px bg-white/10 my-3" />
        
        <div className="text-[10px] text-slate-500 leading-relaxed mb-3">
          <strong className="text-slate-400">Front loop</strong> (r→K): Slow growth and accumulation
          <br />
          <strong className="text-slate-400">Back loop</strong> (Ω→α): Rapid release and renewal
        </div>
        
        <div className="h-px bg-white/10 my-3" />
        
        <AttractorBasin metrics={metrics} />
      </GlassPanel>
      
      {/* Floating Play Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
          <div className="flex justify-center">
            <ButtonGroup gap="sm">
              <Button
                variant="secondary"
                active={paused}
                onClick={() => setPaused(!paused)}
                accent="teal"
                size="sm"
              >
                {paused ? 'Play' : 'Pause'}
              </Button>
              <Button
                variant="secondary"
                onClick={perturb}
                accent="teal"
                size="sm"
                title="Trigger a perturbation (works in K phase)"
              >
                Perturb
              </Button>
              <Button
                variant="secondary"
                onClick={reset}
                accent="teal"
                size="sm"
              >
                Reset
              </Button>
            </ButtonGroup>
          </div>
          <div className="text-[10px] text-slate-500 text-center mt-2">
            Drag to rotate • Auto-rotates when playing
          </div>
        </div>
      </div>
    </div>
  );
}

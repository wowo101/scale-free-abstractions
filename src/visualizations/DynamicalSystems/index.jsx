import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlassPanel, ParameterSlider, Button, ButtonGroup } from '../../components/shared';
import { PositionedTooltip } from '../../components/shared/Tooltip';
import { useDragRotation } from '../../hooks';
import { vec3, computeDerivatives, rk4Step } from './physics';
import { createClassifier } from './classifier';
import { viridis, project3D } from './utils';
import { PRESETS, PARAM_INFO, EXPLANATIONS, ATTRACTOR_COLORS } from './data';
import GuidePanel from './GuidePanel';

export default function AttractorExplorer() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const trajRef = useRef([]);
  const velsRef = useRef([]);
  const stateRef = useRef([1, 1, 1]);
  const classRef = useRef(createClassifier());
  const sliderRefs = useRef({});
  
  const [params, setParams] = useState({ ...PRESETS.strange });
  const [activePreset, setActivePreset] = useState('strange');
  const [autoRotate, setAutoRotate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [info, setInfo] = useState({ type: 'analyzing', confidence: 0 });
  const [showGuide, setShowGuide] = useState(true);
  const [hoveredParam, setHoveredParam] = useState(null);
  const [tooltipY, setTooltipY] = useState(0);
  
  const { rotation, isDragging, handlers, setAutoRotate: setAutoRotateHook } = useDragRotation({
    initialRotation: { x: 0.3, y: 0 },
    autoRotate: autoRotate,
    autoRotateSpeed: 0.3,
  });
  
  // Sync autoRotate state with hook
  useEffect(() => {
    setAutoRotateHook(autoRotate && !isDragging);
  }, [autoRotate, isDragging, setAutoRotateHook]);
  
  const checkPreset = useCallback((p) => {
    for (const [name, pre] of Object.entries(PRESETS)) {
      if (Object.keys(pre).every(k => Math.abs(p[k] - pre[k]) < 0.01)) return name;
    }
    return null;
  }, []);
  
  useEffect(() => { 
    setActivePreset(checkPreset(params)); 
  }, [params, checkPreset]);
  
  const reset = useCallback(() => {
    trajRef.current = [];
    velsRef.current = [];
    stateRef.current = [2 + Math.random(), 0.5 + Math.random(), 0.5 + Math.random()];
    classRef.current = createClassifier();
    setInfo({ type: 'analyzing', confidence: 0 });
  }, []);
  
  const applyPreset = useCallback((name) => {
    setParams({ ...PRESETS[name] });
    setActivePreset(name);
    reset();
  }, [reset]);
  
  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let lastT = 0;
    
    const animate = (t) => {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;
      
      ctx.fillStyle = '#12121f';
      ctx.fillRect(0, 0, W, H);
      
      const scale = 7.5, off = { x: W / 2, y: H / 2 };
      const rot = { rx: rotation.x, ry: rotation.y };
      
      // Draw grid
      ctx.strokeStyle = 'rgba(100,100,140,0.1)';
      ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i++) {
        const x = i * 16;
        let p1 = project3D([x, -40, 0], rot, scale, off);
        let p2 = project3D([x, 40, 0], rot, scale, off);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        p1 = project3D([-40, x, 0], rot, scale, off);
        p2 = project3D([40, x, 0], rot, scale, off);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
      
      // Physics simulation
      if (!paused) {
        for (let i = 0; i < 6; i++) {
          const ns = rk4Step(stateRef.current, params, 0.0025);
          if (ns.some(v => !isFinite(v))) { reset(); break; }
          const vel = vec3.length(computeDerivatives(stateRef.current, params));
          stateRef.current = ns;
          trajRef.current.push([...ns]);
          velsRef.current.push(vel);
          if (trajRef.current.length > 6000) { trajRef.current.shift(); velsRef.current.shift(); }
        }
        if (trajRef.current.length % 60 === 0) {
          setInfo(classRef.current(trajRef.current, velsRef.current, params));
        }
      }
      
      // Draw trajectory
      const traj = trajRef.current, vels = velsRef.current;
      const maxV = Math.max(...vels, 1);
      const proj = traj.map(p => project3D(p, rot, scale, off));
      
      if (proj.length > 1) {
        for (let i = 1; i < proj.length; i++) {
          const a = Math.pow(i / proj.length, 0.7);
          const c = viridis(0.2 + (vels[i] / maxV) * 0.6);
          ctx.beginPath();
          ctx.moveTo(proj[i-1].x, proj[i-1].y);
          ctx.lineTo(proj[i].x, proj[i].y);
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
          ctx.lineWidth = 1.5 + a * 1.5;
          ctx.stroke();
        }
        
        // Current position glow
        const cur = proj[proj.length - 1];
        const grad = ctx.createRadialGradient(cur.x, cur.y, 0, cur.x, cur.y, 12);
        grad.addColorStop(0, 'rgba(80,250,123,0.9)');
        grad.addColorStop(0.5, 'rgba(80,250,123,0.3)');
        grad.addColorStop(1, 'rgba(80,250,123,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cur.x, cur.y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#50fa7b';
        ctx.beginPath(); ctx.arc(cur.x, cur.y, 4, 0, Math.PI * 2); ctx.fill();
      }
      
      // Draw axes
      const axes = [[25,0,0,'X','#ff6b6b'],[0,25,0,'Y','#4ecdc4'],[0,0,25,'Z','#ffe66d']];
      const org = project3D([0,0,0], rot, scale, off);
      axes.forEach(([x,y,z,l,c]) => {
        const e = project3D([x,y,z], rot, scale, off);
        ctx.beginPath(); ctx.moveTo(org.x, org.y); ctx.lineTo(e.x, e.y);
        ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = c; ctx.font = '11px Inter, system-ui'; ctx.fillText(l, e.x + 5, e.y + 5);
      });
      
      animRef.current = requestAnimationFrame(animate);
    };
    
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [params, rotation, paused, reset]);
  
  const handleParamHover = (key) => {
    if (sliderRefs.current[key]?.current) {
      const rect = sliderRefs.current[key].current.getBoundingClientRect();
      setTooltipY(rect.top + rect.height / 2 - 40);
    }
    setHoveredParam(key);
  };
  
  const exp = EXPLANATIONS[info.type] || EXPLANATIONS.analyzing;
  const dotColor = ATTRACTOR_COLORS[info.type] || ATTRACTOR_COLORS.analyzing;
  
  return (
    <div className="w-screen h-screen bg-[#12121f] font-sans text-slate-200 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={900} 
        height={700}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ objectFit: 'cover' }}
        onMouseDown={handlers.onMouseDown}
        onMouseMove={handlers.onMouseMove}
        onMouseUp={handlers.onMouseUp}
        onMouseLeave={handlers.onMouseLeave}
        onTouchStart={handlers.onTouchStart}
        onTouchMove={handlers.onTouchMove}
        onTouchEnd={handlers.onTouchEnd}
      />
      
      {/* Controls Panel */}
      <GlassPanel
        position="top-left"
        width={220}
        accent="green"
        style={{ background: 'rgba(26,26,46,0.95)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
            style={{ background: 'linear-gradient(135deg, #50fa7b, #8be9fd)' }}
          >
            ∞
          </div>
          <span className="text-sm font-semibold">Attractor Explorer</span>
        </div>
        
        {/* Preset buttons */}
        <ButtonGroup gap="sm" className="mb-3.5">
          <Button 
            variant="icon" 
            active={activePreset === 'point'}
            onClick={() => applyPreset('point')}
            title="Point Attractor"
            accent="green"
          >
            ●
          </Button>
          <Button 
            variant="icon" 
            active={activePreset === 'cycle'}
            onClick={() => applyPreset('cycle')}
            title="Limit Cycle"
            accent="green"
          >
            ◯
          </Button>
          <Button 
            variant="icon" 
            active={activePreset === 'strange'}
            onClick={() => applyPreset('strange')}
            title="Strange Attractor"
            accent="green"
          >
            ∿
          </Button>
          <Button 
            variant="icon" 
            active={activePreset === 'unbounded'}
            onClick={() => applyPreset('unbounded')}
            title="Unbounded Growth"
            accent="green"
          >
            ↗
          </Button>
        </ButtonGroup>
        
        <div className="h-px bg-white/10 mb-3.5" />
        
        {/* Parameter sliders */}
        <div className="space-y-3">
          {Object.keys(PARAM_INFO).map(key => (
            <div 
              key={key}
              ref={el => sliderRefs.current[key] = { current: el }}
              onMouseEnter={() => handleParamHover(key)}
              onMouseLeave={() => setHoveredParam(null)}
            >
              <ParameterSlider
                label={PARAM_INFO[key].name}
                value={params[key]}
                onChange={(v) => setParams(p => ({ ...p, [key]: v }))}
                min={0}
                max={key === 'feedback' ? 1 : 1.5}
                step={0.01}
                accent="green"
              />
            </div>
          ))}
        </div>
        
        <div className="h-px bg-white/10 my-3.5" />
        
        {/* Control buttons */}
        <ButtonGroup gap="sm">
          <Button
            variant="secondary"
            active={autoRotate}
            onClick={() => setAutoRotate(!autoRotate)}
            accent="green"
            size="sm"
          >
            Auto
          </Button>
          <Button
            variant="secondary"
            active={paused}
            onClick={() => setPaused(!paused)}
            accent="green"
            size="sm"
          >
            {paused ? 'Play' : 'Pause'}
          </Button>
          <Button
            variant="secondary"
            onClick={reset}
            accent="green"
            size="sm"
          >
            Reset
          </Button>
        </ButtonGroup>
      </GlassPanel>
      
      {/* Parameter Tooltip */}
      {hoveredParam && PARAM_INFO[hoveredParam] && (
        <PositionedTooltip
          content={
            <div>
              <div className="text-xs font-semibold text-green-400 mb-1.5">
                {PARAM_INFO[hoveredParam].name}
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                {PARAM_INFO[hoveredParam].desc}
              </div>
            </div>
          }
          x={260}
          y={tooltipY}
          visible={true}
          accent="green"
        />
      )}
      
      {/* Type indicator */}
      <div 
        className="absolute top-5 glass-panel px-3 py-1.5 flex items-center gap-2"
        style={{ right: showGuide ? 300 : 20, transition: 'right 0.3s' }}
      >
        <div 
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-xs font-medium">{exp.title}</span>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] text-slate-600">
        Drag to rotate • Adjust parameters to change attractor type
      </div>
      
      {/* Guide panel */}
      {showGuide && (
        <GuidePanel 
          attractorType={info.type} 
          onClose={() => setShowGuide(false)} 
        />
      )}
      
      {/* Show guide button */}
      {!showGuide && (
        <button 
          onClick={() => setShowGuide(true)}
          className="absolute right-5 bottom-14 px-3 py-1.5 glass-panel text-[11px] text-slate-400 hover:text-slate-200 transition"
        >
          Show Guide
        </button>
      )}
    </div>
  );
}

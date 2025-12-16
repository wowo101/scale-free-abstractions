import React, { useState, useEffect, useRef, useCallback } from 'react';

const vec3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (v, s) => [v[0] * s, v[1] * s, v[2] * s],
  length: (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
};

// Cycle preset uses Van der Pol oscillator (guaranteed limit cycle)
const PRESETS = {
  point: { coupling: 0.3, driving: 0.2, dissipation: 1.2, nonlinearity: 0.5, feedback: 0.5 },
  cycle: { coupling: 0.1, driving: 0.5, dissipation: 0.3, nonlinearity: 1.0, feedback: 0.0 },
  strange: { coupling: 1.0, driving: 0.8, dissipation: 0.6, nonlinearity: 1.0, feedback: 0.0 },
  unbounded: { coupling: 1.0, driving: 1.5, dissipation: 0.0, nonlinearity: 0.3, feedback: 0.0 }
};

const PARAM_INFO = {
  coupling: { name: 'Coupling (σ)', desc: 'How strongly variables influence each other. High coupling enables complex dynamics through information exchange between state dimensions.' },
  driving: { name: 'Driving (ρ)', desc: 'Energy input to the system. Too high causes unbounded growth; too low causes collapse to equilibrium. Controls distance from criticality.' },
  dissipation: { name: 'Dissipation (β)', desc: 'Energy loss rate. High dissipation → point attractors as energy drains. Low dissipation allows oscillation or chaos to persist.' },
  nonlinearity: { name: 'Nonlinearity', desc: 'Strength of multiplicative terms (x·y, x·z). Essential for limit cycles and strange attractors—without it, only point attractors exist.' },
  feedback: { name: 'Self-Feedback', desc: 'How much each variable dampens itself. Creates self-limiting behavior that can stabilize or destabilize depending on other parameters.' }
};

function computeDerivatives(state, params) {
  const [x, y, z] = state;
  const { coupling, driving, dissipation, nonlinearity, feedback } = params;
  
  // Van der Pol mode: coupling < 0.3 triggers limit cycle oscillator
  const isVanDerPol = coupling < 0.3;
  
  if (isVanDerPol) {
    // Van der Pol oscillator in 3D
    const mu = driving * 4;
    const omega = 0.5 + dissipation;
    const amp = 1 + nonlinearity * 2;
    
    const dx = y * omega;
    const dy = (mu * (1 - (x/amp) * (x/amp)) * y - x) * omega;
    const dz = (x * 0.3 - z * 0.5);
    
    return [dx, dy, dz];
  } else {
    // Lorenz system for strange attractors
    const sigma = coupling * 10;
    const rho = driving * 35;
    const beta = 0.5 + dissipation * 4;
    
    const dx = sigma * (y - x) - feedback * 2 * x * Math.abs(x) * 0.1;
    const dy = x * (rho - nonlinearity * z) - y - feedback * 2 * y * Math.abs(y) * 0.05;
    const dz = nonlinearity * x * y - beta * z;
    return [dx, dy, dz];
  }
}

function rk4Step(state, params, dt) {
  const k1 = computeDerivatives(state, params);
  const k2 = computeDerivatives(vec3.add(state, vec3.scale(k1, dt / 2)), params);
  const k3 = computeDerivatives(vec3.add(state, vec3.scale(k2, dt / 2)), params);
  const k4 = computeDerivatives(vec3.add(state, vec3.scale(k3, dt)), params);
  return [
    state[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    state[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    state[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])
  ];
}

function createClassifier() {
  let history = [];
  let current = 'analyzing';
  let prevMaxExt = 0;
  
  return (traj, vels, params) => {
    if (traj.length < 200) return { type: 'analyzing', confidence: 0 };
    
    const recent = traj.slice(-150);
    const recentVel = vels.slice(-150);
    const avgVel = recentVel.reduce((a, b) => a + b, 0) / recentVel.length;
    const velVar = recentVel.reduce((a, v) => a + (v - avgVel) ** 2, 0) / recentVel.length;
    
    const centroid = recent.reduce((a, p) => vec3.add(a, p), [0, 0, 0]).map(v => v / recent.length);
    const dists = recent.map(p => vec3.length(vec3.sub(p, centroid)));
    const avgDist = dists.reduce((a, b) => a + b, 0) / dists.length;
    const maxExt = Math.max(...traj.slice(-200).map(p => vec3.length(p)));
    
    const isGrowing = maxExt > prevMaxExt * 1.1 && maxExt > 50;
    prevMaxExt = maxExt;
    
    // Check which mode we're in
    const isVanDerPol = params.coupling < 0.3;
    
    // Wing switching (Lorenz signature)
    let hasWingSwitching = false;
    if (!isVanDerPol) {
      const xValues = recent.map(p => p[0]);
      let signChanges = 0;
      for (let i = 1; i < xValues.length; i++) {
        if (xValues[i] * xValues[i-1] < 0) signChanges++;
      }
      hasWingSwitching = signChanges > 2;
    }
    
    let detected = 'transient';
    
    if (maxExt > 60 || isGrowing) {
      detected = 'unbounded';
    } else if (avgVel < 0.5 && avgDist < 2 && velVar < 0.3) {
      detected = 'point';
    } else if (isVanDerPol && avgVel > 0.3) {
      detected = 'limit-cycle';
    } else if (hasWingSwitching) {
      detected = 'strange';
    } else if (avgVel > 0.5 && avgDist > 3) {
      detected = 'strange';
    }
    
    history.push(detected);
    if (history.length > 20) history.shift();
    
    const count = history.filter(t => t === detected).length;
    if (count >= 12 || (detected === current && count >= 5)) {
      current = detected;
    }
    
    return { type: current, confidence: 0.8 };
  };
}

function viridis(t) {
  t = Math.max(0, Math.min(1, t));
  const c = [[68,1,84],[72,35,116],[64,67,135],[52,94,141],[41,120,142],[32,144,140],[34,167,132],[68,190,112],[121,209,81],[189,222,38],[253,231,36]];
  const idx = t * (c.length - 1);
  const i = Math.floor(idx), f = idx - i;
  if (i >= c.length - 1) return c[c.length - 1];
  return [Math.round(c[i][0] + f * (c[i+1][0] - c[i][0])), Math.round(c[i][1] + f * (c[i+1][1] - c[i][1])), Math.round(c[i][2] + f * (c[i+1][2] - c[i][2]))];
}

function project3D(p, rot, scale, off) {
  const x1 = p[0] * Math.cos(rot.ry) - p[2] * Math.sin(rot.ry);
  const z1 = p[0] * Math.sin(rot.ry) + p[2] * Math.cos(rot.ry);
  const y2 = p[1] * Math.cos(rot.rx) - z1 * Math.sin(rot.rx);
  const z2 = p[1] * Math.sin(rot.rx) + z1 * Math.cos(rot.rx);
  const persp = 300 / (300 + z2);
  return { x: off.x + x1 * scale * persp, y: off.y - y2 * scale * persp, z: z2 };
}

function Slider({ label, paramKey, value, onChange, min, max, step, onHover, onLeave, sliderRef }) {
  return (
    <div ref={sliderRef} style={{ marginBottom: 14 }} onMouseEnter={() => onHover(paramKey)} onMouseLeave={onLeave}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: '#a0a0b0', fontSize: 12, cursor: 'help' }}>{label}</span>
        <span style={{ color: '#8be9fd', fontSize: 12 }}>{value.toFixed(2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', height: 4, borderRadius: 2, background: `linear-gradient(to right, #50fa7b ${value/max*100}%, #2d2d44 ${value/max*100}%)`, appearance: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}

function IconBtn({ children, onClick, title, active }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 40, height: 36, borderRadius: 6,
      border: active ? '2px solid #50fa7b' : '1px solid #2d2d44',
      background: active ? 'rgba(80, 250, 123, 0.15)' : '#1a1a2e',
      color: active ? '#50fa7b' : '#a0a0b0',
      fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>{children}</button>
  );
}

function SmallBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: 5, border: 'none',
      background: active ? '#50fa7b' : '#2d2d44',
      color: active ? '#1a1a2e' : '#a0a0b0',
      fontSize: 11, fontWeight: 500, cursor: 'pointer'
    }}>{children}</button>
  );
}

const EXPLANATIONS = {
  'point': { title: 'Point Attractor', desc: 'The system has converged to a fixed point. High dissipation removes energy faster than driving can inject it.', mech: 'Energy loss exceeds input' },
  'limit-cycle': { title: 'Limit Cycle', desc: 'A stable periodic orbit. Nonlinear feedback balances energy loss with driving force, sustaining oscillation.', mech: 'Balanced energy + nonlinearity' },
  'strange': { title: 'Strange Attractor', desc: 'Chaos! Bounded but never repeating. Strong coupling creates stretching and folding—nearby points diverge exponentially.', mech: 'High coupling + nonlinearity' },
  'unbounded': { title: 'Unbounded Growth', desc: 'Energy input overwhelms dissipation. The system escapes to infinity. Reduce driving or increase dissipation to contain it.', mech: 'Driving exceeds capacity' },
  'transient': { title: 'Transient', desc: 'Still settling toward long-term behavior.', mech: 'Awaiting convergence...' },
  'analyzing': { title: 'Analyzing...', desc: 'Gathering trajectory data.', mech: 'Collecting samples' }
};

export default function AttractorExplorer() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const trajRef = useRef([]);
  const velsRef = useRef([]);
  const stateRef = useRef([1, 1, 1]);
  const classRef = useRef(createClassifier());
  
  const sliderRefs = {
    coupling: useRef(null),
    driving: useRef(null),
    dissipation: useRef(null),
    nonlinearity: useRef(null),
    feedback: useRef(null)
  };
  
  const [params, setParams] = useState({ ...PRESETS.strange });
  const [activePreset, setActivePreset] = useState('strange');
  const [rotation, setRotation] = useState({ rx: 0.3, ry: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [info, setInfo] = useState({ type: 'analyzing', confidence: 0 });
  const [showGuide, setShowGuide] = useState(true);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [tooltipTop, setTooltipTop] = useState(0);
  
  const checkPreset = useCallback((p) => {
    for (const [name, pre] of Object.entries(PRESETS)) {
      if (Object.keys(pre).every(k => Math.abs(p[k] - pre[k]) < 0.01)) return name;
    }
    return null;
  }, []);
  
  useEffect(() => { setActivePreset(checkPreset(params)); }, [params, checkPreset]);
  
  useEffect(() => {
    if (hovered && sliderRefs[hovered]?.current) {
      const rect = sliderRefs[hovered].current.getBoundingClientRect();
      setTooltipTop(rect.top + rect.height / 2 - 40);
    }
  }, [hovered]);
  
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
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let lastT = 0, rotY = rotation.ry;
    
    const animate = (t) => {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;
      
      ctx.fillStyle = '#12121f';
      ctx.fillRect(0, 0, W, H);
      
      const scale = 7.5, off = { x: W / 2, y: H / 2 };
      const rot = { rx: rotation.rx, ry: rotY };
      
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
      
      if (!paused) {
        // Half speed, higher resolution for smooth curves
        // dt=0.0025, 6 iter = 0.015 per frame (half of previous 0.03)
        for (let i = 0; i < 6; i++) {
          const ns = rk4Step(stateRef.current, params, 0.0025);
          if (ns.some(v => !isFinite(v))) { reset(); break; }
          const vel = vec3.length(computeDerivatives(stateRef.current, params));
          stateRef.current = ns;
          trajRef.current.push([...ns]);
          velsRef.current.push(vel);
          if (trajRef.current.length > 6000) { trajRef.current.shift(); velsRef.current.shift(); }
        }
        if (trajRef.current.length % 60 === 0) setInfo(classRef.current(trajRef.current, velsRef.current, params));
      }
      
      if (autoRotate && !dragging) rotY += dt * 0.3;
      
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
  }, [params, rotation, autoRotate, paused, dragging, reset]);
  
  const onMouseDown = (e) => { setDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setRotation(r => ({ rx: r.rx + (e.clientY - dragStart.y) * 0.005, ry: r.ry + (e.clientX - dragStart.x) * 0.005 }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  const onMouseUp = () => setDragging(false);
  
  const exp = EXPLANATIONS[info.type] || EXPLANATIONS.analyzing;
  const dotColor = info.type === 'strange' ? '#ff6b6b' : info.type === 'limit-cycle' ? '#50fa7b' : info.type === 'point' ? '#8be9fd' : info.type === 'unbounded' ? '#ffb86c' : '#6272a4';
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#12121f', fontFamily: 'Inter, system-ui', color: '#e0e0e0', overflow: 'hidden' }}>
      <canvas ref={canvasRef} width={900} height={700}
        style={{ width: '100%', height: '100%', cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      />
      
      {/* Controls */}
      <div style={{ position: 'fixed', top: 20, left: 20, width: 220, padding: 16, background: 'rgba(26,26,46,0.95)', borderRadius: 12, border: '1px solid #2d2d44' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #50fa7b, #8be9fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>∞</div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Attractor Explorer</span>
        </div>
        
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <IconBtn title="Point Attractor" active={activePreset === 'point'} onClick={() => applyPreset('point')}>●</IconBtn>
          <IconBtn title="Limit Cycle" active={activePreset === 'cycle'} onClick={() => applyPreset('cycle')}>◯</IconBtn>
          <IconBtn title="Strange Attractor" active={activePreset === 'strange'} onClick={() => applyPreset('strange')}>∿</IconBtn>
          <IconBtn title="Unbounded Growth" active={activePreset === 'unbounded'} onClick={() => applyPreset('unbounded')}>↗</IconBtn>
        </div>
        
        <div style={{ height: 1, background: '#2d2d44', marginBottom: 12 }} />
        
        <Slider label="Coupling (σ)" paramKey="coupling" value={params.coupling} min={0} max={1.5} step={0.01}
          onChange={(v) => setParams(p => ({ ...p, coupling: v }))} onHover={setHovered} onLeave={() => setHovered(null)} sliderRef={sliderRefs.coupling} />
        <Slider label="Driving (ρ)" paramKey="driving" value={params.driving} min={0} max={1.5} step={0.01}
          onChange={(v) => setParams(p => ({ ...p, driving: v }))} onHover={setHovered} onLeave={() => setHovered(null)} sliderRef={sliderRefs.driving} />
        <Slider label="Dissipation (β)" paramKey="dissipation" value={params.dissipation} min={0} max={1.5} step={0.01}
          onChange={(v) => setParams(p => ({ ...p, dissipation: v }))} onHover={setHovered} onLeave={() => setHovered(null)} sliderRef={sliderRefs.dissipation} />
        <Slider label="Nonlinearity" paramKey="nonlinearity" value={params.nonlinearity} min={0} max={1.5} step={0.01}
          onChange={(v) => setParams(p => ({ ...p, nonlinearity: v }))} onHover={setHovered} onLeave={() => setHovered(null)} sliderRef={sliderRefs.nonlinearity} />
        <Slider label="Self-Feedback" paramKey="feedback" value={params.feedback} min={0} max={1} step={0.01}
          onChange={(v) => setParams(p => ({ ...p, feedback: v }))} onHover={setHovered} onLeave={() => setHovered(null)} sliderRef={sliderRefs.feedback} />
        
        <div style={{ height: 1, background: '#2d2d44', margin: '12px 0' }} />
        
        <div style={{ display: 'flex', gap: 6 }}>
          <SmallBtn active={autoRotate} onClick={() => setAutoRotate(!autoRotate)}>Auto</SmallBtn>
          <SmallBtn active={paused} onClick={() => setPaused(!paused)}>{paused ? 'Play' : 'Pause'}</SmallBtn>
          <SmallBtn onClick={reset}>Reset</SmallBtn>
        </div>
      </div>
      
      {/* Tooltip */}
      {hovered && PARAM_INFO[hovered] && (
        <div style={{ 
          position: 'fixed', 
          top: tooltipTop, 
          left: 260, 
          width: 200, 
          padding: 12, 
          background: 'rgba(26,26,46,0.98)', 
          borderRadius: 8, 
          border: '1px solid #50fa7b', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)', 
          zIndex: 100 
        }}>
          <div style={{ color: '#50fa7b', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{PARAM_INFO[hovered].name}</div>
          <div style={{ color: '#a0a0b0', fontSize: 11, lineHeight: 1.5 }}>{PARAM_INFO[hovered].desc}</div>
        </div>
      )}
      
      {/* Type indicator */}
      <svg style={{ position: 'fixed', top: 20, right: showGuide ? 300 : 20, transition: 'right 0.3s', overflow: 'visible' }} width="140" height="30">
        <rect x="0" y="0" width="140" height="30" rx="8" fill="rgba(26,26,46,0.75)" stroke="#2d2d44" strokeWidth="1"/>
        <circle cx="18" cy="15" r="5" fill={dotColor}/>
        <text x="32" y="19" fill="#e0e0e0" fontSize="12" fontWeight="500" fontFamily="Inter, system-ui">{exp.title}</text>
      </svg>
      
      {/* Instructions */}
      <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', color: '#6272a4', fontSize: 11 }}>
        Drag to rotate • Adjust parameters to change attractor type
      </div>
      
      {/* Guide panel */}
      {showGuide && (
        <div style={{ 
          position: 'fixed', 
          top: 20, 
          right: 20, 
          width: 260, 
          padding: 16, 
          background: 'rgba(26,26,46,0.95)', 
          borderRadius: 12, 
          border: '1px solid #2d2d44'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Understanding Attractors</span>
            <button onClick={() => setShowGuide(false)} style={{ background: 'none', border: 'none', color: '#6272a4', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
          </div>
          
          <div style={{ background: '#12121f', padding: 14, borderRadius: 8, border: '1px solid #2d2d44', marginBottom: 14 }}>
            <div style={{ color: dotColor, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{exp.title}</div>
            <div style={{ fontSize: 12, color: '#a0a0b0', lineHeight: 1.5 }}>{exp.desc}</div>
            <div style={{ marginTop: 10, padding: '6px 10px', background: '#1a1a2e', borderRadius: 4, fontSize: 11, color: '#8be9fd' }}><strong>Mechanism:</strong> {exp.mech}</div>
          </div>
          
          <div style={{ height: 1, background: '#2d2d44', marginBottom: 14 }} />
          
          <div style={{ fontSize: 11, color: '#6272a4', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 14 }}>
            The topology of state space fundamentally determines which long-term behaviors are possible—there is no universal path to stability.
          </div>
          
          <div style={{ fontSize: 10, color: '#6272a4' }}>
            Hover over parameters for details
          </div>
        </div>
      )}
      
      {!showGuide && (
        <button onClick={() => setShowGuide(true)} style={{ position: 'fixed', right: 20, bottom: 60, padding: '6px 12px', background: 'rgba(26,26,46,0.95)', border: '1px solid #2d2d44', borderRadius: 6, color: '#a0a0b0', cursor: 'pointer', fontSize: 11 }}>
          Show Guide
        </button>
      )}
    </div>
  );
}

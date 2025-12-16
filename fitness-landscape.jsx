import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';

// Seeded random for reproducibility
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate fitness landscape data
function generateLandscape(params, seed = 42) {
  const { resolution, peakiness, numPeaks, clusterTightness, correlationLength, valleyDepth, asymmetry } = params;
  
  const size = resolution;
  const heights = new Float32Array(size * size);
  const peaks = [];
  let currentSeed = seed;
  
  const numClusters = Math.max(1, Math.floor(numPeaks / 3));
  const clusterCenters = [];
  
  for (let c = 0; c < numClusters; c++) {
    clusterCenters.push({
      x: seededRandom(currentSeed++) * size,
      y: seededRandom(currentSeed++) * size
    });
  }
  
  for (let i = 0; i < numPeaks; i++) {
    const cluster = clusterCenters[Math.floor(seededRandom(currentSeed++) * numClusters)];
    const spread = (1 - clusterTightness) * size * 0.4;
    const angle = seededRandom(currentSeed++) * Math.PI * 2;
    const dist = seededRandom(currentSeed++) * spread;
    
    peaks.push({
      x: (cluster.x + Math.cos(angle) * dist + size) % size,
      y: (cluster.y + Math.sin(angle) * dist + size) % size,
      height: 0.3 + seededRandom(currentSeed++) * 0.7,
      sharpness: peakiness * (0.5 + seededRandom(currentSeed++) * 0.5),
      stretchX: 1 + (seededRandom(currentSeed++) - 0.5) * asymmetry,
      stretchY: 1 + (seededRandom(currentSeed++) - 0.5) * asymmetry,
      rotation: seededRandom(currentSeed++) * Math.PI
    });
  }
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let maxHeight = 0;
      let smoothHeight = 0;
      
      for (const peak of peaks) {
        const dx = i - peak.x;
        const dy = j - peak.y;
        const cos = Math.cos(peak.rotation);
        const sin = Math.sin(peak.rotation);
        const rx = (cos * dx - sin * dy) * peak.stretchX;
        const ry = (sin * dx + cos * dy) * peak.stretchY;
        
        const distSq = rx * rx + ry * ry;
        const sigma = correlationLength * (2 - peak.sharpness) * (size / 64); // Scale sigma with resolution
        const sigmaSq = sigma * sigma;
        const contribution = peak.height * Math.exp(-distSq / (2 * sigmaSq));
        
        maxHeight = Math.max(maxHeight, contribution);
        smoothHeight += contribution * 0.3;
      }
      
      const blendedHeight = peakiness * maxHeight + (1 - peakiness) * Math.min(smoothHeight, 1);
      const finalHeight = blendedHeight * (1 - valleyDepth) + Math.pow(blendedHeight, 1 + valleyDepth) * valleyDepth;
      heights[i * size + j] = finalHeight;
    }
  }
  
  return heights;
}

// Color mapping
function getColor(value, colorScheme) {
  const schemes = {
    viridis: [
      [68, 1, 84], [72, 36, 117], [65, 68, 135], [53, 95, 141],
      [42, 120, 142], [33, 145, 140], [34, 168, 132], [68, 191, 112],
      [122, 209, 81], [189, 223, 38], [253, 231, 37]
    ],
    thermal: [
      [0, 0, 50], [20, 0, 80], [60, 0, 110], [100, 20, 100],
      [140, 40, 70], [180, 60, 40], [220, 100, 20], [240, 150, 30],
      [255, 200, 80], [255, 240, 150]
    ],
    terrain: [
      [40, 70, 120], [50, 120, 100], [70, 150, 80], [120, 170, 80],
      [170, 180, 100], [200, 170, 120], [180, 140, 110], [200, 190, 180],
      [230, 230, 230], [255, 255, 255]
    ]
  };
  
  const colors = schemes[colorScheme] || schemes.viridis;
  const idx = Math.min(value, 0.999) * (colors.length - 1);
  const i = Math.floor(idx);
  const t = idx - i;
  const c1 = colors[i];
  const c2 = colors[Math.min(i + 1, colors.length - 1)];
  
  return [
    Math.round(c1[0] + t * (c2[0] - c1[0])),
    Math.round(c1[1] + t * (c2[1] - c1[1])),
    Math.round(c1[2] + t * (c2[2] - c1[2]))
  ];
}

// Full viewport 3D Surface
function Surface3D({ heights, resolution, colorScheme, rotation, zoom }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2 + height * 0.15;
    const baseScale = (Math.min(width, height) / 1.8) * 2 * zoom;
    const scale = baseScale / resolution;
    
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    
    const transform = (x, y, z) => {
      let rx = x * cosY - z * sinY;
      let rz = x * sinY + z * cosY;
      let ry = y * cosX - rz * sinX;
      rz = y * sinX + rz * cosX;
      return { x: rx, y: ry, z: rz };
    };
    
    const faces = [];
    const step = Math.max(1, Math.floor(resolution / 80));
    
    for (let i = 0; i < resolution - step; i += step) {
      for (let j = 0; j < resolution - step; j += step) {
        const getPoint = (ii, jj) => {
          const x = (jj - resolution / 2) * scale;
          const y = (ii - resolution / 2) * scale;
          const z = heights[ii * resolution + jj] * baseScale * 0.4;
          return transform(x, y, z);
        };
        
        const p1 = getPoint(i, j);
        const p2 = getPoint(i, j + step);
        const p3 = getPoint(i + step, j + step);
        const p4 = getPoint(i + step, j);
        
        const avgHeight = (
          heights[i * resolution + j] +
          heights[i * resolution + j + step] +
          heights[(i + step) * resolution + j + step] +
          heights[(i + step) * resolution + j]
        ) / 4;
        
        const depth = (p1.z + p2.z + p3.z + p4.z) / 4;
        faces.push({ points: [p1, p2, p3, p4], depth, height: avgHeight });
      }
    }
    
    faces.sort((a, b) => a.depth - b.depth);
    
    for (const face of faces) {
      const [r, g, b] = getColor(face.height, colorScheme);
      const light = 0.35 + face.height * 0.65;
      
      ctx.fillStyle = `rgb(${Math.floor(r * light)}, ${Math.floor(g * light)}, ${Math.floor(b * light)})`;
      ctx.strokeStyle = `rgba(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 0.5)}, 0.25)`;
      ctx.lineWidth = 0.5;
      
      ctx.beginPath();
      ctx.moveTo(centerX - face.points[0].x, centerY + face.points[0].y);
      for (let k = 1; k < 4; k++) {
        ctx.lineTo(centerX - face.points[k].x, centerY + face.points[k].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }, [heights, resolution, colorScheme, rotation, zoom]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={1400} 
      height={900} 
      className="w-full h-full object-cover"
    />
  );
}

// 2D Heatmap
function Heatmap({ heights, resolution, colorScheme, zoom }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
    
    const size = Math.max(width, height) * 2 * zoom;
    const offsetX = (width - size) / 2;
    const offsetY = (height - size) / 2 + height * 0.15;
    const cellSize = size / resolution;
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const h = heights[i * resolution + j];
        const [r, g, b] = getColor(h, colorScheme);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(offsetX + j * cellSize, offsetY + i * cellSize, cellSize + 1, cellSize + 1);
      }
    }
  }, [heights, resolution, colorScheme, zoom]);
  
  return <canvas ref={canvasRef} width={1400} height={900} className="w-full h-full object-cover" />;
}

// Contour View
function ContourView({ heights, resolution, colorScheme, zoom }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
    
    const size = Math.max(width, height) * 2 * zoom;
    const offsetX = (width - size) / 2;
    const offsetY = (height - size) / 2 + height * 0.15;
    const cellSize = size / resolution;
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const h = heights[i * resolution + j];
        const [r, g, b] = getColor(h, colorScheme);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(offsetX + j * cellSize, offsetY + i * cellSize, cellSize + 1, cellSize + 1);
      }
    }
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    
    const levels = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    
    for (const level of levels) {
      for (let i = 0; i < resolution - 1; i++) {
        for (let j = 0; j < resolution - 1; j++) {
          const h00 = heights[i * resolution + j];
          const h10 = heights[i * resolution + j + 1];
          const h01 = heights[(i + 1) * resolution + j];
          const h11 = heights[(i + 1) * resolution + j + 1];
          
          const crossings = [];
          
          if ((h00 < level) !== (h10 < level)) {
            const t = (level - h00) / (h10 - h00);
            crossings.push({ x: offsetX + (j + t) * cellSize, y: offsetY + i * cellSize });
          }
          if ((h10 < level) !== (h11 < level)) {
            const t = (level - h10) / (h11 - h10);
            crossings.push({ x: offsetX + (j + 1) * cellSize, y: offsetY + (i + t) * cellSize });
          }
          if ((h01 < level) !== (h11 < level)) {
            const t = (level - h01) / (h11 - h01);
            crossings.push({ x: offsetX + (j + t) * cellSize, y: offsetY + (i + 1) * cellSize });
          }
          if ((h00 < level) !== (h01 < level)) {
            const t = (level - h00) / (h01 - h00);
            crossings.push({ x: offsetX + j * cellSize, y: offsetY + (i + t) * cellSize });
          }
          
          if (crossings.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(crossings[0].x, crossings[0].y);
            ctx.lineTo(crossings[1].x, crossings[1].y);
            ctx.stroke();
          }
        }
      }
    }
  }, [heights, resolution, colorScheme, zoom]);
  
  return <canvas ref={canvasRef} width={1400} height={900} className="w-full h-full object-cover" />;
}

// Parameter info descriptions
const parameterInfo = {
  peakiness: {
    desc: "Controls peak sharpness. Low = smooth rolling hills (Mt. Fuji). High = sharp isolated spikes (Matterhorn).",
    example: "NK model K parameter analog"
  },
  numPeaks: {
    desc: "Number of local optima. More peaks = more ways to get trapped in suboptimal solutions.",
    example: "Protein folding: millions of local minima"
  },
  clusterTightness: {
    desc: "How grouped peaks are. High = peaks form 'mountain ranges' with neutral ridges between them.",
    example: "Modularity in biological systems"
  },
  correlationLength: {
    desc: "Spatial smoothness scale. High = nearby points have similar fitness. Low = chaotic, uncorrelated.",
    example: "Epistasis strength in genetics"
  },
  valleyDepth: {
    desc: "How deep valleys are between peaks. Deep valleys = strong fitness barriers, isolated basins.",
    example: "Speciation barriers in evolution"
  },
  asymmetry: {
    desc: "Peak shape irregularity. High = elongated, ridge-like peaks with directional gradients.",
    example: "Anisotropic selection pressures"
  }
};

// Slider with hover tooltip
function Slider({ label, value, onChange, min, max, step, paramKey, showTooltips }) {
  const [isHovered, setIsHovered] = useState(false);
  const info = parameterInfo[paramKey];
  
  return (
    <div 
      className="mb-2 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-center">
        <label className="text-xs text-slate-400">{label}</label>
        <span className="text-xs text-slate-500 font-mono w-10 text-right">
          {typeof value === 'number' && value % 1 === 0 ? value : value.toFixed(1)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
        style={{ accentColor: '#818cf8' }}
      />
      
      {/* Hover tooltip */}
      {showTooltips && isHovered && info && (
        <div className="absolute left-full top-0 ml-4 w-56 bg-slate-800/85 backdrop-blur-md rounded-lg border border-slate-600/50 shadow-xl p-3 z-50">
          <p className="text-xs text-slate-200 leading-snug mb-1">{info.desc}</p>
          <p className="text-xs text-slate-400 italic">{info.example}</p>
        </div>
      )}
    </div>
  );
}

// Info icon component
function InfoIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );
}

// Stats display
function Stats({ heights, resolution }) {
  const stats = useMemo(() => {
    let sum = 0, localMaxima = 0;
    const n = resolution;
    
    for (let i = 0; i < heights.length; i++) sum += heights[i];
    
    for (let i = 1; i < n - 1; i++) {
      for (let j = 1; j < n - 1; j++) {
        const idx = i * n + j;
        const val = heights[idx];
        if (val > heights[idx - 1] && val > heights[idx + 1] &&
            val > heights[idx - n] && val > heights[idx + n]) {
          localMaxima++;
        }
      }
    }
    
    let gradientSum = 0, count = 0;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - 1; j++) {
        const dx = heights[i * n + j + 1] - heights[i * n + j];
        const dy = heights[(i + 1) * n + j] - heights[i * n + j];
        gradientSum += Math.sqrt(dx * dx + dy * dy);
        count++;
      }
    }
    
    return { localMaxima, ruggedness: (gradientSum / count).toFixed(3), mean: (sum / heights.length).toFixed(2) };
  }, [heights, resolution]);
  
  return (
    <div className="flex gap-3 text-xs">
      <div><span className="text-slate-500">Peaks:</span> <span className="text-indigo-400 font-medium">{stats.localMaxima}</span></div>
      <div><span className="text-slate-500">Rugged:</span> <span className="text-purple-400 font-medium">{stats.ruggedness}</span></div>
    </div>
  );
}

// Strategy info panel
function StrategyInfo({ onClose }) {
  return (
    <div className="absolute bottom-4 right-4 w-80 bg-slate-900/95 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-2xl p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-semibold text-slate-200">Navigation Strategies</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
      </div>
      
      <div className="space-y-3 text-xs text-slate-400">
        <div>
          <h4 className="text-emerald-400 font-medium mb-1">Smooth Landscapes</h4>
          <p>Gradient ascent works optimally. Local information reliably guides toward global optima. Single agents following fitness gradients will find peaks. Evolution proceeds steadily via incremental improvement.</p>
        </div>
        
        <div>
          <h4 className="text-amber-400 font-medium mb-1">Rugged / Peaky Landscapes</h4>
          <p>Gradient followers get trapped in local optima. Requires stochastic jumps, simulated annealing, or population-based search. Recombination can leap between basins. High mutation rates help escape local traps.</p>
        </div>
        
        <div>
          <h4 className="text-rose-400 font-medium mb-1">Clustered Peaks</h4>
          <p>Creates "super-basins" where neutral drift between nearby peaks is possible. Modularity emerges naturally. Stepping-stone evolution can reach higher peaks via intermediate optima.</p>
        </div>
        
        <div>
          <h4 className="text-sky-400 font-medium mb-1">Deep Valleys</h4>
          <p>Fitness barriers isolate populations. Crossing requires coordinated multi-step moves or environmental change. Valley-crossing is the key evolutionary bottleneck—often requires drift through low-fitness intermediates.</p>
        </div>
        
        <div className="pt-2 border-t border-slate-700/50">
          <p className="text-slate-500 italic">The topology of the fitness landscape fundamentally determines which search strategies can succeed—there is no universal optimizer.</p>
        </div>
      </div>
    </div>
  );
}

// Calculate distance between two touch points
function getTouchDistance(touches) {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function FitnessLandscape() {
  const [params, setParams] = useState({
    resolution: 96, // Increased from 64
    peakiness: 0.7,
    numPeaks: 12,
    clusterTightness: 0.5,
    correlationLength: 4,
    valleyDepth: 0.5,
    asymmetry: 0.3
  });
  
  const [colorScheme, setColorScheme] = useState('viridis');
  const [seed, setSeed] = useState(42);
  const [viewMode, setViewMode] = useState('3d');
  const [panelOpen, setPanelOpen] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [showStrategyInfo, setShowStrategyInfo] = useState(true);
  const [rotation, setRotation] = useState({ x: 1.05, y: 0.26 });
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const lastPinchDistanceRef = useRef(0);
  const isPinchingRef = useRef(false);
  
  const heights = useMemo(() => generateLandscape(params, seed), [params, seed]);
  
  const updateParam = (key, value) => setParams(prev => ({ ...prev, [key]: value }));
  
  // Mouse drag for rotation
  const handleMouseDown = useCallback((e) => {
    if (viewMode !== '3d') return;
    setIsDragging(true);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, [viewMode]);
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || viewMode !== '3d') return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    setRotation(prev => ({
      x: Math.max(0.1, Math.min(Math.PI / 2, prev.x - dy * 0.008)),
      y: prev.y - dx * 0.008
    }));
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, viewMode]);
  
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  
  // Mouse wheel for zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  }, []);
  
  // Touch handlers for pinch zoom
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      isPinchingRef.current = true;
      lastPinchDistanceRef.current = getTouchDistance(e.touches);
    } else if (e.touches.length === 1 && viewMode === '3d') {
      setIsDragging(true);
      lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, [viewMode]);
  
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && isPinchingRef.current) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const delta = currentDistance / lastPinchDistanceRef.current;
      setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
      lastPinchDistanceRef.current = currentDistance;
    } else if (e.touches.length === 1 && isDragging && viewMode === '3d') {
      const dx = e.touches[0].clientX - lastMouseRef.current.x;
      const dy = e.touches[0].clientY - lastMouseRef.current.y;
      setRotation(prev => ({
        x: Math.max(0.1, Math.min(Math.PI / 2, prev.x - dy * 0.008)),
        y: prev.y - dx * 0.008
      }));
      lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, [isDragging, viewMode]);
  
  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) {
      isPinchingRef.current = false;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  }, []);
  
  return (
    <div className="w-full h-screen bg-[#0a0a0f] overflow-hidden relative touch-none">
      {/* Full viewport canvas */}
      <div 
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {viewMode === '3d' && (
          <Surface3D heights={heights} resolution={params.resolution}
            colorScheme={colorScheme} rotation={rotation} zoom={zoom} />
        )}
        {viewMode === 'contour' && (
          <ContourView heights={heights} resolution={params.resolution} colorScheme={colorScheme} zoom={zoom} />
        )}
        {viewMode === '2d' && (
          <Heatmap heights={heights} resolution={params.resolution} colorScheme={colorScheme} zoom={zoom} />
        )}
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 bg-slate-900/70 backdrop-blur-sm rounded px-2 py-1 text-xs text-slate-400">
        {Math.round(zoom * 100)}%
      </div>
      
      {/* Floating control panel */}
      <div className={`absolute top-4 left-4 transition-all duration-300 ${panelOpen ? 'w-56' : 'w-auto'}`}>
        <div className="bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-2xl">
          <div 
            className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 cursor-pointer"
            onClick={() => setPanelOpen(!panelOpen)}
          >
            <h1 className="text-sm font-semibold text-slate-200">Fitness Landscape</h1>
            <div className="flex items-center gap-2">
              {panelOpen && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowTooltips(!showTooltips); }}
                  className={`p-0.5 rounded transition ${showTooltips ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Toggle parameter tooltips"
                >
                  <InfoIcon className="w-4 h-4" />
                </button>
              )}
              <button className="text-slate-400 hover:text-slate-200 text-xs">
                {panelOpen ? '−' : '+'}
              </button>
            </div>
          </div>
          
          {panelOpen && (
            <div className="p-3">
              <div className="flex gap-1 mb-3">
                {['3d', 'contour', '2d'].map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition ${
                      viewMode === mode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}>
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
              
              <Slider label="Peakiness" value={params.peakiness} onChange={(v) => updateParam('peakiness', v)}
                min={0.1} max={1} step={0.05} paramKey="peakiness" showTooltips={showTooltips} />
              <Slider label="Peaks" value={params.numPeaks} onChange={(v) => updateParam('numPeaks', Math.round(v))}
                min={3} max={40} step={1} paramKey="numPeaks" showTooltips={showTooltips} />
              <Slider label="Clustering" value={params.clusterTightness} onChange={(v) => updateParam('clusterTightness', v)}
                min={0} max={1} step={0.05} paramKey="clusterTightness" showTooltips={showTooltips} />
              <Slider label="Correlation" value={params.correlationLength} onChange={(v) => updateParam('correlationLength', v)}
                min={1} max={12} step={0.5} paramKey="correlationLength" showTooltips={showTooltips} />
              <Slider label="Valley Depth" value={params.valleyDepth} onChange={(v) => updateParam('valleyDepth', v)}
                min={0} max={1} step={0.05} paramKey="valleyDepth" showTooltips={showTooltips} />
              <Slider label="Asymmetry" value={params.asymmetry} onChange={(v) => updateParam('asymmetry', v)}
                min={0} max={1} step={0.05} paramKey="asymmetry" showTooltips={showTooltips} />
              
              <div className="flex gap-1 mt-3 mb-3">
                {['viridis', 'thermal', 'terrain'].map(scheme => (
                  <button key={scheme} onClick={() => setColorScheme(scheme)}
                    className={`flex-1 px-1 py-1 rounded text-xs capitalize transition ${
                      colorScheme === scheme ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}>
                    {scheme}
                  </button>
                ))}
              </div>
              
              <button onClick={() => setSeed(Math.floor(Math.random() * 10000))}
                className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-medium transition mb-2">
                New Landscape
              </button>
              
              <Stats heights={heights} resolution={params.resolution} />
              
              <button 
                onClick={() => setShowStrategyInfo(!showStrategyInfo)}
                className="w-full mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-400 transition">
                {showStrategyInfo ? 'Hide' : 'Show'} Strategy Guide
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Strategy info panel */}
      {showStrategyInfo && <StrategyInfo onClose={() => setShowStrategyInfo(false)} />}
      
      {/* Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-600">
        {viewMode === '3d' ? 'Drag to rotate • Pinch or scroll to zoom' : 'Pinch or scroll to zoom'}
      </div>
    </div>
  );
}

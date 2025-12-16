import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// =============================================================================
// CLASSIFICATION DATA
// =============================================================================

const COMPLEXITY_CLASSES = {
  I: {
    name: 'Class I — Uniform',
    color: '#71717a',
    rules: [0, 8, 32, 40, 64, 96, 128, 136, 160, 168, 192, 224, 234, 235, 238, 239, 248, 249, 250, 251, 252, 253, 254, 255],
    description: 'Evolution converges to a homogeneous state. All initial information is erased; the system reaches a fixed point attractor regardless of starting conditions.',
  },
  II: {
    name: 'Class II — Periodic',
    color: '#60a5fa',
    rules: [],
    description: 'Evolution produces stable periodic structures or nested patterns. Information is preserved but bounded; future states can be predicted by detecting the cycle length.',
  },
  III: {
    name: 'Class III — Chaotic',
    color: '#f87171',
    rules: [18, 22, 30, 45, 60, 73, 90, 105, 122, 126, 129, 146, 150, 161, 182, 195, 225],
    description: 'Evolution appears random with maximal entropy and high sensitivity to initial conditions. However, many chaotic rules possess hidden mathematical structure (XOR operations, linear recurrences) that permits analytical prediction. High entropy does not imply computational irreducibility.',
  },
  IV: {
    name: 'Class IV — Complex',
    color: '#4ade80',
    rules: [41, 54, 106, 110],
    description: 'Localized structures emerge and interact in intricate ways. Rule 110 is proven capable of universal computation (Cook, 2004)—it can simulate any Turing machine. This implies computational irreducibility: no algorithm can predict step N faster than running all N steps. The system is its own simplest model.',
  }
};

// Compute Class II as everything not in other classes
const allOtherRules = new Set([
  ...COMPLEXITY_CLASSES.I.rules,
  ...COMPLEXITY_CLASSES.III.rules,
  ...COMPLEXITY_CLASSES.IV.rules
]);
for (let i = 0; i < 256; i++) {
  if (!allOtherRules.has(i)) {
    COMPLEXITY_CLASSES.II.rules.push(i);
  }
}

const NOTABLE_RULES = new Set([30, 90, 110, 184, 54, 22, 60, 150, 126, 45, 106]);

const RULE_INFO = {
  30: 'Generates pseudo-randomness from deterministic rules. Used in Mathematica\'s RNG. Found in cone snail shell patterns.',
  90: 'Sierpiński triangle via XOR of neighbors. Despite visual complexity, it has closed-form solutions—not computationally irreducible.',
  110: 'Proven capable of universal computation (Cook, 2004). Can simulate any Turing machine given appropriate initial conditions. Computationally irreducible.',
  184: 'Models traffic flow: particles move right unless blocked. Demonstrates how conservation laws emerge from local rules.',
  54: 'Persistent localized structures ("particles") interact. Strong candidate for universal computation.',
  22: 'Boundary case between periodic and chaotic. Classification can be ambiguous at phase transitions.',
  60: 'Additive rule producing Pascal\'s triangle mod 2. Analytically solvable despite complex appearance.',
  150: 'Three-cell XOR. Related to linear feedback shift registers. Fractal structure but mathematically tractable.',
  126: 'Complex chaotic patterns with some localized structure.',
  45: 'Chaotic with diagonal structures. High sensitivity to boundary conditions.',
  106: 'Exhibits Sierpiński-like triangles and complex interactions. Candidate for Class IV.'
};

const RULE_TO_CLASS = {};
Object.entries(COMPLEXITY_CLASSES).forEach(([key, data]) => {
  data.rules.forEach(r => RULE_TO_CLASS[r] = key);
});

// =============================================================================
// UTILITIES
// =============================================================================

const getRuleBinary = (rule) => rule.toString(2).padStart(8, '0');

const getNextState = (left, center, right, ruleBinary) => {
  const pattern = (left << 2) | (center << 1) | right;
  return parseInt(ruleBinary[7 - pattern], 10);
};

const getClassForRule = (rule) => RULE_TO_CLASS[rule] || 'II';

const computeEntropy = (row) => {
  if (row.length === 0) return 0;
  const p1 = row.reduce((a, b) => a + b, 0) / row.length;
  const p0 = 1 - p1;
  if (p0 === 0 || p1 === 0) return 0;
  return -(p0 * Math.log2(p0) + p1 * Math.log2(p1));
};

const computeBlockEntropy = (row, k = 3) => {
  if (row.length < k) return 0;
  const counts = {};
  for (let i = 0; i <= row.length - k; i++) {
    const block = row.slice(i, i + k).join('');
    counts[block] = (counts[block] || 0) + 1;
  }
  const total = row.length - k + 1;
  let entropy = 0;
  for (const count of Object.values(counts)) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return entropy;
};

const computeDensity = (row) => {
  if (row.length === 0) return 0;
  return row.reduce((a, b) => a + b, 0) / row.length;
};

const formatRule = (n) => n.toString().padStart(3, '0');

const getRandomRuleFromClass = (classKey) => {
  const rules = COMPLEXITY_CLASSES[classKey].rules;
  return rules[Math.floor(Math.random() * rules.length)];
};

// =============================================================================
// COMPONENTS
// =============================================================================

function MetricBar({ value, max, color }) {
  return (
    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CellularAutomataExplorer() {
  const [rule, setRule] = useState(110);
  const [grid, setGrid] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRuleGrid, setShowRuleGrid] = useState(false);
  const [speed] = useState(25);
  
  const canvasRef = useRef(null);
  const gridRef = useRef([]);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const cellSize = 3;

  const ruleBinary = useMemo(() => getRuleBinary(rule), [rule]);
  const ruleClass = useMemo(() => getClassForRule(rule), [rule]);
  const classInfo = useMemo(() => COMPLEXITY_CLASSES[ruleClass], [ruleClass]);
  const ruleInfo = useMemo(() => RULE_INFO[rule], [rule]);

  const metrics = useMemo(() => {
    if (grid.length < 2) return null;
    const lastRow = grid[grid.length - 1];
    return {
      entropy: computeEntropy(lastRow),
      blockEntropy: computeBlockEntropy(lastRow, 3),
      density: computeDensity(lastRow),
    };
  }, [grid]);

  useEffect(() => {
    const updateSize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const initializeGrid = useCallback(() => {
    const w = Math.floor(dimensions.width / cellSize);
    const firstRow = new Array(w).fill(0);
    firstRow[Math.floor(w / 2)] = 1;
    gridRef.current = [firstRow];
    setGrid([firstRow]);
  }, [dimensions]);

  const computeNextGeneration = useCallback(() => {
    const w = Math.floor(dimensions.width / cellSize);
    const maxGen = Math.floor(dimensions.height / cellSize);
    const currentGrid = gridRef.current;
    
    if (currentGrid.length >= maxGen) return false;
    
    const lastRow = currentGrid[currentGrid.length - 1];
    const newRow = new Array(w);
    for (let i = 0; i < w; i++) {
      const left = lastRow[(i - 1 + w) % w];
      const center = lastRow[i];
      const right = lastRow[(i + 1) % w];
      newRow[i] = getNextState(left, center, right, ruleBinary);
    }
    gridRef.current = [...currentGrid, newRow];
    setGrid(gridRef.current);
    return true;
  }, [ruleBinary, dimensions]);

  const runAll = useCallback(() => {
    const w = Math.floor(dimensions.width / cellSize);
    const maxGen = Math.floor(dimensions.height / cellSize);
    let currentGrid = gridRef.current;
    
    while (currentGrid.length < maxGen) {
      const lastRow = currentGrid[currentGrid.length - 1];
      const newRow = new Array(w);
      for (let i = 0; i < w; i++) {
        const left = lastRow[(i - 1 + w) % w];
        const center = lastRow[i];
        const right = lastRow[(i + 1) % w];
        newRow[i] = getNextState(left, center, right, ruleBinary);
      }
      currentGrid = [...currentGrid, newRow];
    }
    gridRef.current = currentGrid;
    setGrid(currentGrid);
    setIsPlaying(false);
  }, [ruleBinary, dimensions]);

  useEffect(() => {
    initializeGrid();
    setIsPlaying(true);
    setShowRuleGrid(false);
  }, [rule, dimensions]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const canContinue = computeNextGeneration();
      if (!canContinue) setIsPlaying(false);
    }, speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, computeNextGeneration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const w = Math.floor(dimensions.width / cellSize);
    const maxGen = Math.floor(dimensions.height / cellSize);
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    grid.forEach((row, gen) => {
      row.forEach((cell, col) => {
        if (cell === 1) {
          ctx.fillStyle = classInfo.color;
          ctx.globalAlpha = 0.5 + 0.5 * (gen / maxGen);
          ctx.fillRect(col * cellSize, gen * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      });
    });
    ctx.globalAlpha = 1;
  }, [grid, classInfo, dimensions]);

  const changeRule = (delta) => {
    setRule(r => Math.min(255, Math.max(0, r + delta)));
  };

  const selectRule = (r) => {
    setRule(r);
    setShowRuleGrid(false);
  };

  const RuleGrid = () => (
    <div className="flex flex-col border-t border-zinc-800 mt-2 pt-2 flex-1 min-h-0 overflow-hidden">
      {/* Legend */}
      <div className="flex gap-2 mb-2 text-[9px] flex-wrap flex-shrink-0">
        {Object.entries(COMPLEXITY_CLASSES).map(([key, data]) => (
          <div key={key} className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-sm" 
              style={{ backgroundColor: data.color + '30', border: `1px solid ${data.color}50` }} 
            />
            <span className="text-zinc-500">{key}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-2 h-2 rounded-sm" style={{ border: '1px solid #eab308' }} />
          <span className="text-zinc-500">notable</span>
        </div>
      </div>
      
      {/* Scrollable grid */}
      <div className="overflow-y-auto flex-1 min-h-0" style={{ scrollbarWidth: 'thin' }}>
        <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
          {Array.from({ length: 256 }, (_, r) => {
            const cls = getClassForRule(r);
            const clsData = COMPLEXITY_CLASSES[cls];
            const isNotable = NOTABLE_RULES.has(r);
            const isCurrent = r === rule;
            
            const bgAlpha = isCurrent ? '60' : '20';
            const borderAlpha = isCurrent ? 'cc' : (isNotable ? '' : '40');
            const borderColor = isNotable ? '#eab308' : clsData.color + borderAlpha;
            
            return (
              <button
                key={r}
                onClick={() => selectRule(r)}
                className="py-0.5 rounded text-[9px] font-mono border transition-transform hover:scale-110"
                style={{ 
                  backgroundColor: clsData.color + bgAlpha,
                  borderColor: borderColor,
                  color: isCurrent ? '#fff' : clsData.color,
                  fontWeight: isCurrent ? '600' : '400'
                }}
              >
                {formatRule(r)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const RuleTable = () => {
    const patterns = ['111', '110', '101', '100', '011', '010', '001', '000'];
    return (
      <div className="flex justify-between gap-1">
        {patterns.map((pattern, idx) => (
          <div key={pattern} className="flex flex-col items-center">
            <div className="flex gap-px mb-1">
              {pattern.split('').map((bit, i) => (
                <div key={i} className={`w-2 h-2 rounded-sm ${bit === '1' ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
              ))}
            </div>
            <div className={`w-2 h-2 rounded-sm ${ruleBinary[idx] === '1' ? 'bg-zinc-300' : 'bg-zinc-700'}`} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-zinc-950">
      <canvas ref={canvasRef} className="absolute inset-0" style={{ imageRendering: 'pixelated' }} />
      
      {/* Rules Box - Top Left */}
      <div 
        className="absolute top-4 left-4 w-72 border border-zinc-800 rounded-lg p-3 z-30 flex flex-col"
        style={{ 
          maxHeight: 'calc(100vh - 32px)',
          background: 'rgba(9, 9, 11, 0.75)',
          backdropFilter: 'blur(16px)'
        }}
      >
        {/* Header */}
        <h1 className="text-sm font-medium text-zinc-100 mb-3 flex-shrink-0">
          Elementary Cellular Automata
        </h1>
        
        {/* Rule Navigation */}
        <div className="flex items-center gap-2 flex-shrink-0" style={{ height: '28px' }}>
          <span className="text-[10px] text-zinc-500">Rule</span>
          <button
            onClick={() => changeRule(-1)}
            disabled={rule === 0}
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded disabled:opacity-30 transition-colors text-base"
          >
            ‹
          </button>
          <input
            type="number"
            min="0"
            max="255"
            value={rule}
            onChange={(e) => setRule(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
            onClick={() => setShowRuleGrid(!showRuleGrid)}
            className="w-12 h-7 bg-zinc-800 border border-zinc-700 rounded px-2 text-center text-sm text-white font-mono focus:outline-none focus:border-zinc-500 cursor-pointer"
          />
          <button
            onClick={() => changeRule(1)}
            disabled={rule === 255}
            className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded disabled:opacity-30 transition-colors text-base"
          >
            ›
          </button>
          <span className="font-mono text-[10px] text-zinc-500 ml-auto">{ruleBinary}</span>
        </div>

        {/* Rule Grid (when open) */}
        {showRuleGrid && <RuleGrid />}

        {/* Rule Details - always visible */}
        <div className="flex-shrink-0">
          <div className="mt-2 pt-2 border-t border-zinc-800">
            <div className="text-[11px] font-medium mb-1" style={{ color: classInfo.color }}>
              Rule {rule}
            </div>
            {ruleInfo && (
              <p className="text-[10px] text-zinc-400 leading-relaxed">{ruleInfo}</p>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-zinc-800">
            <div className="text-[9px] text-zinc-500 mb-1.5">Transition table</div>
            <RuleTable />
          </div>

          {metrics && (
            <div className="mt-2 pt-2 border-t border-zinc-800 space-y-2">
              <div className="text-[9px] text-zinc-500">Metrics</div>
              
              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-500">Entropy</span>
                  <span className="text-zinc-300 font-mono">{metrics.entropy.toFixed(3)}</span>
                </div>
                <MetricBar value={metrics.entropy} max={1} color={classInfo.color} />
                <div className="text-[9px] text-zinc-600">Uncertainty per cell (0 = uniform, 1 = max)</div>
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-500">Block entropy</span>
                  <span className="text-zinc-300 font-mono">{metrics.blockEntropy.toFixed(3)}</span>
                </div>
                <MetricBar value={metrics.blockEntropy} max={3} color={classInfo.color} />
                <div className="text-[9px] text-zinc-600">Local pattern diversity (max ≈ 3 bits)</div>
              </div>

              <div className="space-y-0.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-500">Density</span>
                  <span className="text-zinc-300 font-mono">{metrics.density.toFixed(3)}</span>
                </div>
                <MetricBar value={metrics.density} max={1} color={classInfo.color} />
                <div className="text-[9px] text-zinc-600">Fraction of active cells</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Class Description Box - Top Right */}
      <div 
        className="absolute top-4 right-4 w-80 border border-zinc-800 rounded-lg p-4 z-30"
        style={{ 
          background: 'rgba(9, 9, 11, 0.75)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
          A one-dimensional binary array evolves in discrete steps. Each cell's next state 
          depends on itself and two neighbors—8 configurations, each mapped to 0 or 1, yielding 
          2⁸ = 256 possible rules.
        </p>
        
        <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
          Wolfram classified these rules into four classes based on their long-term behavior 
          and computational properties:
        </p>
        
        <div className="space-y-0.5">
          {Object.entries(COMPLEXITY_CLASSES).map(([key, data]) => {
            const isActive = key === ruleClass;
            return (
              <button
                key={key}
                onClick={() => setRule(getRandomRuleFromClass(key))}
                className={`w-full text-left rounded transition-all ${
                  isActive ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/30'
                }`}
              >
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: data.color }}
                  />
                  <span 
                    className="text-[11px] flex-1"
                    style={{ color: isActive ? data.color : '#a1a1aa' }}
                  >
                    {data.name}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {data.rules.length}
                  </span>
                </div>
                {isActive && (
                  <div className="px-2 pb-2">
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      {data.description}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        <p className="text-[9px] text-zinc-600 mt-3 pt-2 border-t border-zinc-800 leading-relaxed">
          Note: Classification is qualitative. Some rules exhibit boundary behavior, and 
          it is formally undecidable which class an arbitrary rule belongs to.
        </p>
      </div>

      {/* Playback Box - Bottom Center */}
      <div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 border border-zinc-800 rounded-lg px-3 py-2 z-30 flex items-center gap-2"
        style={{ 
          background: 'rgba(9, 9, 11, 0.75)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            isPlaying 
              ? 'bg-zinc-700 text-zinc-100' 
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700'
          }`}
        >
          {isPlaying ? 'pause' : 'play'}
        </button>
        <button
          onClick={computeNextGeneration}
          disabled={isPlaying}
          className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 disabled:opacity-30 rounded text-xs transition-colors"
        >
          step
        </button>
        <button
          onClick={runAll}
          disabled={isPlaying}
          className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 disabled:opacity-30 rounded text-xs transition-colors"
        >
          complete
        </button>
        <button
          onClick={() => { initializeGrid(); setIsPlaying(true); }}
          className="px-3 py-1 bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded text-xs transition-colors"
        >
          reset
        </button>
        
        <div className="w-px h-4 bg-zinc-700 mx-1" />
        
        <div className="text-xs">
          <span className="text-zinc-500">gen </span>
          <span className="text-zinc-300 font-mono">{grid.length}</span>
        </div>
      </div>
    </div>
  );
}

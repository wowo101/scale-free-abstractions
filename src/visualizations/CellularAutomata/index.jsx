import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BackButton, GlassPanel, MetricBar, PlaybackControls, Button } from '../../components/shared';
import { useViewportSize, useAnimationFrame } from '../../hooks';
import { COMPLEXITY_CLASSES, RULE_INFO, getClassForRule, getRandomRuleFromClass } from './data';
import { getRuleBinary, getNextState, computeEntropy, computeBlockEntropy, computeDensity } from './utils';
import RuleGrid from './RuleGrid';
import RuleTable from './RuleTable';

export default function CellularAutomataExplorer() {
  const [rule, setRule] = useState(110);
  const [grid, setGrid] = useState([]);
  const [generation, setGeneration] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRuleGrid, setShowRuleGrid] = useState(false);
  const [speed] = useState(25);
  
  const canvasRef = useRef(null);
  const gridRef = useRef([]);
  const generationRef = useRef(0);
  const { width, height } = useViewportSize();
  
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

  const initializeGrid = useCallback(() => {
    const w = Math.floor(width / cellSize);
    const firstRow = new Array(w).fill(0);
    firstRow[Math.floor(w / 2)] = 1;
    gridRef.current = [firstRow];
    generationRef.current = 1;
    setGeneration(1);
    setGrid([firstRow]);
  }, [width]);

  const computeNextGeneration = useCallback(() => {
    const w = Math.floor(width / cellSize);
    const maxVisible = Math.floor(height / cellSize);
    const currentGrid = gridRef.current;
    
    const lastRow = currentGrid[currentGrid.length - 1];
    const newRow = new Array(w);
    for (let i = 0; i < w; i++) {
      const left = lastRow[(i - 1 + w) % w];
      const center = lastRow[i];
      const right = lastRow[(i + 1) % w];
      newRow[i] = getNextState(left, center, right, ruleBinary);
    }
    
    // Add new row and scroll if needed (keep only visible rows plus a small buffer)
    let newGrid = [...currentGrid, newRow];
    if (newGrid.length > maxVisible) {
      newGrid = newGrid.slice(newGrid.length - maxVisible);
    }
    
    gridRef.current = newGrid;
    generationRef.current += 1;
    setGeneration(generationRef.current);
    setGrid(gridRef.current);
    return true;
  }, [ruleBinary, width, height]);


  useEffect(() => {
    initializeGrid();
    setIsPlaying(true);
    setShowRuleGrid(false);
  }, [rule, width, height]);

  // Animation loop using useAnimationFrame hook
  const animationCallback = useCallback(() => {
    computeNextGeneration();
  }, [computeNextGeneration]);

  useAnimationFrame({
    callback: animationCallback,
    fps: 1000 / speed, // Convert ms interval to FPS
    paused: !isPlaying,
    deps: [animationCallback],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = classInfo.color;
    grid.forEach((row, gen) => {
      row.forEach((cell, col) => {
        if (cell === 1) {
          ctx.fillRect(col * cellSize, gen * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      });
    });
  }, [grid, classInfo, width, height]);

  const changeRule = (delta) => {
    setRule(r => Math.min(255, Math.max(0, r + delta)));
  };

  const selectRule = (r) => {
    setRule(r);
    setShowRuleGrid(false);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0" 
        style={{ imageRendering: 'pixelated' }} 
      />
      
      {/* Rules Box - Top Left */}
      <GlassPanel
        position="top-left"
        width={288}
        accent="zinc"
        style={{ 
          maxHeight: 'calc(100vh - 32px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <BackButton />
          <h1 className="text-sm font-medium text-zinc-100">
            Elementary Cellular Automata
          </h1>
        </div>
        
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
            className="w-12 h-7 bg-zinc-800 border border-zinc-700 rounded px-2 text-center text-sm text-white font-mono focus:outline-none focus:border-zinc-500 cursor-pointer [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
        {showRuleGrid && <RuleGrid currentRule={rule} onSelectRule={selectRule} />}

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
            <RuleTable ruleBinary={ruleBinary} />
          </div>

          {metrics && (
            <div className="mt-2 pt-2 border-t border-zinc-800 space-y-2">
              <div className="text-[9px] text-zinc-500">Metrics</div>
              
              <MetricBar 
                label="Entropy"
                value={metrics.entropy}
                max={1}
                color={classInfo.color}
                description="Uncertainty per cell (0 = uniform, 1 = max)"
              />
              
              <MetricBar 
                label="Block entropy"
                value={metrics.blockEntropy}
                max={3}
                color={classInfo.color}
                description="Local pattern diversity (max ≈ 3 bits)"
              />
              
              <MetricBar 
                label="Density"
                value={metrics.density}
                max={1}
                color={classInfo.color}
                description="Fraction of active cells"
              />
            </div>
          )}
          
          {/* Playback Controls */}
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <PlaybackControls
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onReset={() => { initializeGrid(); setIsPlaying(true); }}
              onStep={computeNextGeneration}
              statusLabel="gen"
              statusValue={generation}
              variant="inline"
              accent="zinc"
            />
          </div>
        </div>
      </GlassPanel>

      {/* Class Description Box - Top Right */}
      <GlassPanel
        position="top-right"
        width={320}
        accent="zinc"
      >
        <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
          A one-dimensional binary array evolves in discrete steps. Each cell's next state 
          depends on itself and two neighbours – 8 configurations, each mapped to 0 or 1, yielding 
          2⁸ = 256 possible rules.
        </p>
        
        <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
          Wolfram classified these rules into four classes based on their long-term behaviour 
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
          Note: Classification is qualitative. Some rules exhibit boundary behaviour, and 
          it is formally undecidable which class an arbitrary rule belongs to.
        </p>
      </GlassPanel>

    </div>
  );
}

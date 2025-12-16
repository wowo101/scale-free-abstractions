import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel, ParameterSlider, Button, ButtonGroup } from '../../components/shared';
import { PositionedTooltip } from '../../components/shared/Tooltip';
import { useViewportSize } from '../../hooks';
import { getBucketIndex, getColorForHeight, stateColors, tooltips, chartTooltipText } from './utils';
import PowerLawChart from './PowerLawChart';
import PhaseGuide from './PhaseGuide';

const GRID_SIZE = 80;
const SPEED = 3;

export default function CriticalitySimulation() {
  // Core parameters
  const [threshold, setThreshold] = useState(4);
  const [dropRate, setDropRate] = useState(3);
  const [dissipation, setDissipation] = useState(0.0);
  
  // UI state
  const [isRunning, setIsRunning] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [showMoreStats, setShowMoreStats] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipY, setTooltipY] = useState(0);
  const [showChartTooltip, setShowChartTooltip] = useState(false);
  
  // Stats
  const [systemState, setSystemState] = useState('Building...');
  const [stats, setStats] = useState({ 
    avalancheSize: 0, 
    avgHeight: 0,
    criticalRatio: 0,
    totalTopples: 0
  });
  const [avalancheHistory, setAvalancheHistory] = useState([]);
  const [sizeDistribution, setSizeDistribution] = useState([0, 0, 0, 0, 0, 0]);
  
  // Refs
  const canvasRef = useRef(null);
  const gridRef = useRef(null);
  const toppledRef = useRef(null);
  const animationRef = useRef(null);
  const avalancheInProgressRef = useRef(false);
  const currentAvalancheSizeRef = useRef(0);
  const frameCountRef = useRef(0);
  const sliderRefs = useRef({});
  
  const { width: viewportWidth, height: viewportHeight } = useViewportSize();
  
  // Calculate canvas size to cover viewport while maintaining square aspect ratio
  const canvasSize = Math.max(viewportWidth, viewportHeight);
  const canvasOffset = {
    x: (viewportWidth - canvasSize) / 2,
    y: (viewportHeight - canvasSize) / 2
  };

  // Initialize grid
  const initializeGrid = useCallback(() => {
    gridRef.current = new Int32Array(GRID_SIZE * GRID_SIZE);
    toppledRef.current = new Uint8Array(GRID_SIZE * GRID_SIZE);
    avalancheInProgressRef.current = false;
    currentAvalancheSizeRef.current = 0;
    setAvalancheHistory([]);
    setSizeDistribution([0, 0, 0, 0, 0, 0]);
    frameCountRef.current = 0;
  }, []);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  // Single topple pass
  const doTopplePass = useCallback(() => {
    const grid = gridRef.current;
    const toppled = toppledRef.current;
    let anyToppled = false;
    
    toppled.fill(0);
    
    const snapshot = new Int32Array(grid);
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const idx = y * GRID_SIZE + x;
        
        if (snapshot[idx] >= threshold) {
          anyToppled = true;
          toppled[idx] = 1;
          currentAvalancheSizeRef.current++;
          
          const grainsToDistribute = 4;
          grid[idx] -= grainsToDistribute;
          
          const giveEach = 1 - dissipation;
          
          if (x > 0) grid[idx - 1] += giveEach;
          if (x < GRID_SIZE - 1) grid[idx + 1] += giveEach;
          if (y > 0) grid[idx - GRID_SIZE] += giveEach;
          if (y < GRID_SIZE - 1) grid[idx + GRID_SIZE] += giveEach;
        }
      }
    }
    
    return anyToppled;
  }, [threshold, dissipation]);

  // Drop grains randomly
  const dropGrains = useCallback((count) => {
    const grid = gridRef.current;
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      grid[y * GRID_SIZE + x] += 1;
    }
  }, []);

  // Calculate statistics
  const calculateStats = useCallback(() => {
    const grid = gridRef.current;
    let total = 0;
    
    for (let i = 0; i < grid.length; i++) {
      total += grid[i];
    }
    
    const avgHeight = total / grid.length;
    const criticalTarget = (threshold - 1) * 0.75;
    const criticalRatio = avgHeight / criticalTarget;
    
    let state;
    if (criticalRatio < 0.6) {
      state = 'Subcritical';
    } else if (criticalRatio < 0.9) {
      state = 'Approaching Critical';
    } else if (criticalRatio < 1.15) {
      state = 'Critical';
    } else {
      state = 'Supercritical';
    }
    
    setSystemState(state);
    setStats(prev => ({
      avalancheSize: prev.avalancheSize,
      avgHeight: Math.round(avgHeight * 100) / 100,
      criticalRatio: Math.round(criticalRatio * 100) / 100,
      totalTopples: prev.totalTopples
    }));
  }, [threshold]);

  // Draw the grid
  const draw = useCallback(() => {
    if (!canvasRef.current || !gridRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const grid = gridRef.current;
    const toppled = toppledRef.current;
    
    const cellSize = canvasSize / GRID_SIZE;
    
    const imageData = ctx.createImageData(canvasSize, canvasSize);
    const data = imageData.data;
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const gridIdx = y * GRID_SIZE + x;
        const height = grid[gridIdx];
        const isToppling = toppled[gridIdx] === 1;
        
        const color = getColorForHeight(height, isToppling, threshold);
        
        const startX = Math.floor(x * cellSize);
        const startY = Math.floor(y * cellSize);
        const endX = Math.floor((x + 1) * cellSize);
        const endY = Math.floor((y + 1) * cellSize);
        
        for (let py = startY; py < endY; py++) {
          for (let px = startX; px < endX; px++) {
            const pixelIdx = (py * canvasSize + px) * 4;
            data[pixelIdx] = color[0];
            data[pixelIdx + 1] = color[1];
            data[pixelIdx + 2] = color[2];
            data[pixelIdx + 3] = 255;
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [threshold, canvasSize]);

  // Main simulation step
  const simulationStep = useCallback(() => {
    if (!gridRef.current) return;
    
    if (avalancheInProgressRef.current) {
      const moreTopples = doTopplePass();
      if (!moreTopples) {
        avalancheInProgressRef.current = false;
        const finalSize = currentAvalancheSizeRef.current;
        
        if (finalSize > 0) {
          setStats(prev => ({
            ...prev,
            avalancheSize: finalSize,
            totalTopples: prev.totalTopples + finalSize
          }));
          
          setAvalancheHistory(prev => {
            const next = [...prev, finalSize];
            return next.slice(-80);
          });
          
          const bucketIdx = getBucketIndex(finalSize);
          setSizeDistribution(prev => {
            const newDist = [...prev];
            newDist[bucketIdx] = (newDist[bucketIdx] || 0) + 1;
            return newDist;
          });
        }
        
        currentAvalancheSizeRef.current = 0;
        toppledRef.current.fill(0);
      }
    } else {
      dropGrains(dropRate);
      
      const grid = gridRef.current;
      let hasUnstable = false;
      for (let i = 0; i < grid.length; i++) {
        if (grid[i] >= threshold) {
          hasUnstable = true;
          break;
        }
      }
      
      if (hasUnstable) {
        avalancheInProgressRef.current = true;
        currentAvalancheSizeRef.current = 0;
        doTopplePass();
      }
    }
    
    calculateStats();
    draw();
  }, [doTopplePass, dropGrains, dropRate, threshold, calculateStats, draw]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;
    
    const baseInterval = 50;
    const frameInterval = baseInterval / SPEED;
    let lastTime = 0;
    
    const animate = (currentTime) => {
      if (currentTime - lastTime >= frameInterval) {
        simulationStep();
        lastTime = currentTime;
        frameCountRef.current++;
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, simulationStep]);

  const handleSliderHover = (key, ref) => {
    if (ref?.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipY(rect.top + rect.height / 2);
    }
    setActiveTooltip(key);
  };

  return (
    <div 
      className="w-screen h-screen bg-[#0a0f1a] overflow-hidden relative font-sans"
    >
      {/* Square canvas that covers viewport */}
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{
          position: 'absolute',
          top: canvasOffset.y,
          left: canvasOffset.x,
          width: canvasSize,
          height: canvasSize
        }}
      />

      {/* Control Panel */}
      <GlassPanel
        position="top-left"
        width={240}
        accent="cyan"
      >
        {/* Title row with info icon */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
              title="Back to Gallery"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-base font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Sandpile Criticality
              </h1>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Self-organized criticality
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold italic font-serif transition-all ${
              showGuide 
                ? 'border-cyan-400/50 bg-cyan-400/20 text-cyan-400' 
                : 'border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10'
            }`}
            title="Show phase guide"
          >
            i
          </button>
        </div>

        {/* System State Indicator */}
        <div 
          className="px-3 py-2 rounded-lg mb-3"
          style={{
            background: `${stateColors[systemState]}15`,
            border: `1px solid ${stateColors[systemState]}30`,
          }}
        >
          <div 
            className="text-sm font-bold font-mono"
            style={{ color: stateColors[systemState] }}
          >
            {systemState}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Ratio: {stats.criticalRatio} (target ≈ 1.0)
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-3 mb-3">
          <div 
            ref={el => sliderRefs.current.threshold = { current: el }}
            onMouseEnter={() => handleSliderHover('threshold', sliderRefs.current.threshold)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <ParameterSlider
              label="Topple Threshold"
              value={threshold}
              onChange={setThreshold}
              min={3}
              max={8}
              step={1}
              accent="cyan"
            />
          </div>
          
          <div 
            ref={el => sliderRefs.current.dropRate = { current: el }}
            onMouseEnter={() => handleSliderHover('dropRate', sliderRefs.current.dropRate)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <ParameterSlider
              label="Grain Drop Rate"
              value={dropRate}
              onChange={setDropRate}
              min={1}
              max={10}
              step={1}
              accent="cyan"
            />
          </div>
          
          <div 
            ref={el => sliderRefs.current.dissipation = { current: el }}
            onMouseEnter={() => handleSliderHover('dissipation', sliderRefs.current.dissipation)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <ParameterSlider
              label="Dissipation"
              value={dissipation}
              onChange={setDissipation}
              min={0}
              max={0.5}
              step={0.1}
              accent="cyan"
            />
          </div>
        </div>

        {/* Power Law Chart */}
        <PowerLawChart 
          sizeDistribution={sizeDistribution}
          systemState={systemState}
          onHover={() => setShowChartTooltip(true)}
          onLeave={() => setShowChartTooltip(false)}
        />
        
        {/* More Stats Toggle */}
        <div 
          onClick={() => setShowMoreStats(!showMoreStats)}
          className="mt-3 text-[11px] text-slate-500 cursor-pointer flex items-center gap-1 select-none hover:text-slate-400"
        >
          <span 
            className="inline-block transition-transform"
            style={{ transform: showMoreStats ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            ▶
          </span>
          {showMoreStats ? 'Less statistics' : 'More statistics'}
        </div>
        
        {/* Extended Stats */}
        {showMoreStats && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Avg Height:</span>
              <span className="text-cyan-400 font-semibold font-mono">{stats.avgHeight}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Last Avalanche:</span>
              <span 
                className="font-semibold font-mono"
                style={{ color: stats.avalancheSize > 50 ? '#fbbf24' : '#a78bfa' }}
              >
                {stats.avalancheSize} cells
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Total Topples:</span>
              <span className="text-green-400 font-semibold font-mono">
                {stats.totalTopples.toLocaleString()}
              </span>
            </div>
            
            {/* Avalanche histogram */}
            {avalancheHistory.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] text-slate-500 mb-1.5">
                  Recent Avalanches
                </div>
                <div className="h-10 bg-black/30 rounded flex items-end p-1 gap-px">
                  {avalancheHistory.slice(-60).map((size, i) => {
                    const maxAv = Math.max(...avalancheHistory, 1);
                    return (
                      <div
                        key={i}
                        className="flex-1 min-w-0.5 rounded-sm"
                        style={{
                          height: `${Math.max(4, (Math.log(size + 1) / Math.log(maxAv + 1)) * 100)}%`,
                          background: size > 100 ? '#ef4444' : size > 20 ? '#fbbf24' : '#22d3ee',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <ButtonGroup gap="md" className="mt-4">
          <Button
            onClick={initializeGrid}
            variant="primary"
            accent="cyan"
            fullWidth
          >
            Reset
          </Button>
          <Button
            onClick={() => setIsRunning(!isRunning)}
            variant="secondary"
            accent={isRunning ? 'rose' : 'green'}
            fullWidth
          >
            {isRunning ? 'Pause' : 'Run'}
          </Button>
        </ButtonGroup>
      </GlassPanel>

      {/* Parameter Tooltip */}
      <PositionedTooltip
        content={activeTooltip ? tooltips[activeTooltip] : null}
        x={280}
        y={tooltipY}
        visible={!!activeTooltip}
        accent="cyan"
      />

      {/* Chart Tooltip */}
      {showChartTooltip && !activeTooltip && (
        <div 
          className="fixed w-64 p-3.5 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-amber-400/30 shadow-tooltip z-50 pointer-events-none whitespace-pre-line text-[11px] text-slate-300 leading-relaxed"
          style={{ left: 280, top: '50%', transform: 'translateY(-50%)' }}
        >
          {chartTooltipText}
        </div>
      )}

      {/* Height Legend */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 glass-panel flex items-center gap-2.5 px-4 py-2.5 text-[11px] z-10">
        <span className="text-slate-300">Height:</span>
        <div className="flex gap-1 items-center">
          <div className="w-3.5 h-3.5 rounded-sm border border-white/10" style={{ background: 'rgb(15,25,45)' }} />
          <span className="text-slate-400">0</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: 'rgb(30,80,120)' }} />
          <span className="text-slate-400">Low</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: 'rgb(80,180,100)' }} />
          <span className="text-slate-400">Mid</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: 'rgb(220,200,50)' }} />
          <span className="text-slate-400">High</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: 'rgb(255,100,100)' }} />
          <span className="text-rose-300">Toppling</span>
        </div>
      </div>

      {/* Phase Guide Panel */}
      {showGuide && <PhaseGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
}

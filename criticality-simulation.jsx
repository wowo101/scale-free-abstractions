import React, { useState, useEffect, useRef, useCallback } from 'react';

const CriticalitySimulation = () => {
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
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const toppledRef = useRef(null);
  const animationRef = useRef(null);
  const avalancheInProgressRef = useRef(false);
  const currentAvalancheSizeRef = useRef(0);
  const frameCountRef = useRef(0);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  
  const GRID_SIZE = 80;
  const SPEED = 3;

  // Geometrically-spaced size buckets (powers of 3)
  // This ensures equal spacing on a log scale
  const SIZE_BUCKETS = [
    { min: 1, max: 1, label: '1', width: 1, midpoint: 1 },
    { min: 2, max: 3, label: '2-3', width: 2, midpoint: 2.5 },
    { min: 4, max: 9, label: '4-9', width: 6, midpoint: 6 },
    { min: 10, max: 27, label: '10-27', width: 18, midpoint: 17 },
    { min: 28, max: 81, label: '28-81', width: 54, midpoint: 50 },
    { min: 82, max: 300, label: '82+', width: 219, midpoint: 150 }
  ];

  // Power law exponent (τ ≈ 1.1 for 2D BTW sandpile avalanche sizes)
  const TAU = 1.1;

  // For log-spaced bins, we plot DENSITY (count/bin_width) to reveal the power law
  // Power law: P(s) ∝ s^(-τ), so density ∝ midpoint^(-τ)
  // On log-log scale: log(density) = -τ * log(midpoint) + const
  // Pre-calculate the expected log-density ratios (normalized to first bucket)
  const POWER_LAW_LOG_DENSITY = SIZE_BUCKETS.map((bucket, i) => {
    // log(density_i / density_0) = -τ * log(midpoint_i / midpoint_0)
    return -TAU * Math.log10(bucket.midpoint / SIZE_BUCKETS[0].midpoint);
  });
  // This should be a straight line: [0, -0.44, -0.86, -1.35, -1.87, -2.39]
  // POWER_LAW_LOG_VALUES ≈ [0, -0.477, -0.954, -1.43, -1.91, -2.39]

  // Get bucket index for a given avalanche size
  const getBucketIndex = (size) => {
    for (let i = 0; i < SIZE_BUCKETS.length; i++) {
      if (size <= SIZE_BUCKETS[i].max) return i;
    }
    return SIZE_BUCKETS.length - 1;
  };

  // Discrete colors for each grain count
  const getColorForHeight = useCallback((height, isToppling, thresh) => {
    if (isToppling) {
      return [255, 100, 100];
    }
    
    if (height === 0) return [15, 25, 45];
    if (height >= thresh) return [255, 50, 50];
    
    const fraction = height / thresh;
    
    if (fraction < 0.25) {
      return [30, 80, 120];
    } else if (fraction < 0.5) {
      return [40, 140, 140];
    } else if (fraction < 0.75) {
      return [80, 180, 100];
    } else {
      return [220, 200, 50];
    }
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate canvas size to cover viewport while maintaining square aspect ratio
  const canvasSize = Math.max(viewportSize.width, viewportSize.height);
  const canvasOffset = {
    x: (viewportSize.width - canvasSize) / 2,
    y: (viewportSize.height - canvasSize) / 2
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

  // Initialize on mount
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
  }, [getColorForHeight, threshold, canvasSize]);

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

  // Reset
  const resetSimulation = () => {
    initializeGrid();
  };

  // State colors
  const stateColors = {
    'Building...': '#64748b',
    'Subcritical': '#22d3ee',
    'Approaching Critical': '#a78bfa',
    'Critical': '#fbbf24',
    'Supercritical': '#ef4444'
  };

  // Tooltip definitions
  const tooltips = {
    threshold: "Number of grains that triggers a cell to collapse and distribute to neighbors. Higher values store more energy before release.",
    dropRate: "Grains randomly added per simulation step—the driving force pushing the system toward criticality.",
    dissipation: "Fraction of energy lost during each topple. High values drain energy and prevent the system from reaching criticality."
  };

  const chartTooltipText = `This log-log chart shows avalanche size distribution as DENSITY (count ÷ bin width). The yellow line is the theoretical power law P(s) ∝ s^(−${TAU}).

At criticality, observed bars should align with this diagonal line. This indicates scale-free behavior: no characteristic size dominates.

Small avalanches are common, large ones rare, but they follow a predictable ratio. This "scale invariance" is why critical systems produce both tiny fluctuations and rare catastrophic cascades from identical dynamics.`;

  // Power Law Distribution Chart
  const PowerLawChart = () => {
    const totalAvalanches = sizeDistribution.reduce((a, b) => a + b, 0);
    
    if (totalAvalanches < 10) {
      return (
        <div 
          style={{ marginTop: '12px', cursor: 'help' }}
          onMouseEnter={() => setShowChartTooltip(true)}
          onMouseLeave={() => setShowChartTooltip(false)}
        >
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            Size Distribution
          </div>
          <div style={{
            height: '100px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#94a3b8'
          }}>
            Collecting data...
          </div>
        </div>
      );
    }
    
    // Calculate DENSITY (count / bin_width) for each bucket
    const densities = sizeDistribution.map((count, i) => count / SIZE_BUCKETS[i].width);
    
    // Normalize densities to first bucket
    const firstDensity = densities[0];
    const observedLogDensity = densities.map(d => {
      if (d <= 0 || firstDensity <= 0) return -4; // Below display range
      return Math.log10(d / firstDensity);
    });
    
    // Define display range for log scale
    const LOG_MIN = -3;  // Corresponds to ratio of 0.001
    const LOG_MAX = 0.5; // Slightly above 1 for headroom
    const LOG_RANGE = LOG_MAX - LOG_MIN;
    
    // Convert log value to height percentage
    const logToHeight = (logVal) => {
      const clamped = Math.max(LOG_MIN, Math.min(LOG_MAX, logVal));
      return ((clamped - LOG_MIN) / LOG_RANGE) * 100;
    };
    
    // Reference line heights (power law is a straight line on log-log)
    const refHeights = POWER_LAW_LOG_DENSITY.map(logToHeight);
    
    // Observed bar heights
    const obsHeights = observedLogDensity.map(logToHeight);
    
    const chartHeight = 70;
    
    // Check if distribution roughly matches power law
    const matchesPowerLaw = firstDensity > 0 && densities.slice(1, 4).every((density, i) => {
      if (density === 0) return true;
      const observedRatio = density / firstDensity;
      const expectedRatio = Math.pow(10, POWER_LAW_LOG_DENSITY[i + 1]);
      return observedRatio >= expectedRatio * 0.3 && observedRatio <= expectedRatio * 3;
    });
    
    return (
      <div 
        style={{ marginTop: '12px', cursor: 'help' }}
        onMouseEnter={() => setShowChartTooltip(true)}
        onMouseLeave={() => setShowChartTooltip(false)}
      >
        <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Size Distribution (density, log scale)
        </div>
        <div style={{
          height: '100px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '4px',
          padding: '8px',
          position: 'relative'
        }}>
          {/* Reference line - should be straight on log-log scale */}
          <svg 
            style={{ 
              position: 'absolute', 
              top: 8, 
              left: 8, 
              right: 8, 
              height: chartHeight,
              width: 'calc(100% - 16px)',
              overflow: 'visible'
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points={refHeights.map((h, i) => {
                const x = ((i + 0.5) / SIZE_BUCKETS.length) * 100;
                const y = 100 - h;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </svg>
          
          {/* Observed bars */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            height: chartHeight,
            position: 'relative',
            zIndex: 1
          }}>
            {sizeDistribution.map((count, i) => {
              const barHeight = obsHeights[i];
              
              return (
                <div key={i} style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}>
                  <div style={{ 
                    fontSize: '8px', 
                    color: '#b0b8c4', 
                    marginBottom: '2px',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    {count > 0 ? count : ''}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(count > 0 ? 3 : 0, barHeight)}%`,
                      background: (systemState === 'Critical' || matchesPowerLaw)
                        ? `linear-gradient(to top, #0891b2, #22d3ee)`
                        : 'linear-gradient(to top, #475569, #64748b)',
                      borderRadius: '2px',
                      transition: 'height 0.3s ease, background 0.5s ease'
                    }}
                  />
                </div>
              );
            })}
          </div>
          
          {/* X-axis labels */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around',
            marginTop: '4px',
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            {SIZE_BUCKETS.map((b, i) => (
              <span key={i} style={{ fontSize: '8px', color: '#94a3b8', flex: 1, textAlign: 'center' }}>
                {b.label}
              </span>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '6px',
          fontSize: '9px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="16" height="8">
              <line x1="0" y1="4" x2="16" y2="4" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span style={{ color: '#b0b8c4' }}>Power law (s<sup>−{TAU}</sup>)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              background: (systemState === 'Critical' || matchesPowerLaw) ? '#22d3ee' : '#64748b',
              borderRadius: '1px'
            }} />
            <span style={{ color: '#b0b8c4' }}>Observed</span>
          </div>
        </div>
      </div>
    );
  };

  // More Stats Section
  const MoreStats = () => {
    if (!showMoreStats) return null;
    
    const maxAv = Math.max(...avalancheHistory, 1);
    const recentHistory = avalancheHistory.slice(-60);
    
    return (
      <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#b0b8c4', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Avg Height:</span>
          <span style={{ fontSize: '11px', color: '#22d3ee', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace" }}>{stats.avgHeight}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#b0b8c4', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Last Avalanche:</span>
          <span style={{ fontSize: '11px', color: stats.avalancheSize > 50 ? '#fbbf24' : '#a78bfa', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace" }}>
            {stats.avalancheSize} cells
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: '#b0b8c4', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Total Topples:</span>
          <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace" }}>
            {stats.totalTopples.toLocaleString()}
          </span>
        </div>
        
        {/* Avalanche histogram */}
        {avalancheHistory.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Recent Avalanches
            </div>
            <div style={{
              height: '40px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '4px',
              gap: '1px'
            }}>
              {recentHistory.map((size, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    minWidth: '2px',
                    height: `${Math.max(4, (Math.log(size + 1) / Math.log(maxAv + 1)) * 100)}%`,
                    background: size > 100 ? '#ef4444' : size > 20 ? '#fbbf24' : '#22d3ee',
                    borderRadius: '1px'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#0a0f1a',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* Square canvas that covers viewport (may overflow) */}
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

      {/* Floating Control Panel */}
      <div 
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '240px',
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          border: '1px solid rgba(34, 211, 238, 0.15)',
          zIndex: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
        onMouseLeave={() => {
          setShowChartTooltip(false);
          setActiveTooltip(null);
        }}
      >
        {/* Title row with info icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <h1 style={{
              fontSize: '16px',
              fontWeight: '600',
              letterSpacing: '0.3px',
              margin: 0,
              background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Sandpile Criticality
            </h1>
            <p style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Self-organized criticality
            </p>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              background: showGuide ? 'rgba(34, 211, 238, 0.2)' : 'transparent',
              color: '#22d3ee',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif'
            }}
            title="Show phase guide"
          >
            i
          </button>
        </div>

        {/* System State Indicator */}
        <div style={{
          padding: '10px 12px',
          background: `rgba(${stateColors[systemState] === '#22d3ee' ? '34,211,238' : 
                            stateColors[systemState] === '#fbbf24' ? '251,191,36' :
                            stateColors[systemState] === '#ef4444' ? '239,68,68' :
                            stateColors[systemState] === '#a78bfa' ? '167,139,250' : '100,116,139'}, 0.15)`,
          borderRadius: '8px',
          border: `1px solid ${stateColors[systemState]}30`,
          marginBottom: '14px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '700',
            color: stateColors[systemState],
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            {systemState}
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
            Ratio: {stats.criticalRatio} (target ≈ 1.0)
          </div>
        </div>

        {/* Parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
          <SliderControl 
            label="Topple Threshold" 
            value={threshold} 
            onChange={setThreshold}
            min={3} max={8} step={1}
            tooltipKey="threshold"
            activeTooltip={activeTooltip}
            setActiveTooltip={setActiveTooltip}
            setTooltipY={setTooltipY}
          />
          
          <SliderControl 
            label="Grain Drop Rate" 
            value={dropRate} 
            onChange={setDropRate}
            min={1} max={10} step={1}
            tooltipKey="dropRate"
            activeTooltip={activeTooltip}
            setActiveTooltip={setActiveTooltip}
            setTooltipY={setTooltipY}
          />
          
          <SliderControl 
            label="Dissipation" 
            value={dissipation} 
            onChange={setDissipation}
            min={0} max={0.5} step={0.1}
            tooltipKey="dissipation"
            activeTooltip={activeTooltip}
            setActiveTooltip={setActiveTooltip}
            setTooltipY={setTooltipY}
          />
        </div>

        {/* Power Law Chart */}
        <PowerLawChart />
        
        {/* More Stats Toggle */}
        <div 
          onClick={() => setShowMoreStats(!showMoreStats)}
          style={{
            marginTop: '10px',
            fontSize: '11px',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            userSelect: 'none'
          }}
        >
          <span style={{ 
            transform: showMoreStats ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'inline-block'
          }}>▶</span>
          {showMoreStats ? 'Less statistics' : 'More statistics'}
        </div>
        
        <MoreStats />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button
            onClick={resetSimulation}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #22d3ee, #0891b2)',
              color: '#0a0f1a',
              transition: 'all 0.2s'
            }}
          >
            Reset
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              background: isRunning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
              color: isRunning ? '#ef4444' : '#22c55e',
              transition: 'all 0.2s'
            }}
          >
            {isRunning ? 'Pause' : 'Run'}
          </button>
        </div>
      </div>

      {/* Parameter Tooltip */}
      {activeTooltip && (
        <div style={{
          position: 'fixed',
          left: '280px',
          top: tooltipY,
          transform: 'translateY(-50%)',
          padding: '10px 14px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(34, 211, 238, 0.3)',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#cbd5e1',
          width: '200px',
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          lineHeight: '1.5',
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            left: '-6px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '6px solid rgba(34, 211, 238, 0.3)'
          }} />
          {tooltips[activeTooltip]}
        </div>
      )}

      {/* Chart Tooltip */}
      {showChartTooltip && !activeTooltip && (
        <div style={{
          position: 'fixed',
          left: '280px',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '14px 16px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#cbd5e1',
          width: '260px',
          zIndex: 999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          lineHeight: '1.6',
          whiteSpace: 'pre-line',
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            left: '-6px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '6px solid rgba(251, 191, 36, 0.3)'
          }} />
          {chartTooltipText}
        </div>
      )}

      {/* Floating Height Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        padding: '10px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: '11px',
        zIndex: 10
      }}>
        <span style={{ color: '#cbd5e1' }}>Height:</span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div style={{ width: '14px', height: '14px', background: 'rgb(15,25,45)', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.1)' }} />
          <span style={{ color: '#b0b8c4' }}>0</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div style={{ width: '14px', height: '14px', background: 'rgb(30,80,120)', borderRadius: '2px' }} />
          <span style={{ color: '#b0b8c4' }}>Low</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div style={{ width: '14px', height: '14px', background: 'rgb(80,180,100)', borderRadius: '2px' }} />
          <span style={{ color: '#b0b8c4' }}>Mid</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div style={{ width: '14px', height: '14px', background: 'rgb(220,200,50)', borderRadius: '2px' }} />
          <span style={{ color: '#b0b8c4' }}>High</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div style={{ width: '14px', height: '14px', background: 'rgb(255,100,100)', borderRadius: '2px' }} />
          <span style={{ color: '#f0a0a0' }}>Toppling</span>
        </div>
      </div>

      {/* Floating Phase Guide Panel */}
      {showGuide && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '280px',
          padding: '16px',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          border: '1px solid rgba(34, 211, 238, 0.15)',
          zIndex: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#e2e8f0' }}>Phase Guide</h2>
            <button
              onClick={() => setShowGuide(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '2px 6px',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px', lineHeight: '1.55' }}>
            
            <Section 
              title="Subcritical" 
              color="#22d3ee"
              content="System building up. Mostly dark cells with scattered bright spots. Small, localized avalanches."
            />
            
            <Section 
              title="Critical" 
              color="#fbbf24"
              content="Edge of chaos. Uniform texture—most cells near threshold. Scale-free behavior: avalanches of all sizes, power-law distributed."
            />
            
            <Section 
              title="Supercritical" 
              color="#ef4444"
              content="Constant collapse. Red flashing as cells continuously topple. Transient—settles to critical state."
            />

          </div>
        </div>
      )}
    </div>
  );
};

// Slider Component with Tooltip
const SliderControl = ({ label, value, onChange, min, max, step, tooltipKey, activeTooltip, setActiveTooltip, setTooltipY }) => {
  const ref = useRef(null);
  
  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipY(rect.top + rect.height / 2);
    }
    setActiveTooltip(tooltipKey);
  };
  
  return (
    <div 
      ref={ref}
      style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setActiveTooltip(null)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ 
          fontSize: '11px', 
          color: '#cbd5e1', 
          cursor: 'help',
          borderBottom: '1px dotted #64748b'
        }}>
          {label}
        </span>
        <span style={{ fontSize: '11px', color: '#22d3ee', fontWeight: '600', fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          height: '5px',
          borderRadius: '3px',
          background: 'rgba(255,255,255,0.1)',
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          appearance: 'none'
        }}
      />
    </div>
  );
};

// Section Component
const Section = ({ title, color, content }) => (
  <div>
    <h3 style={{ 
      fontSize: '12px', 
      fontWeight: '600', 
      color: color, 
      marginBottom: '5px',
      marginTop: 0 
    }}>
      {title}
    </h3>
    {content && <p style={{ margin: 0, color: '#b0b8c4' }}>{content}</p>}
  </div>
);

export default CriticalitySimulation;

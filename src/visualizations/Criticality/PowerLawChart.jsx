import React from 'react';
import { SIZE_BUCKETS, TAU, POWER_LAW_LOG_DENSITY } from './utils';

export default function PowerLawChart({ 
  sizeDistribution, 
  systemState, 
  onHover,
  onLeave,
}) {
  const totalAvalanches = sizeDistribution.reduce((a, b) => a + b, 0);
  
  if (totalAvalanches < 10) {
    return (
      <div 
        className="mt-3 cursor-help"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        <div className="text-[11px] text-slate-400 mb-1.5 font-sans">
          Size Distribution
        </div>
        <div className="h-24 bg-black/30 rounded flex items-center justify-center text-[10px] text-slate-500">
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
    if (d <= 0 || firstDensity <= 0) return -4;
    return Math.log10(d / firstDensity);
  });
  
  // Define display range for log scale
  const LOG_MIN = -3;
  const LOG_MAX = 0.5;
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
  
  const isHighlighted = systemState === 'Critical' || matchesPowerLaw;
  
  return (
    <div 
      className="mt-3 cursor-help"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="text-[11px] text-slate-400 mb-1.5 font-sans">
        Size Distribution (density, log scale)
      </div>
      <div className="h-24 bg-black/30 rounded p-2 relative">
        {/* Reference line */}
        <svg 
          className="absolute top-2 left-2 right-2 overflow-visible"
          style={{ height: chartHeight, width: 'calc(100% - 16px)' }}
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
        <div 
          className="flex items-end gap-1.5 relative z-10"
          style={{ height: chartHeight }}
        >
          {sizeDistribution.map((count, i) => {
            const barHeight = obsHeights[i];
            
            return (
              <div 
                key={i} 
                className="flex-1 flex flex-col items-center justify-end h-full"
              >
                <div className="text-[8px] text-slate-400 mb-0.5 font-mono">
                  {count > 0 ? count : ''}
                </div>
                <div
                  className="w-full rounded-sm transition-all duration-300"
                  style={{
                    height: `${Math.max(count > 0 ? 3 : 0, barHeight)}%`,
                    background: isHighlighted
                      ? 'linear-gradient(to top, #0891b2, #22d3ee)'
                      : 'linear-gradient(to top, #475569, #64748b)',
                  }}
                />
              </div>
            );
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-around mt-1 font-mono">
          {SIZE_BUCKETS.map((b, i) => (
            <span key={i} className="text-[8px] text-slate-500 flex-1 text-center">
              {b.label}
            </span>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-1.5 text-[9px] font-sans">
        <div className="flex items-center gap-1">
          <svg width="16" height="8">
            <line x1="0" y1="4" x2="16" y2="4" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="text-slate-400">Power law (s<sup>−{TAU}</sup>)</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className="w-2 h-2 rounded-sm"
            style={{ background: isHighlighted ? '#22d3ee' : '#64748b' }}
          />
          <span className="text-slate-400">Observed</span>
        </div>
      </div>
    </div>
  );
}

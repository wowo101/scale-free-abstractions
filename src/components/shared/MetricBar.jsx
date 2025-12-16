import React from 'react';
import { getAccent } from '../../styles/theme';

export default function MetricBar({
  value,
  max,
  label = null,
  showValue = true,
  formatValue = null,
  description = null,
  color = null,
  accent = 'cyan',
  height = 'sm',
  animated = true,
}) {
  const accentColors = getAccent(accent);
  const barColor = color || accentColors.primary;
  
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const defaultFormat = (v) => {
    if (v >= 100) return Math.round(v).toString();
    if (v >= 10) return v.toFixed(1);
    return v.toFixed(3);
  };
  
  const displayValue = formatValue ? formatValue(value) : defaultFormat(value);
  
  const heightClasses = {
    sm: 'h-1',
    md: 'h-1.5',
  };
  
  return (
    <div className="space-y-1">
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-[11px] text-slate-500">{label}</span>
          )}
          {showValue && (
            <span className="text-[11px] text-slate-300 font-mono">{displayValue}</span>
          )}
        </div>
      )}
      
      <div className={`${heightClasses[height]} bg-slate-800 rounded-full overflow-hidden`}>
        <div 
          className={`h-full rounded-full ${animated ? 'transition-all duration-300' : ''}`}
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: barColor,
          }}
        />
      </div>
      
      {description && (
        <div className="text-[9px] text-slate-600 leading-relaxed">
          {description}
        </div>
      )}
    </div>
  );
}

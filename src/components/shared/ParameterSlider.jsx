import React, { useState, useRef } from 'react';
import { getAccent } from '../../styles/theme';
import Tooltip from './Tooltip';

export default function ParameterSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue = null,
  showValue = true,
  tooltip = null,
  tooltipPosition = 'right',
  accent = 'cyan',
  size = 'md',
  id = null,
  disabled = false,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef(null);
  const accentColors = getAccent(accent);
  
  // Auto-format: integers stay as-is, floats get decimal places
  const defaultFormat = (v) => {
    if (Number.isInteger(step) && step >= 1) {
      return Math.round(v).toString();
    }
    const decimals = step < 0.1 ? 2 : 1;
    return v.toFixed(decimals);
  };
  
  const displayValue = formatValue ? formatValue(value) : defaultFormat(value);
  
  const labelSize = size === 'sm' ? 'text-[11px]' : 'text-xs';
  const valueSize = size === 'sm' ? 'text-[11px]' : 'text-xs';
  
  const sliderContent = (
    <div 
      ref={sliderRef}
      className={`relative ${disabled ? 'opacity-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-center mb-1.5">
        <label 
          htmlFor={id}
          className={`${labelSize} text-slate-400 ${tooltip ? 'cursor-help border-b border-dotted border-slate-600' : ''}`}
        >
          {label}
        </label>
        {showValue && (
          <span 
            className={`${valueSize} font-mono font-medium`}
            style={{ color: accentColors.primary }}
          >
            {displayValue}
          </span>
        )}
      </div>
      
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-1"
        style={{ 
          '--slider-accent': accentColors.primary,
        }}
      />
    </div>
  );
  
  // If tooltip provided, wrap in Tooltip component
  if (tooltip) {
    const tooltipContent = typeof tooltip === 'string' 
      ? tooltip 
      : (
        <div>
          {tooltip.title && (
            <div 
              className="text-xs font-semibold mb-1"
              style={{ color: accentColors.primary }}
            >
              {tooltip.title}
            </div>
          )}
          {tooltip.description && (
            <div className="text-[11px] text-slate-300 leading-relaxed">
              {tooltip.description}
            </div>
          )}
          {tooltip.example && (
            <div className="text-[10px] text-slate-400 italic mt-1">
              {tooltip.example}
            </div>
          )}
        </div>
      );
    
    return (
      <Tooltip 
        content={tooltipContent} 
        visible={isHovered}
        position={tooltipPosition}
        accent={accent}
      >
        {sliderContent}
      </Tooltip>
    );
  }
  
  return sliderContent;
}

import React from 'react';
import { getAccent } from '../../styles/theme';

export default function Tooltip({
  children,
  content,
  visible = false,
  position = 'right',
  accent = 'cyan',
  className = '',
}) {
  const accentColors = getAccent(accent);
  
  if (!content) return children;
  
  const positionClasses = {
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  };
  
  const arrowClasses = {
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[6px] border-y-[6px] border-y-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[6px] border-y-[6px] border-y-transparent',
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[6px] border-x-[6px] border-x-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[6px] border-x-[6px] border-x-transparent',
  };
  
  const arrowBorderStyle = {
    right: { borderRightColor: accentColors.border },
    left: { borderLeftColor: accentColors.border },
    top: { borderTopColor: accentColors.border },
    bottom: { borderBottomColor: accentColors.border },
  };
  
  return (
    <div className="relative">
      {children}
      
      {visible && (
        <div 
          className={`
            absolute ${positionClasses[position]}
            w-52 p-3
            bg-slate-900/95 backdrop-blur-sm
            rounded-lg border
            shadow-tooltip
            z-50
            pointer-events-none
            ${className}
          `}
          style={{ borderColor: accentColors.border }}
        >
          {/* Arrow */}
          <div 
            className={`absolute w-0 h-0 ${arrowClasses[position]}`}
            style={arrowBorderStyle[position]}
          />
          
          {content}
        </div>
      )}
    </div>
  );
}

// Standalone positioned tooltip (for complex positioning scenarios)
export function PositionedTooltip({
  content,
  x,
  y,
  visible = false,
  accent = 'cyan',
}) {
  const accentColors = getAccent(accent);
  
  if (!visible || !content) return null;
  
  return (
    <div 
      className="fixed w-52 p-3 bg-slate-900/95 backdrop-blur-sm rounded-lg border shadow-tooltip z-[1000] pointer-events-none"
      style={{ 
        left: x, 
        top: y,
        transform: 'translateY(-50%)',
        borderColor: accentColors.border,
      }}
    >
      {content}
    </div>
  );
}

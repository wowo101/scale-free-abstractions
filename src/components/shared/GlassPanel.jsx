import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAccent } from '../../styles/theme';

const positionStyles = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export default function GlassPanel({
  children,
  position = null,
  className = '',
  style = {},
  width = 'auto',
  maxHeight = null,
  variant = 'default',
  accent = 'cyan',
  collapsible = false,
  defaultCollapsed = false,
  title = null,
  onToggle = null,
  headerActions = null,
  backLink = null,
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const accentColors = getAccent(accent);
  
  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };
  
  const baseClasses = `
    glass-panel
    ${position ? `absolute ${positionStyles[position]}` : ''}
    ${variant === 'compact' ? 'p-2' : 'p-4'}
    ${variant === 'floating' ? 'shadow-lg' : ''}
    z-30
  `.trim().replace(/\s+/g, ' ');
  
  const computedStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    maxHeight: maxHeight || undefined,
    borderColor: accentColors.border,
    ...style,
  };
  
  // Simple panel without header
  if (!title && !collapsible) {
    return (
      <div className={`${baseClasses} ${className}`} style={computedStyle}>
        {children}
      </div>
    );
  }
  
  // Panel with header
  return (
    <div className={`${baseClasses} ${className}`} style={computedStyle}>
      <div 
        className={`flex items-center justify-between ${collapsible ? 'cursor-pointer' : ''} ${isCollapsed ? '' : 'mb-3'}`}
        onClick={collapsible ? handleToggle : undefined}
      >
        <div className="flex items-center gap-2">
          {backLink && (
            <Link
              to={backLink}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
              title="Back to Gallery"
              onClick={(e) => e.stopPropagation()}
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <h2 
            className="text-sm font-semibold"
            style={{ color: accentColors.primary }}
          >
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          {collapsible && (
            <button 
              className="text-slate-400 hover:text-slate-200 text-xs w-5 h-5 flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); handleToggle(); }}
            >
              {isCollapsed ? '+' : '−'}
            </button>
          )}
        </div>
      </div>
      
      {!isCollapsed && children}
    </div>
  );
}

// Subcomponent for consistent section dividers
GlassPanel.Divider = function Divider({ className = '' }) {
  return <div className={`h-px bg-white/10 my-3 ${className}`} />;
};

// Subcomponent for section titles within panels
GlassPanel.Section = function Section({ title, children, className = '' }) {
  return (
    <div className={className}>
      {title && (
        <div className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

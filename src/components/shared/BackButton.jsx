import React from 'react';
import { Link } from 'react-router-dom';
import { getAccent } from '../../styles/theme';

export default function BackButton({ 
  to = '/', 
  accent = 'cyan',
  className = '',
}) {
  const accentColors = getAccent(accent);
  
  return (
    <Link
      to={to}
      className={`
        absolute top-4 left-4 z-40
        w-10 h-10 rounded-lg
        glass-panel
        flex items-center justify-center
        text-slate-400 hover:text-slate-200
        transition-all duration-150
        hover:scale-105
        ${className}
      `}
      style={{ borderColor: accentColors.border }}
      title="Back to Gallery"
    >
      <svg 
        width="20" 
        height="20" 
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
  );
}

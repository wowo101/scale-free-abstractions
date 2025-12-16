import React from 'react';
import { Link } from 'react-router-dom';
import { getAccent } from '../../styles/theme';

export default function GalleryCard({
  title,
  subtitle,
  description,
  tags,
  accent,
  route,
  gradient,
  compact = false,
}) {
  const accentColors = getAccent(accent);
  
  if (compact) {
    return (
      <Link 
        to={route}
        className="group block glass-panel p-3 transition-all duration-200 hover:scale-[1.02]"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-start gap-3">
          {/* Small gradient preview */}
          <div 
            className={`w-10 h-10 rounded-md bg-gradient-to-br ${gradient} opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0 flex items-center justify-center`}
          >
            <span className="text-white/70 text-sm">
              {accent === 'zinc' && '▦'}
              {accent === 'green' && '∿'}
              {accent === 'cyan' && '◈'}
              {accent === 'indigo' && '⛰'}
            </span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 
              className="text-sm font-medium mb-0.5 group-hover:text-white transition-colors truncate"
              style={{ color: accentColors.primary }}
            >
              {title}
            </h3>
            <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
              {description}
            </p>
          </div>
          
          {/* Arrow */}
          <svg 
            className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-0.5"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </Link>
    );
  }
  
  // Full card (kept for potential future use)
  return (
    <Link 
      to={route}
      className="group block glass-panel p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative"
      style={{ 
        '--card-accent': accentColors.primary,
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Gradient preview area */}
      <div 
        className={`h-32 rounded-lg mb-4 bg-gradient-to-br ${gradient} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center relative overflow-hidden`}
      >
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
        </div>
        
        {/* Icon/symbol */}
        <div className="text-4xl text-white/80 group-hover:scale-110 transition-transform">
          {accent === 'zinc' && '▦'}
          {accent === 'green' && '∿'}
          {accent === 'cyan' && '◈'}
          {accent === 'indigo' && '⛰'}
        </div>
      </div>
      
      {/* Content */}
      <div>
        <h3 
          className="text-lg font-semibold mb-0.5 group-hover:text-white transition-colors"
          style={{ color: accentColors.primary }}
        >
          {title}
        </h3>
        <p className="text-xs text-slate-500 mb-2">{subtitle}</p>
        <p className="text-sm text-slate-400 leading-relaxed mb-3">
          {description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-0.5 text-[10px] rounded-full bg-white/5 text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Hover arrow */}
      <div 
        className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
        style={{ backgroundColor: accentColors.primary + '20' }}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={accentColors.primary}
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

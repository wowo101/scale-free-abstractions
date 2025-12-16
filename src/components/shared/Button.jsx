import React from 'react';
import { getAccent } from '../../styles/theme';

export default function Button({
  children,
  onClick,
  variant = 'secondary',
  size = 'md',
  active = false,
  disabled = false,
  accent = 'cyan',
  fullWidth = false,
  icon = null,
  title = null,
  className = '',
}) {
  const accentColors = getAccent(accent);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };
  
  const baseClasses = `
    rounded-md font-medium
    transition-all duration-150
    flex items-center justify-center gap-1.5
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(135deg, ${accentColors.primary}, ${accentColors.secondary})`,
          color: '#0a0a0f',
          border: 'none',
        };
      
      case 'secondary':
        return {
          background: active ? `${accentColors.primary}20` : 'rgba(255, 255, 255, 0.05)',
          color: active ? accentColors.primary : '#94a3b8',
          border: `1px solid ${active ? accentColors.border : 'rgba(255, 255, 255, 0.1)'}`,
        };
      
      case 'ghost':
        return {
          background: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          color: active ? accentColors.primary : '#94a3b8',
          border: 'none',
        };
      
      case 'icon':
        return {
          background: active ? `${accentColors.primary}20` : 'rgba(255, 255, 255, 0.05)',
          color: active ? accentColors.primary : '#94a3b8',
          border: active ? `2px solid ${accentColors.primary}` : '1px solid rgba(255, 255, 255, 0.1)',
          width: size === 'sm' ? '32px' : size === 'lg' ? '44px' : '36px',
          height: size === 'sm' ? '32px' : size === 'lg' ? '44px' : '36px',
          padding: 0,
        };
      
      default:
        return {};
    }
  };
  
  const variantStyles = getVariantStyles();
  const sizeClass = variant === 'icon' ? '' : sizeClasses[size];
  
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${sizeClass}`}
      style={variantStyles}
    >
      {icon}
      {children}
    </button>
  );
}

// Button group for related actions
export function ButtonGroup({ children, gap = 'sm', className = '' }) {
  const gapClasses = {
    sm: 'gap-1.5',
    md: 'gap-2',
    lg: 'gap-3',
  };
  
  return (
    <div className={`flex ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

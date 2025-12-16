// Design tokens for Scale-Free Abstractions Explorer

export const colors = {
  // Backgrounds
  canvas: '#0a0a0f',
  panelBg: 'rgba(15, 20, 30, 0.85)',
  panelBgSolid: '#0f141e',
  
  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderMuted: 'rgba(255, 255, 255, 0.12)',
  borderAccent: 'rgba(34, 211, 238, 0.25)',
  
  // Text
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Accent palette (per-visualization theming)
  accents: {
    cyan: { 
      primary: '#22d3ee', 
      secondary: '#0891b2', 
      glow: 'rgba(34, 211, 238, 0.3)',
      border: 'rgba(34, 211, 238, 0.25)',
    },
    green: { 
      primary: '#50fa7b', 
      secondary: '#22c55e', 
      glow: 'rgba(80, 250, 123, 0.3)',
      border: 'rgba(80, 250, 123, 0.25)',
    },
    indigo: { 
      primary: '#818cf8', 
      secondary: '#6366f1', 
      glow: 'rgba(129, 140, 248, 0.3)',
      border: 'rgba(129, 140, 248, 0.25)',
    },
    amber: { 
      primary: '#fbbf24', 
      secondary: '#f59e0b', 
      glow: 'rgba(251, 191, 36, 0.3)',
      border: 'rgba(251, 191, 36, 0.25)',
    },
    rose: { 
      primary: '#f43f5e', 
      secondary: '#e11d48', 
      glow: 'rgba(244, 63, 94, 0.3)',
      border: 'rgba(244, 63, 94, 0.25)',
    },
    zinc: {
      primary: '#a1a1aa',
      secondary: '#71717a',
      glow: 'rgba(161, 161, 170, 0.3)',
      border: 'rgba(161, 161, 170, 0.25)',
    },
  },
  
  // Semantic colors
  success: '#22c55e',
  warning: '#fbbf24',
  error: '#ef4444',
  info: '#22d3ee',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
};

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: '10px',
    sm: '11px',
    base: '12px',
    md: '13px',
    lg: '14px',
    xl: '16px',
    xxl: '20px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const effects = {
  blur: {
    sm: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
  },
  shadow: {
    panel: '0 8px 32px rgba(0, 0, 0, 0.4)',
    tooltip: '0 4px 20px rgba(0, 0, 0, 0.5)',
    glow: (color) => `0 0 20px ${color}`,
  },
  transition: {
    fast: 'all 0.15s ease',
    normal: 'all 0.2s ease',
    slow: 'all 0.3s ease',
  },
};

export const radii = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
};

// Helper to get accent colors by name
export function getAccent(name) {
  return colors.accents[name] || colors.accents.cyan;
}

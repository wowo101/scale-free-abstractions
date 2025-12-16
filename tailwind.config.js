/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0a0a0f',
        panel: {
          DEFAULT: 'rgba(15, 20, 30, 0.85)',
          solid: '#0f141e',
        },
        accent: {
          cyan: '#22d3ee',
          green: '#50fa7b',
          indigo: '#818cf8',
          amber: '#fbbf24',
          rose: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      backdropBlur: {
        panel: '12px',
      },
      boxShadow: {
        panel: '0 8px 32px rgba(0, 0, 0, 0.4)',
        tooltip: '0 4px 20px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px rgba(34, 211, 238, 0.3)',
      },
    },
  },
  plugins: [],
};

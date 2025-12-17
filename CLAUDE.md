# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scale-Free Abstractions Explorer - A React application showcasing interactive visualizations of complex systems theory, dynamical systems, and self-organized criticality. The application features a gallery landing page with educational framing and multiple visualization modules.

## Tech Stack

- **React 18** with hooks
- **Vite 5** for build tooling
- **React Router 6** for navigation
- **Tailwind CSS 3** for styling
- **HTML5 Canvas** for rendering (no WebGL)

## Project Structure

```
src/
├── components/
│   ├── shared/           # Reusable UI components
│   │   ├── BackButton.jsx
│   │   ├── Button.jsx
│   │   ├── GlassPanel.jsx
│   │   ├── MetricBar.jsx
│   │   ├── ParameterSlider.jsx
│   │   ├── PlaybackControls.jsx
│   │   ├── Tooltip.jsx
│   │   └── index.js
│   └── gallery/
│       └── GalleryCard.jsx
├── hooks/                # Custom React hooks
│   ├── useAnimationFrame.js
│   ├── useCanvasSetup.js
│   ├── useDragRotation.js
│   ├── useViewportSize.js
│   └── index.js
├── utils/
│   └── colors.js         # Shared color utilities (viridis, getColor)
├── visualizations/       # Visualization modules
│   ├── AdaptiveCycle/
│   ├── CausalEmergence/
│   ├── CellularAutomata/
│   ├── Criticality/
│   ├── DynamicalSystems/
│   └── FitnessLandscape/
├── pages/
│   └── Gallery.jsx       # Main gallery landing page
├── data/concepts.js      # Gallery content metadata
├── styles/
│   ├── theme.js          # Design tokens
│   └── globals.css       # Tailwind + custom styles
├── App.jsx               # Router setup
└── main.jsx              # Entry point
```

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

## Git Workflow

**Important**: Always run `git add .` before committing to ensure all changes (including new files) are staged. Use `git status` to verify what will be committed.

## Visualizations

1. **Cellular Automata** (`/cellular-automata`) - Wolfram's 256 elementary rules with complexity classification (I-IV), entropy metrics
2. **Types of Attractors** (`/attractors`) - 3D attractor visualization showing fixed points, limit cycles, strange attractors
3. **Self-Organized Criticality** (`/criticality`) - BTW sandpile model with power-law avalanche distributions
4. **Fitness Landscapes** (`/fitness-landscape`) - Configurable 3D/2D landscapes for exploring optimization topology
5. **Adaptive Cycle** (`/adaptive-cycle`) - Holling's adaptive cycle (r→K→Ω→α) with bundled attractor trajectories
6. **Causal Emergence** (`/causal-emergence`) - Interactive calculator showing when macro-level descriptions have more causal power than micro-level (CE = EI_macro - EI_micro)

## Design System

- **Glassmorphism UI**: Semi-transparent panels with backdrop blur
- **Accent colors**: Each visualization has a unique accent color
- **Design tokens**: Centralized in `src/styles/theme.js`
- **Utility-first CSS**: Tailwind with custom `.glass-panel` component class

## Architecture Patterns

- Shared components via barrel export (`components/shared/index.js`)
- Custom hooks for animation loops (`useAnimationFrame`), viewport tracking, drag rotation
- Shared color utilities in `src/utils/colors.js` (viridis, getColor, COLOR_SCHEMES)
- Each visualization folder contains: `index.jsx`, `utils.js`, `data.js`
- App.jsx imports visualizations directly (no page wrapper layer)
- BackButton component provides consistent navigation back to gallery

## Scientific Context

The visualizations demonstrate:
- **Computational irreducibility** (Rule 110 universal computation)
- **Phase transitions** between order and chaos
- **Scale-free behavior** and power laws
- **Attractor dynamics** in nonlinear systems
- **Fitness landscape topology** and search strategies
- **Adaptive cycles** and resilience in complex systems
- **Causal emergence** and effective information (when macro beats micro)

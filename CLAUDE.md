# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scale-Free Abstractions Explorer - A unified React application showcasing interactive visualizations of complex systems theory, dynamical systems, and self-organized criticality. The application features a gallery landing page with educational framing and four distinct visualization modules.

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
│   │   ├── GlassPanel.jsx
│   │   ├── ParameterSlider.jsx
│   │   ├── Button.jsx
│   │   ├── MetricBar.jsx
│   │   ├── PlaybackControls.jsx
│   │   ├── Tooltip.jsx
│   │   ├── BackButton.jsx
│   │   └── index.js
│   └── gallery/
│       └── GalleryCard.jsx
├── hooks/                # Custom React hooks
│   ├── useAnimationFrame.js
│   ├── useViewportSize.js
│   ├── useCanvasSetup.js
│   └── useDragRotation.js
├── visualizations/       # Visualization modules
│   ├── CellularAutomata/
│   ├── DynamicalSystems/
│   ├── Criticality/
│   └── FitnessLandscape/
├── pages/                # Route page wrappers
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

## Visualizations

1. **Cellular Automata** (`/cellular-automata`) - Wolfram's 256 elementary rules with complexity classification (I-IV), entropy metrics, rule transition tables
2. **Dynamical Systems** (`/attractors`) - 3D attractor visualization showing fixed points, limit cycles, strange attractors with real-time classification
3. **Self-Organized Criticality** (`/criticality`) - BTW sandpile model with power-law avalanche distributions
4. **Fitness Landscapes** (`/fitness-landscape`) - Configurable 3D/2D landscapes for exploring optimization topology

## Design System

- **Glassmorphism UI**: Semi-transparent panels with backdrop blur
- **Accent colors**: Each visualization has a unique accent (zinc, green, cyan, indigo)
- **Design tokens**: Centralized in `src/styles/theme.js`
- **Utility-first CSS**: Tailwind with custom `.glass-panel` component class

## Architecture Patterns

- Shared components via barrel export (`components/shared/index.js`)
- Custom hooks for animation loops, viewport tracking, canvas setup, drag rotation
- Each visualization folder contains: `index.jsx`, `utils.js`, `data.js`, and sub-components
- Page wrappers add BackButton navigation to visualizations

## Scientific Context

The visualizations demonstrate:
- **Computational irreducibility** (Rule 110 universal computation)
- **Phase transitions** between order and chaos
- **Scale-free behavior** and power laws
- **Attractor dynamics** in nonlinear systems
- **Fitness landscape topology** and search strategies

## Legacy Files

The root directory contains the original standalone JSX files for reference:
- `CellularAutomataExplorer.jsx`
- `attractor-explorer.jsx`
- `criticality-simulation.jsx`
- `fitness-landscape.jsx`

These have been migrated to `src/visualizations/` with shared components.

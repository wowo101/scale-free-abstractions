# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains standalone React visualization components exploring concepts from complex systems theory, dynamical systems, and self-organized criticality. Each component is a self-contained interactive simulation.

## Components

- **CellularAutomataExplorer.jsx** - Elementary cellular automata (Wolfram's 256 rules) with classification by complexity class (I-IV), entropy metrics, and rule transition tables
- **attractor-explorer.jsx** - 3D dynamical systems visualization showing point attractors, limit cycles, and strange attractors (Lorenz/Van der Pol systems) with real-time classification
- **criticality-simulation.jsx** - Bak-Tang-Wiesenfeld sandpile model demonstrating self-organized criticality with power-law avalanche distributions
- **fitness-landscape.jsx** - Configurable 3D/2D fitness landscape generator for exploring optimization topology (peaks, valleys, ruggedness)

## Architecture

Each component is:
- A single JSX file with no external dependencies beyond React
- Self-contained with inline styles (no CSS files)
- Uses HTML5 Canvas for rendering (not WebGL)
- Designed for full-viewport display
- Contains its own physics/simulation logic, color schemes, and UI controls

Common patterns across components:
- `useRef` for canvas elements and mutable simulation state
- `requestAnimationFrame` loops for animation
- Floating glassmorphism control panels with sliders
- Educational tooltips explaining scientific concepts

## Development

These are standalone React components. To use them:
1. Import into any React application
2. No build configuration specific to this repo
3. Each component exports a default React component

## Scientific Context

The visualizations demonstrate:
- **Computational irreducibility** (Rule 110 universal computation)
- **Phase transitions** between order and chaos
- **Scale-free behavior** and power laws
- **Attractor dynamics** in nonlinear systems
- **Fitness landscape topology** and search strategies

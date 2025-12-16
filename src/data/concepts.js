// Gallery content and visualization metadata

export const visualizations = [
  {
    id: 'cellular-automata',
    title: 'Cellular Automata',
    subtitle: "Wolfram's 256 Elementary Rules",
    description: 'Simple local rules produce complex global behavior. Rule 110 achieves universal computation from three-cell neighborhoods.',
    tags: ['complexity', 'emergence', 'computation'],
    accent: 'zinc',
    route: '/cellular-automata',
    gradient: 'from-zinc-600 to-zinc-400',
  },
  {
    id: 'dynamical-systems',
    title: 'Dynamical Systems',
    subtitle: 'Attractors & Phase Space',
    description: 'Trajectories in state space reveal the geometry of possible behaviors: fixed points, limit cycles, and strange attractors.',
    tags: ['chaos', 'attractors', 'nonlinearity'],
    accent: 'green',
    route: '/attractors',
    gradient: 'from-green-500 to-cyan-400',
  },
  {
    id: 'criticality',
    title: 'Self-Organized Criticality',
    subtitle: 'The BTW Sandpile Model',
    description: 'Systems naturally evolve toward critical states where avalanches of all sizes occur with power-law frequency.',
    tags: ['power-laws', 'scale-free', 'emergence'],
    accent: 'cyan',
    route: '/criticality',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'fitness-landscape',
    title: 'Fitness Landscapes',
    subtitle: 'The Topology of Optimization',
    description: 'The shape of the fitness function determines which search strategies can succeed. There is no universal optimizer.',
    tags: ['optimization', 'evolution', 'search'],
    accent: 'indigo',
    route: '/fitness-landscape',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

export const heroText = {
  title: 'Scale-Free Abstractions',
  subtitle: 'A sensemaking toolkit for complex systems',
};

export const coreInsight = {
  statement: 'Existence is the active maintenance of information closure.',
  elaboration: 'This maintenance has characteristic structure at every scale.',
};

export const framingContent = [
  {
    id: 'scale-free',
    title: 'Scale-Free Abstractions',
    content: `These patterns appear at every scale—the same attractor dynamics govern chemical reactions and climate systems; the same fitness landscape topology shapes protein folding and cultural evolution; the same criticality emerges in sandpiles and neural networks.`,
  },
  {
    id: 'information-closure',
    title: 'Information Closure',
    content: `A system achieves information closure when its internal model predicts its environment better than raw sensory data could. This is the mathematical signature of agency—and these visualizations show different aspects of how closure emerges and what it enables.`,
  },
  {
    id: 'computational-irreducibility',
    title: 'Computational Irreducibility',
    content: `Some systems are their own fastest simulators—there's no shortcut to predicting their behavior. This isn't a limitation but a feature: it's what makes genuine novelty possible.`,
  },
  {
    id: 'learning-to-see',
    title: 'Learning to See',
    content: `The goal isn't to memorize these specific systems but to develop pattern recognition that transfers. Once you see how ruggedness shapes search in fitness landscapes, you'll recognize the same dynamic in career decisions, scientific discovery, and evolutionary innovation.`,
  },
];

export const theoreticalLayers = [
  {
    id: 'boundaries',
    title: 'Boundaries',
    subtitle: 'The Genesis of Selfhood',
    description: 'Everything begins with separation. Markov blankets create perspectives—statistical membranes that render inside and outside conditionally independent, yet connected.',
  },
  {
    id: 'uncertainty',
    title: 'Uncertainty',
    subtitle: 'The Currency of Knowledge',
    description: 'Across boundaries flows information. Entropy quantifies mystery; mutual information captures shared secrets between processes.',
  },
  {
    id: 'closure',
    title: 'Closure',
    subtitle: 'The Heartbeat of Existence',
    description: 'Information closure measures how well internal models predict what flows through the boundary. To persist is to predict.',
  },
  {
    id: 'dynamics',
    title: 'Dynamics',
    subtitle: 'The Mechanics of Persistence',
    description: 'Free energy minimization provides the mechanism. By reducing surprise and aligning beliefs with reality, systems maintain closure.',
  },
  {
    id: 'scale',
    title: 'Scale',
    subtitle: 'The Universal Pattern',
    description: 'The same efficiency ratio appears from particles to galaxies. No scale is privileged; each maintains existence through identical information-theoretic structures.',
  },
  {
    id: 'selection',
    title: 'Selection',
    subtitle: 'The Accumulation of History',
    description: 'Systems don\'t just persist moment-to-moment; they accumulate, complexify, create new possibilities through functional information.',
  },
];

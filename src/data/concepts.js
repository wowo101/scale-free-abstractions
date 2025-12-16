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

export const frameworkThemes = [
  {
    title: 'Emergence',
    description: 'Complex behavior arising from simple rules. The whole becomes more than the sum of its parts through local interactions.',
    icon: '◇',
  },
  {
    title: 'Phase Transitions',
    description: 'The boundary between order and chaos where systems exhibit maximum complexity and computational capacity.',
    icon: '⬡',
  },
  {
    title: 'Scale-Free Phenomena',
    description: 'Patterns that look the same at every magnification. Power laws and self-similarity as signatures of critical dynamics.',
    icon: '∞',
  },
  {
    title: 'Computational Irreducibility',
    description: 'Systems that are their own fastest simulators. No shortcut to prediction—you must run the computation.',
    icon: '⧖',
  },
];

export const heroText = {
  title: 'Scale-Free Abstractions',
  subtitle: 'Universal patterns in complex systems',
  intro: `The same mathematical structures appear across wildly different domains: cellular automata and neural networks, sandpiles and stock markets, evolution and optimization. These visualizations explore the deep abstractions that transcend any particular substrate.`,
};

export const frameworkIntro = `These visualizations share a common thread: they reveal how simple rules generate complex behavior, how systems self-organize to critical states, and why some dynamics are fundamentally unpredictable. Understanding these patterns provides a lens for analyzing any complex adaptive system.`;

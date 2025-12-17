// Gallery content and visualization metadata

export const visualizations = [
  {
    id: 'cellular-automata',
    title: 'Cellular Automata',
    subtitle: "Wolfram's 256 Elementary Rules",
    preview: 'Local rules, global complexity',
    description: 'Simple local rules produce complex global behavior. Rule 110 achieves universal computation from three-cell neighborhoods.',
    tags: ['complexity', 'emergence', 'computation'],
    accent: 'zinc',
    route: '/cellular-automata',
    gradient: 'from-zinc-600 to-zinc-400',
  },
  {
    id: 'dynamical-systems',
    title: 'Types of Attractors',
    subtitle: 'Attractors & Phase Space',
    preview: 'Where systems settle over time',
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
    preview: 'The edge between order and chaos',
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
    preview: 'Why there is no universal optimizer',
    description: 'The shape of the fitness function determines which search strategies can succeed. There is no universal optimizer.',
    tags: ['optimization', 'evolution', 'search'],
    accent: 'indigo',
    route: '/fitness-landscape',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'adaptive-cycle',
    title: 'Adaptive Cycle',
    subtitle: 'Growth, Collapse & Renewal',
    preview: 'How systems grow, break, and renew',
    description: 'Systems cycle through growth, conservation, release, and reorganization—a universal rhythm of change and resilience.',
    tags: ['resilience', 'cycles', 'change'],
    accent: 'teal',
    route: '/adaptive-cycle',
    gradient: 'from-teal-500 to-cyan-400',
  },
  {
    id: 'causal-emergence',
    title: 'Causal Emergence',
    subtitle: 'When Macro Beats Micro',
    preview: 'Higher levels can be more real',
    description: 'Sometimes coarse-grained descriptions have more causal power than fine-grained ones. Emergence is quantifiable.',
    tags: ['causation', 'emergence', 'information'],
    accent: 'amber',
    route: '/causal-emergence',
    gradient: 'from-amber-500 to-yellow-400',
  },
  // Placeholder visualizations - not yet implemented
  // {
  //   id: 'system-as-attractor',
  //   title: 'Identity as Dynamics',
  //   subtitle: 'Systems ARE Their Attractors',
  //   description: 'A system\'s identity is its characteristic probability distribution. Existence is not a state but an activity.',
  //   tags: ['identity', 'attractors', 'dynamics'],
  //   accent: 'orange',
  //   route: '/identity',
  //   gradient: 'from-orange-500 to-amber-400',
  // },
  // {
  //   id: 'assembly-space',
  //   title: 'Assembly Space',
  //   subtitle: 'Selection & Complexity',
  //   description: 'Assembly theory measures complexity as construction depth. Selection emerges when discovery and production rates balance.',
  //   tags: ['assembly', 'selection', 'complexity'],
  //   accent: 'rose',
  //   route: '/assembly',
  //   gradient: 'from-rose-500 to-pink-400',
  // },
  // {
  //   id: 'agent-emergence',
  //   title: 'Agent Emergence',
  //   subtitle: 'From Physics to Agency',
  //   description: 'Agents emerge from thermodynamic necessity. Markov blankets, free energy minimization, and predictive models arise naturally.',
  //   tags: ['agency', 'free-energy', 'markov-blankets'],
  //   accent: 'violet',
  //   route: '/agent-emergence',
  //   gradient: 'from-violet-500 to-purple-400',
  // },
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
    title: 'Why These Six Tools?',
    content: `Each visualisation captures a different facet of how systems maintain themselves. Cellular automata show how local rules generate global complexity. Attractors reveal the geometry of long-term behavior. Criticality demonstrates how systems tune themselves to the edge of chaos. Fitness landscapes map the topology that any search process must navigate. Adaptive cycles show how systems grow, collapse, and renew. Causal emergence reveals when higher-level descriptions have more predictive power than their parts. Together, they form a toolkit for seeing the deep structure beneath surface phenomena.`,
  },
  {
    id: 'information-closure',
    title: 'The Key Concept: Information Closure',
    content: `A system achieves information closure when its internal model predicts its environment better than raw sensory data could. This is the mathematical signature of agency – and these visualisations show different aspects of how closure emerges and what it enables.`,
  },
  {
    id: 'computational-irreducibility',
    title: 'Computational Irreducibility',
    content: `Some systems are their own fastest simulators – there's no shortcut to predicting their behavior. This isn't a limitation but a feature: it's what makes genuine novelty possible.`,
  },
  {
    id: 'learning-to-see',
    title: 'Learning to See',
    content: `The goal isn't to memorise these specific systems but to develop pattern recognition that transfers. Once you see how ruggedness shapes search in fitness landscapes, you'll recognise the same dynamic in career decisions, scientific discovery, and evolutionary innovation. Once you understand critical system behaviour, you’ll see it anywhere`,
  },
];

export const theoreticalLayers = [
  {
    id: 'boundaries',
    title: 'Boundaries',
    subtitle: 'The Genesis of Selfhood',
    description: 'Everything begins with separation. Markov blankets create perspectives – statistical membranes that render inside and outside conditionally independent, yet connected.',
    equation: 'I(μ;η|b) = 0',
  },
  {
    id: 'uncertainty',
    title: 'Uncertainty',
    subtitle: 'The Currency of Knowledge',
    description: 'Across boundaries flows information. Entropy quantifies mystery; mutual information captures shared secrets between processes.',
    equation: 'I(X;Y) = H(X) + H(Y) − H(X,Y)',
  },
  {
    id: 'closure',
    title: 'Closure',
    subtitle: 'The Heartbeat of Existence',
    description: 'Information closure measures how well internal models predict what flows through the boundary. To persist is to predict.',
    equation: 'IC = H(η|b) − H(η|Mμ)',
  },
  {
    id: 'dynamics',
    title: 'Dynamics',
    subtitle: 'The Mechanics of Persistence',
    description: 'Free energy minimization provides the mechanism. By reducing surprise and aligning beliefs with reality, systems maintain closure.',
    equation: 'F = −log p(s) + D_KL[q‖p]',
  },
  {
    id: 'scale',
    title: 'Scale',
    subtitle: 'The Universal Pattern',
    description: 'The same efficiency ratio appears from particles to galaxies. No scale is privileged; each maintains existence through identical information-theoretic structures.',
    equation: 'd/ds[IC/C] = 0',
  },
  {
    id: 'selection',
    title: 'Selection',
    subtitle: 'The Accumulation of History',
    description: 'Systems don\'t just persist moment-to-moment; they accumulate, complexify, create new possibilities through functional information.',
    equation: 'I_F = −log₂(N_func/N_total)',
  },
];

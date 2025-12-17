// Preset configurations
export const PRESETS = {
  point: { coupling: 0.3, driving: 0.2, dissipation: 1.2, nonlinearity: 0.5, feedback: 0.5 },
  cycle: { coupling: 0.1, driving: 0.5, dissipation: 0.3, nonlinearity: 1.0, feedback: 0.0 },
  strange: { coupling: 1.0, driving: 0.8, dissipation: 0.6, nonlinearity: 1.0, feedback: 0.0 },
  unbounded: { coupling: 1.0, driving: 1.5, dissipation: 0.0, nonlinearity: 0.3, feedback: 0.0 }
};

// Parameter info for tooltips
export const PARAM_INFO = {
  coupling: { 
    name: 'Coupling (σ)', 
    desc: 'How strongly variables influence each other. High coupling enables complex dynamics through information exchange between state dimensions.' 
  },
  driving: { 
    name: 'Driving (ρ)', 
    desc: 'Energy input to the system. Too high causes unbounded growth; too low causes collapse to equilibrium. Controls distance from criticality.' 
  },
  dissipation: { 
    name: 'Dissipation (β)', 
    desc: 'Energy loss rate. High dissipation → point attractors as energy drains. Low dissipation allows oscillation or chaos to persist.' 
  },
  nonlinearity: { 
    name: 'Nonlinearity', 
    desc: 'Strength of multiplicative terms (x·y, x·z). Essential for limit cycles and strange attractors – without it, only point attractors exist.' 
  },
  feedback: { 
    name: 'Self-Feedback', 
    desc: 'How much each variable dampens itself. Creates self-limiting behaviour that can stabilise or destabilise depending on other parameters.' 
  }
};

// Attractor type explanations
export const EXPLANATIONS = {
  'point': { 
    title: 'Point Attractor', 
    desc: 'The system has converged to a fixed point. High dissipation removes energy faster than driving can inject it.', 
    mech: 'Energy loss exceeds input' 
  },
  'limit-cycle': { 
    title: 'Limit Cycle', 
    desc: 'A stable periodic orbit. Nonlinear feedback balances energy loss with driving force, sustaining oscillation.', 
    mech: 'Balanced energy + nonlinearity' 
  },
  'strange': { 
    title: 'Strange Attractor', 
    desc: 'Chaos! Bounded but never repeating. Strong coupling creates stretching and folding – nearby points diverge exponentially.', 
    mech: 'High coupling + nonlinearity' 
  },
  'unbounded': { 
    title: 'Unbounded Growth', 
    desc: 'Energy input overwhelms dissipation. The system escapes to infinity. Reduce driving or increase dissipation to contain it.', 
    mech: 'Driving exceeds capacity' 
  },
  'transient': { 
    title: 'Transient', 
    desc: 'Still settling toward long-term behaviour.', 
    mech: 'Awaiting convergence...' 
  },
  'analyzing': { 
    title: 'Analyzing...', 
    desc: 'Gathering trajectory data.', 
    mech: 'Collecting samples' 
  }
};

// Attractor type colors
export const ATTRACTOR_COLORS = {
  'strange': '#ff6b6b',
  'limit-cycle': '#50fa7b',
  'point': '#8be9fd',
  'unbounded': '#ffb86c',
  'transient': '#6272a4',
  'analyzing': '#6272a4',
};

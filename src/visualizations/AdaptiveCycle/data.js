// Phase definitions for the adaptive cycle
export const PHASES = {
  r: {
    name: 'Exploitation (r)',
    shortName: 'r',
    color: '#2dd4bf', // teal-400
    description: 'Rapid growth and resource acquisition. Pioneers exploit available resources with high connectivity forming.',
    characteristics: {
      potential: 'low → rising',
      connectedness: 'low → rising',
      resilience: 'high',
    },
  },
  K: {
    name: 'Conservation (K)',
    shortName: 'K',
    color: '#3b82f6', // blue-500
    description: 'Mature phase with accumulated resources and rigid connections. Efficient but increasingly brittle.',
    characteristics: {
      potential: 'high',
      connectedness: 'high',
      resilience: 'low → declining',
    },
  },
  omega: {
    name: 'Release (Ω)',
    shortName: 'Ω',
    color: '#f43f5e', // rose-500
    description: 'Creative destruction. Accumulated potential is released as rigid connections break down.',
    characteristics: {
      potential: 'high → falling',
      connectedness: 'falling rapidly',
      resilience: 'undefined',
    },
  },
  alpha: {
    name: 'Reorganization (α)',
    shortName: 'α',
    color: '#8b5cf6', // violet-500
    description: 'Innovation and restructuring. Released resources recombine in novel configurations.',
    characteristics: {
      potential: 'low',
      connectedness: 'low',
      resilience: 'high (many possibilities)',
    },
  },
};

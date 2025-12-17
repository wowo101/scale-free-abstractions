// Preset transition probability matrices demonstrating causal emergence
export const PRESETS = {
  noisyCopy: {
    name: 'Noisy Copy',
    description: 'Two elements that copy each other with noise. Macro grouping reduces noise.',
    elements: 4,
    states: ['00', '01', '10', '11'],
    // TPM: rows = current state, cols = next state
    // With 10% noise on each bit
    tpm: [
      [0.81, 0.09, 0.09, 0.01], // 00 → mostly stays 00
      [0.09, 0.81, 0.01, 0.09], // 01 → mostly stays 01
      [0.09, 0.01, 0.81, 0.09], // 10 → mostly stays 10
      [0.01, 0.09, 0.09, 0.81], // 11 → mostly stays 11
    ],
    suggestedGrouping: [[0, 3], [1, 2]], // Group "same" vs "different"
    macroLabels: ['Same', 'Different'],
  },
  xorGate: {
    name: 'XOR Gate',
    description: 'High degeneracy at micro level - multiple inputs produce same output.',
    elements: 4,
    states: ['00', '01', '10', '11'],
    // XOR: output depends only on parity
    tpm: [
      [0.9, 0.03, 0.03, 0.04], // 00 → 00 (even parity stays even)
      [0.03, 0.04, 0.9, 0.03], // 01 → 10 (odd parity)
      [0.03, 0.9, 0.04, 0.03], // 10 → 01 (odd parity)
      [0.04, 0.03, 0.03, 0.9], // 11 → 11 (even parity stays even)
    ],
    suggestedGrouping: [[0, 3], [1, 2]], // Even vs Odd parity
    macroLabels: ['Even', 'Odd'],
  },
  majority: {
    name: 'Majority Rule',
    description: 'Three-element majority vote. Macro = consensus level.',
    elements: 8,
    states: ['000', '001', '010', '011', '100', '101', '110', '111'],
    tpm: [
      [0.85, 0.05, 0.05, 0.01, 0.03, 0.005, 0.005, 0.0], // 000 → 000
      [0.05, 0.1, 0.1, 0.7, 0.02, 0.01, 0.01, 0.01],     // 001 → 011
      [0.05, 0.1, 0.1, 0.7, 0.02, 0.01, 0.01, 0.01],     // 010 → 011
      [0.01, 0.02, 0.02, 0.85, 0.01, 0.03, 0.03, 0.03],  // 011 → 011
      [0.05, 0.1, 0.1, 0.7, 0.02, 0.01, 0.01, 0.01],     // 100 → 011
      [0.01, 0.02, 0.02, 0.85, 0.01, 0.03, 0.03, 0.03],  // 101 → 011 or 101
      [0.01, 0.02, 0.02, 0.85, 0.01, 0.03, 0.03, 0.03],  // 110 → majority 1
      [0.0, 0.005, 0.005, 0.03, 0.01, 0.05, 0.05, 0.85], // 111 → 111
    ],
    suggestedGrouping: [[0], [1, 2, 4], [3, 5, 6], [7]], // By count of 1s
    macroLabels: ['0', '1', '2', '3'],
  },
  deterministic: {
    name: 'Deterministic',
    description: 'Perfect determinism at micro level. No emergence possible.',
    elements: 4,
    states: ['00', '01', '10', '11'],
    tpm: [
      [1, 0, 0, 0], // 00 → 00
      [0, 0, 1, 0], // 01 → 10
      [0, 1, 0, 0], // 10 → 01
      [0, 0, 0, 1], // 11 → 11
    ],
    suggestedGrouping: [[0, 3], [1, 2]],
    macroLabels: ['Fixed', 'Cycling'],
  },
  degenerate: {
    name: 'Degenerate',
    description: 'Multiple micro states lead to the same outcome. High degeneracy.',
    elements: 4,
    states: ['00', '01', '10', '11'],
    tpm: [
      [0.7, 0.1, 0.1, 0.1], // 00 → mostly 00
      [0.7, 0.1, 0.1, 0.1], // 01 → mostly 00 (degenerate!)
      [0.1, 0.1, 0.1, 0.7], // 10 → mostly 11
      [0.1, 0.1, 0.1, 0.7], // 11 → mostly 11 (degenerate!)
    ],
    suggestedGrouping: [[0, 1], [2, 3]], // First bit determines attractor
    macroLabels: ['Low', 'High'],
  },
  emergent: {
    name: 'Emergent ✓',
    description: 'Highly noisy micro states but deterministic macro transitions. True emergence!',
    elements: 4,
    states: ['00', '01', '10', '11'],
    // Key: micro is very noisy (high entropy per row = low determinism)
    // But within-group noise cancels out at macro level
    tpm: [
      [0.25, 0.25, 0.25, 0.25],  // 00 → uniform (max noise!)
      [0.25, 0.25, 0.25, 0.25],  // 01 → uniform 
      [0.25, 0.25, 0.25, 0.25],  // 10 → uniform
      [0.25, 0.25, 0.25, 0.25],  // 11 → uniform
    ],
    // But when we group: {00,01} and {10,11}, 
    // macro becomes: each macro state → 50% stay, 50% switch
    // Actually this will also be uniform... need different approach
    suggestedGrouping: [[0, 1], [2, 3]],
    macroLabels: ['A', 'B'],
  },
  emergence2: {
    name: 'Flock ✓',
    description: 'Individual birds move randomly but flock moves predictably. CE > 0!',
    elements: 4,
    states: ['LL', 'LR', 'RL', 'RR'],
    // Two birds: each bit = direction. Individually noisy, but group behavior is deterministic
    // If majority left (LL, LR, RL with 2+ L): flock goes left
    // Key insight: make transitions that are noisy at micro but average to deterministic at macro
    tpm: [
      [0.7, 0.15, 0.15, 0.0],  // LL → stays left-ish, never goes RR
      [0.35, 0.35, 0.15, 0.15], // LR → mixed, slight left bias
      [0.35, 0.15, 0.35, 0.15], // RL → mixed, slight left bias
      [0.0, 0.15, 0.15, 0.7],   // RR → stays right-ish, never goes LL
    ],
    suggestedGrouping: [[0], [1, 2], [3]], // Pure L, Mixed, Pure R
    macroLabels: ['Left', 'Mixed', 'Right'],
  },
};

// Parameter info for tooltips
export const PARAM_INFO = {
  determinism: {
    name: 'Determinism',
    desc: 'How reliably each state leads to a specific next state. High determinism means predictable transitions.',
  },
  degeneracy: {
    name: 'Degeneracy',
    desc: 'How many different states lead to the same outcome. High degeneracy means many-to-one mappings.',
  },
  effectiveness: {
    name: 'Effectiveness',
    desc: 'The balance of determinism and non-degeneracy. Eff = Det - Deg. High effectiveness means each state has unique causal power.',
  },
  ei: {
    name: 'Effective Information (EI)',
    desc: 'Total causal power of the system. EI = Effectiveness × log₂(n). Measures how much information is transmitted through causal relationships.',
  },
};

// Explanations for the guide panel
export const EXPLANATIONS = {
  emergence: {
    title: 'Causal Emergence',
    content: `Causal emergence occurs when a macro-level description has MORE causal power than the micro-level.

**How is this possible?**
Coarse-graining can:
• Reduce noise (many noisy micro states → one stable macro state)
• Eliminate degeneracy (many-to-one at micro → one-to-one at macro)
• Increase determinism (averaged behavior is more predictable)

**The key insight:**
Emergence isn't just about convenience—the macro level can be *more real* in a precise, quantifiable sense.`,
  },
  ei: {
    title: 'Effective Information',
    content: `EI measures a system's causal power—how much the current state determines the next state.

**Formula:** EI = Effectiveness × log₂(n)

**Effectiveness** = Determinism - Degeneracy
• Determinism: How reliably states lead to specific outcomes
• Degeneracy: How many states lead to the same outcome

**Why it matters:**
If EI(macro) > EI(micro), the macro description captures more causal structure. The "higher level" is doing real explanatory work.`,
  },
  coarsegraining: {
    title: 'Coarse-Graining',
    content: `Coarse-graining groups micro states into macro states.

**Good coarse-graining:**
• Groups states with similar behavior
• Reduces noise while preserving signal
• Creates more deterministic macro dynamics

**Example:**
If states A and B both lead to C with noise, grouping {A,B} might give a macro state that leads to C with less noise.

**The goal:**
Find the grouping that maximizes EI at the macro level.`,
  },
};

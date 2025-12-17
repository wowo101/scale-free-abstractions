// Preset transition probability matrices demonstrating causal emergence
export const PRESETS = {
  noisyCopy: {
    name: 'Noisy Copy',
    description: 'Two bits that tend to stay the same (00 or 11) or different (01 or 10). Like a noisy communication channel – each bit occasionally flips. Grouping into "same" vs "different" reduces noise and increases predictability.',
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
    description: 'A logical XOR: output parity depends on input parity. States 00 and 11 (even parity) behave similarly, as do 01 and 10 (odd parity). Grouping by parity reveals the hidden structure and reduces degeneracy.',
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
    description: 'Three voters where majority wins. Individual votes are noisy, but the group tends toward consensus. Grouping by "number of 1s" (0, 1, 2, or 3) captures the collective behaviour better than tracking each voter.',
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
    description: 'A perfectly predictable system: each state always leads to exactly one next state. Since there\'s no noise to reduce, coarse-graining can only lose information – no emergence here.',
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
    description: 'A "funnel" system where different inputs converge to the same outputs. States 00 and 01 both lead to the "low" attractor; 10 and 11 lead to "high". Grouping by attractor basin eliminates this many-to-one redundancy.',
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
    name: 'Neural Sync ✓',
    description: 'Three neurons that synchronize through local interactions. Individual firing is noisy, but the population exhibits clear oscillation between synchronized states. Grouping by "activation level" (0, 1-2, 3 active) reveals emergent rhythms.',
    elements: 8,
    states: ['000', '001', '010', '100', '011', '101', '110', '111'],
    // 8-state system: neurons tend toward synchrony (all-on or all-off)
    // States with 0 or 3 active neurons are stable attractors
    // States with 1 or 2 active are unstable, transition toward attractors
    tpm: [
      [0.80, 0.05, 0.05, 0.05, 0.02, 0.02, 0.01, 0.00], // 000 → stable off
      [0.30, 0.15, 0.10, 0.10, 0.15, 0.10, 0.05, 0.05], // 001 → drifts toward 000 or 111
      [0.30, 0.10, 0.15, 0.10, 0.15, 0.05, 0.10, 0.05], // 010 → drifts
      [0.30, 0.10, 0.10, 0.15, 0.05, 0.15, 0.10, 0.05], // 100 → drifts
      [0.05, 0.10, 0.10, 0.05, 0.15, 0.15, 0.10, 0.30], // 011 → drifts toward 111
      [0.05, 0.10, 0.05, 0.10, 0.15, 0.15, 0.10, 0.30], // 101 → drifts toward 111
      [0.05, 0.05, 0.10, 0.10, 0.10, 0.10, 0.20, 0.30], // 110 → drifts toward 111
      [0.00, 0.01, 0.02, 0.02, 0.05, 0.05, 0.05, 0.80], // 111 → stable on
    ],
    suggestedGrouping: [[0], [1, 2, 3], [4, 5, 6], [7]], // By activation count: 0, 1, 2, 3
    macroLabels: ['Off', 'Low', 'High', 'On'],
  },
  emergence2: {
    name: 'Flock ✓',
    description: 'Two birds where each moves somewhat randomly, but the flock has a predictable direction. Pure left (LL) stays left-ish, pure right (RR) stays right-ish, mixed states are unstable. The "flock direction" macro variable is more predictive than individual positions.',
    elements: 4,
    states: ['LL', 'LR', 'RL', 'RR'],
    // Two birds: each bit = direction. Individually noisy, but group behaviour is deterministic
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
- Reduce noise (noisy micro → stable macro)
- Eliminate degeneracy (many-to-one → one-to-one)
- Increase determinism (averaging makes behaviour predictable)

When CE > 0, the macro level isn't just convenient – it's *more causally accurate* than the micro level.`,
  },
  ei: {
    title: 'Effective Information',
    content: `Effective Information (EI) measures causal power – how much the current state determines the next.

**Formula:** EI = H(output) - H(output|input)

Where:
- H(output): entropy of possible next states
- H(output|input): uncertainty after knowing input

Higher EI means stronger cause-effect relationships. When EI(macro) > EI(micro), the higher level reveals causal structure hidden by micro-level noise.`,
  },
  coarsegraining: {
    title: 'Coarse-Graining',
    content: `Coarse-graining groups micro states into macro states.

**Good groupings:**
- Group states with similar transitions
- Reduce noise while preserving signal
- Create more deterministic dynamics

**Example:** If A and B both noisily lead to C, grouping {A,B} can make the macro transition cleaner.

The optimal grouping maximizes EI at the macro level.`,
  },
};

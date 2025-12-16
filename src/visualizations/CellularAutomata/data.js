// Classification data for Wolfram's elementary cellular automata

export const COMPLEXITY_CLASSES = {
  I: {
    name: 'Class I — Uniform',
    color: '#71717a',
    rules: [0, 8, 32, 40, 64, 96, 128, 136, 160, 168, 192, 224, 234, 235, 238, 239, 248, 249, 250, 251, 252, 253, 254, 255],
    description: 'Evolution converges to a homogeneous state. All initial information is erased; the system reaches a fixed point attractor regardless of starting conditions.',
  },
  II: {
    name: 'Class II — Periodic',
    color: '#60a5fa',
    rules: [],
    description: 'Evolution produces stable periodic structures or nested patterns. Information is preserved but bounded; future states can be predicted by detecting the cycle length.',
  },
  III: {
    name: 'Class III — Chaotic',
    color: '#f87171',
    rules: [18, 22, 30, 45, 60, 73, 90, 105, 122, 126, 129, 146, 150, 161, 182, 195, 225],
    description: 'Evolution appears random with maximal entropy and high sensitivity to initial conditions. However, many chaotic rules possess hidden mathematical structure (XOR operations, linear recurrences) that permits analytical prediction. High entropy does not imply computational irreducibility.',
  },
  IV: {
    name: 'Class IV — Complex',
    color: '#4ade80',
    rules: [41, 54, 106, 110],
    description: 'Localized structures emerge and interact in intricate ways. Rule 110 is proven capable of universal computation (Cook, 2004)—it can simulate any Turing machine. This implies computational irreducibility: no algorithm can predict step N faster than running all N steps. The system is its own simplest model.',
  }
};

// Compute Class II as everything not in other classes
const allOtherRules = new Set([
  ...COMPLEXITY_CLASSES.I.rules,
  ...COMPLEXITY_CLASSES.III.rules,
  ...COMPLEXITY_CLASSES.IV.rules
]);
for (let i = 0; i < 256; i++) {
  if (!allOtherRules.has(i)) {
    COMPLEXITY_CLASSES.II.rules.push(i);
  }
}

export const NOTABLE_RULES = new Set([30, 90, 110, 184, 54, 22, 60, 150, 126, 45, 106]);

export const RULE_INFO = {
  30: 'Generates pseudo-randomness from deterministic rules. Used in Mathematica\'s RNG. Found in cone snail shell patterns.',
  90: 'Sierpiński triangle via XOR of neighbors. Despite visual complexity, it has closed-form solutions—not computationally irreducible.',
  110: 'Proven capable of universal computation (Cook, 2004). Can simulate any Turing machine given appropriate initial conditions. Computationally irreducible.',
  184: 'Models traffic flow: particles move right unless blocked. Demonstrates how conservation laws emerge from local rules.',
  54: 'Persistent localized structures ("particles") interact. Strong candidate for universal computation.',
  22: 'Boundary case between periodic and chaotic. Classification can be ambiguous at phase transitions.',
  60: 'Additive rule producing Pascal\'s triangle mod 2. Analytically solvable despite complex appearance.',
  150: 'Three-cell XOR. Related to linear feedback shift registers. Fractal structure but mathematically tractable.',
  126: 'Complex chaotic patterns with some localized structure.',
  45: 'Chaotic with diagonal structures. High sensitivity to boundary conditions.',
  106: 'Exhibits Sierpiński-like triangles and complex interactions. Candidate for Class IV.'
};

// Pre-compute rule to class mapping
export const RULE_TO_CLASS = {};
Object.entries(COMPLEXITY_CLASSES).forEach(([key, data]) => {
  data.rules.forEach(r => RULE_TO_CLASS[r] = key);
});

export function getClassForRule(rule) {
  return RULE_TO_CLASS[rule] || 'II';
}

export function getRandomRuleFromClass(classKey) {
  const rules = COMPLEXITY_CLASSES[classKey].rules;
  return rules[Math.floor(Math.random() * rules.length)];
}

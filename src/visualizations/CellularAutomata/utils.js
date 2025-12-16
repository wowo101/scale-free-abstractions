// Cellular automata utility functions

export function getRuleBinary(rule) {
  return rule.toString(2).padStart(8, '0');
}

export function getNextState(left, center, right, ruleBinary) {
  const pattern = (left << 2) | (center << 1) | right;
  return parseInt(ruleBinary[7 - pattern], 10);
}

export function computeEntropy(row) {
  if (row.length === 0) return 0;
  const p1 = row.reduce((a, b) => a + b, 0) / row.length;
  const p0 = 1 - p1;
  if (p0 === 0 || p1 === 0) return 0;
  return -(p0 * Math.log2(p0) + p1 * Math.log2(p1));
}

export function computeBlockEntropy(row, k = 3) {
  if (row.length < k) return 0;
  const counts = {};
  for (let i = 0; i <= row.length - k; i++) {
    const block = row.slice(i, i + k).join('');
    counts[block] = (counts[block] || 0) + 1;
  }
  const total = row.length - k + 1;
  let entropy = 0;
  for (const count of Object.values(counts)) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function computeDensity(row) {
  if (row.length === 0) return 0;
  return row.reduce((a, b) => a + b, 0) / row.length;
}

export function formatRule(n) {
  return n.toString().padStart(3, '0');
}

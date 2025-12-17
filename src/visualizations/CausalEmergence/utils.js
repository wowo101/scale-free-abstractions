/**
 * Compute entropy of a probability distribution
 */
export function entropy(probs) {
  let h = 0;
  for (const p of probs) {
    if (p > 1e-10) {
      h -= p * Math.log2(p);
    }
  }
  return h;
}

/**
 * Compute determinism for a row of the TPM
 * High determinism = low entropy of outputs given this input
 * Returns value between 0 and 1
 */
export function computeRowDeterminism(row) {
  const n = row.length;
  if (n <= 1) return 1;
  
  const h = entropy(row);
  const maxH = Math.log2(n);
  return maxH > 0 ? 1 - h / maxH : 1;
}

/**
 * Compute average determinism across all rows (uniform prior over inputs)
 */
export function computeDeterminism(tpm) {
  if (tpm.length === 0) return 0;
  
  let total = 0;
  for (const row of tpm) {
    total += computeRowDeterminism(row);
  }
  return total / tpm.length;
}

/**
 * Compute the marginal output distribution assuming uniform input
 */
export function computeMarginalOutput(tpm) {
  const n = tpm.length;
  if (n === 0) return [];
  
  const marginal = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      marginal[j] += tpm[i][j] / n;
    }
  }
  return marginal;
}

/**
 * Compute degeneracy - how many inputs lead to same output
 * High degeneracy = outputs are concentrated (low entropy of marginal output)
 */
export function computeDegeneracy(tpm) {
  const n = tpm.length;
  if (n <= 1) return 0;
  
  const marginal = computeMarginalOutput(tpm);
  const h = entropy(marginal);
  const maxH = Math.log2(n);
  
  // Degeneracy is high when marginal entropy is low (outputs concentrated)
  return maxH > 0 ? 1 - h / maxH : 0;
}

/**
 * Compute Effective Information using the correct formula
 * EI = I(X_t ; X_{t+1}) when intervening with uniform distribution over X_t
 * EI = H(X_{t+1}) - H(X_{t+1} | X_t)
 * 
 * Where H(X_{t+1} | X_t) is the average conditional entropy
 */
export function computeEI(tpm) {
  const n = tpm.length;
  if (n <= 1) return 0;
  
  // H(X_{t+1}) - marginal entropy of outputs
  const marginal = computeMarginalOutput(tpm);
  const hOutput = entropy(marginal);
  
  // H(X_{t+1} | X_t) - average conditional entropy (noise)
  let hConditional = 0;
  for (let i = 0; i < n; i++) {
    hConditional += entropy(tpm[i]) / n;
  }
  
  // EI = mutual information = H(output) - H(output|input)
  return Math.max(0, hOutput - hConditional);
}

/**
 * Compute effectiveness (normalized EI)
 * Eff = EI / log2(n)
 */
export function computeEffectiveness(tpm) {
  const n = tpm.length;
  if (n <= 1) return 0;
  
  const ei = computeEI(tpm);
  const maxEI = Math.log2(n);
  return maxEI > 0 ? ei / maxEI : 0;
}

/**
 * Generate macro TPM from micro TPM given a grouping
 * @param {Array} microTPM - The micro-level TPM
 * @param {Array} grouping - Array of arrays, each inner array contains indices of micro states in that macro state
 * @returns {Array} The macro-level TPM
 */
export function coarseGrain(microTPM, grouping) {
  const nMicro = microTPM.length;
  const nMacro = grouping.length;
  
  if (nMacro === 0) return [];
  
  // Create mapping from micro to macro
  const microToMacro = new Array(nMicro);
  for (let macro = 0; macro < nMacro; macro++) {
    for (const micro of grouping[macro]) {
      microToMacro[micro] = macro;
    }
  }
  
  // Compute macro TPM
  // P(macro_next | macro_current) = average over micro states in macro_current
  const macroTPM = [];
  
  for (let macroFrom = 0; macroFrom < nMacro; macroFrom++) {
    const row = new Array(nMacro).fill(0);
    const microStatesInFrom = grouping[macroFrom];
    
    // Sum transitions from all micro states in this macro state
    for (const microFrom of microStatesInFrom) {
      for (let microTo = 0; microTo < nMicro; microTo++) {
        const macroTo = microToMacro[microTo];
        row[macroTo] += microTPM[microFrom][microTo];
      }
    }
    
    // Normalize by number of micro states (uniform prior within macro)
    for (let i = 0; i < nMacro; i++) {
      row[i] /= microStatesInFrom.length;
    }
    
    macroTPM.push(row);
  }
  
  return macroTPM;
}

/**
 * Compute causal emergence
 * CE = EI(macro) - EI(micro)
 */
export function computeCausalEmergence(microTPM, grouping) {
  const microEI = computeEI(microTPM);
  const macroTPM = coarseGrain(microTPM, grouping);
  const macroEI = computeEI(macroTPM);
  return macroEI - microEI;
}

/**
 * Get all metrics for a TPM
 */
export function getMetrics(tpm) {
  const det = computeDeterminism(tpm);
  const deg = computeDegeneracy(tpm);
  const ei = computeEI(tpm);
  const eff = computeEffectiveness(tpm);
  
  return {
    determinism: det,
    degeneracy: deg,
    effectiveness: eff,
    ei: ei,
    states: tpm.length,
  };
}

/**
 * Format a number for display
 */
export function formatNumber(n, decimals = 2) {
  if (isNaN(n) || !isFinite(n)) return '0.00';
  return n.toFixed(decimals);
}

/**
 * Generate a simple grouping based on state similarity
 * Groups states that have similar transition patterns
 */
export function suggestGrouping(tpm) {
  const n = tpm.length;
  if (n <= 2) return [[0], [1]].slice(0, n);
  
  // Simple heuristic: group by which state they most likely transition to
  const groups = {};
  
  for (let i = 0; i < n; i++) {
    const row = tpm[i];
    const maxProb = Math.max(...row);
    const targetState = row.indexOf(maxProb);
    
    if (!groups[targetState]) {
      groups[targetState] = [];
    }
    groups[targetState].push(i);
  }
  
  return Object.values(groups);
}

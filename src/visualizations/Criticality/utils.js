// Criticality simulation utility functions

// Geometrically-spaced size buckets (powers of 3)
// This ensures equal spacing on a log scale
export const SIZE_BUCKETS = [
  { min: 1, max: 1, label: '1', width: 1, midpoint: 1 },
  { min: 2, max: 3, label: '2-3', width: 2, midpoint: 2.5 },
  { min: 4, max: 9, label: '4-9', width: 6, midpoint: 6 },
  { min: 10, max: 27, label: '10-27', width: 18, midpoint: 17 },
  { min: 28, max: 81, label: '28-81', width: 54, midpoint: 50 },
  { min: 82, max: 300, label: '82+', width: 219, midpoint: 150 }
];

// Power law exponent (τ ≈ 1.1 for 2D BTW sandpile avalanche sizes)
export const TAU = 1.1;

// Pre-calculate the expected log-density ratios (normalized to first bucket)
export const POWER_LAW_LOG_DENSITY = SIZE_BUCKETS.map((bucket) => {
  return -TAU * Math.log10(bucket.midpoint / SIZE_BUCKETS[0].midpoint);
});

// Get bucket index for a given avalanche size
export function getBucketIndex(size) {
  for (let i = 0; i < SIZE_BUCKETS.length; i++) {
    if (size <= SIZE_BUCKETS[i].max) return i;
  }
  return SIZE_BUCKETS.length - 1;
}

// Discrete colors for each grain count
export function getColorForHeight(height, isToppling, threshold) {
  if (isToppling) {
    return [255, 100, 100];
  }
  
  if (height === 0) return [15, 25, 45];
  if (height >= threshold) return [255, 50, 50];
  
  const fraction = height / threshold;
  
  if (fraction < 0.25) {
    return [30, 80, 120];
  } else if (fraction < 0.5) {
    return [40, 140, 140];
  } else if (fraction < 0.75) {
    return [80, 180, 100];
  } else {
    return [220, 200, 50];
  }
}

// State colors
export const stateColors = {
  'Building...': '#64748b',
  'Subcritical': '#22d3ee',
  'Approaching Critical': '#a78bfa',
  'Critical': '#fbbf24',
  'Supercritical': '#ef4444'
};

// Tooltip definitions
export const tooltips = {
  threshold: "Number of grains that triggers a cell to collapse and distribute to neighbours. Higher values store more energy before release.",
  dropRate: "Grains randomly added per simulation step – the driving force pushing the system toward criticality.",
  dissipation: "Fraction of energy lost during each topple. High values drain energy and prevent the system from reaching criticality."
};

export const chartTooltipText = `This log-log chart shows avalanche size distribution as DENSITY (count ÷ bin width). The yellow line is the theoretical power law P(s) ∝ s^(−${TAU}).

At criticality, observed bars should align with this diagonal line. This indicates scale-free behaviour: no characteristic size dominates.

Small avalanches are common, large ones rare, but they follow a predictable ratio. This "scale invariance" is why critical systems produce both tiny fluctuations and rare catastrophic cascades from identical dynamics.`;

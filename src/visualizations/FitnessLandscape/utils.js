// Seeded random for reproducibility
export function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate fitness landscape data
export function generateLandscape(params, seed = 42) {
  const { resolution, peakiness, numPeaks, clusterTightness, correlationLength, valleyDepth, asymmetry } = params;
  
  const size = resolution;
  const heights = new Float32Array(size * size);
  const peaks = [];
  let currentSeed = seed;
  
  const numClusters = Math.max(1, Math.floor(numPeaks / 3));
  const clusterCenters = [];
  
  for (let c = 0; c < numClusters; c++) {
    clusterCenters.push({
      x: seededRandom(currentSeed++) * size,
      y: seededRandom(currentSeed++) * size
    });
  }
  
  for (let i = 0; i < numPeaks; i++) {
    const cluster = clusterCenters[Math.floor(seededRandom(currentSeed++) * numClusters)];
    const spread = (1 - clusterTightness) * size * 0.4;
    const angle = seededRandom(currentSeed++) * Math.PI * 2;
    const dist = seededRandom(currentSeed++) * spread;
    
    peaks.push({
      x: (cluster.x + Math.cos(angle) * dist + size) % size,
      y: (cluster.y + Math.sin(angle) * dist + size) % size,
      height: 0.3 + seededRandom(currentSeed++) * 0.7,
      sharpness: peakiness * (0.5 + seededRandom(currentSeed++) * 0.5),
      stretchX: 1 + (seededRandom(currentSeed++) - 0.5) * asymmetry,
      stretchY: 1 + (seededRandom(currentSeed++) - 0.5) * asymmetry,
      rotation: seededRandom(currentSeed++) * Math.PI
    });
  }
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let maxHeight = 0;
      let smoothHeight = 0;
      
      for (const peak of peaks) {
        const dx = i - peak.x;
        const dy = j - peak.y;
        const cos = Math.cos(peak.rotation);
        const sin = Math.sin(peak.rotation);
        const rx = (cos * dx - sin * dy) * peak.stretchX;
        const ry = (sin * dx + cos * dy) * peak.stretchY;
        
        const distSq = rx * rx + ry * ry;
        const sigma = correlationLength * (2 - peak.sharpness) * (size / 64);
        const sigmaSq = sigma * sigma;
        const contribution = peak.height * Math.exp(-distSq / (2 * sigmaSq));
        
        maxHeight = Math.max(maxHeight, contribution);
        smoothHeight += contribution * 0.3;
      }
      
      const blendedHeight = peakiness * maxHeight + (1 - peakiness) * Math.min(smoothHeight, 1);
      const finalHeight = blendedHeight * (1 - valleyDepth) + Math.pow(blendedHeight, 1 + valleyDepth) * valleyDepth;
      heights[i * size + j] = finalHeight;
    }
  }
  
  return heights;
}

// Re-export color utilities from shared module
export { getColor } from '../../utils/colors';

// Calculate statistics
export function calculateStats(heights, resolution) {
  let sum = 0, localMaxima = 0;
  const n = resolution;
  
  for (let i = 0; i < heights.length; i++) sum += heights[i];
  
  for (let i = 1; i < n - 1; i++) {
    for (let j = 1; j < n - 1; j++) {
      const idx = i * n + j;
      const val = heights[idx];
      if (val > heights[idx - 1] && val > heights[idx + 1] &&
          val > heights[idx - n] && val > heights[idx + n]) {
        localMaxima++;
      }
    }
  }
  
  let gradientSum = 0, count = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1; j++) {
      const dx = heights[i * n + j + 1] - heights[i * n + j];
      const dy = heights[(i + 1) * n + j] - heights[i * n + j];
      gradientSum += Math.sqrt(dx * dx + dy * dy);
      count++;
    }
  }
  
  return { 
    localMaxima, 
    ruggedness: (gradientSum / count).toFixed(3), 
    mean: (sum / heights.length).toFixed(2) 
  };
}

// Parameter info descriptions
export const parameterInfo = {
  peakiness: {
    desc: "Controls peak sharpness. Low = smooth rolling hills (Mt. Fuji). High = sharp isolated spikes (Matterhorn).",
    example: "NK model K parameter analog"
  },
  numPeaks: {
    desc: "Number of local optima. More peaks = more ways to get trapped in suboptimal solutions.",
    example: "Protein folding: millions of local minima"
  },
  clusterTightness: {
    desc: "How grouped peaks are. High = peaks form 'mountain ranges' with neutral ridges between them.",
    example: "Modularity in biological systems"
  },
  correlationLength: {
    desc: "Spatial smoothness scale. High = nearby points have similar fitness. Low = chaotic, uncorrelated.",
    example: "Epistasis strength in genetics"
  },
  valleyDepth: {
    desc: "How deep valleys are between peaks. Deep valleys = strong fitness barriers, isolated basins.",
    example: "Speciation barriers in evolution"
  },
  asymmetry: {
    desc: "Peak shape irregularity. High = elongated, ridge-like peaks with directional gradients.",
    example: "Anisotropic selection pressures"
  }
};

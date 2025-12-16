import { vec3 } from './physics';

export function createClassifier() {
  let history = [];
  let current = 'analyzing';
  let prevMaxExt = 0;
  
  return (traj, vels, params) => {
    if (traj.length < 200) return { type: 'analyzing', confidence: 0 };
    
    const recent = traj.slice(-150);
    const recentVel = vels.slice(-150);
    const avgVel = recentVel.reduce((a, b) => a + b, 0) / recentVel.length;
    const velVar = recentVel.reduce((a, v) => a + (v - avgVel) ** 2, 0) / recentVel.length;
    
    const centroid = recent.reduce((a, p) => vec3.add(a, p), [0, 0, 0]).map(v => v / recent.length);
    const dists = recent.map(p => vec3.length(vec3.sub(p, centroid)));
    const avgDist = dists.reduce((a, b) => a + b, 0) / dists.length;
    const maxExt = Math.max(...traj.slice(-200).map(p => vec3.length(p)));
    
    const isGrowing = maxExt > prevMaxExt * 1.1 && maxExt > 50;
    prevMaxExt = maxExt;
    
    // Check which mode we're in
    const isVanDerPol = params.coupling < 0.3;
    
    // Wing switching (Lorenz signature)
    let hasWingSwitching = false;
    if (!isVanDerPol) {
      const xValues = recent.map(p => p[0]);
      let signChanges = 0;
      for (let i = 1; i < xValues.length; i++) {
        if (xValues[i] * xValues[i-1] < 0) signChanges++;
      }
      hasWingSwitching = signChanges > 2;
    }
    
    let detected = 'transient';
    
    if (maxExt > 60 || isGrowing) {
      detected = 'unbounded';
    } else if (avgVel < 0.5 && avgDist < 2 && velVar < 0.3) {
      detected = 'point';
    } else if (isVanDerPol && avgVel > 0.3) {
      detected = 'limit-cycle';
    } else if (hasWingSwitching) {
      detected = 'strange';
    } else if (avgVel > 0.5 && avgDist > 3) {
      detected = 'strange';
    }
    
    history.push(detected);
    if (history.length > 20) history.shift();
    
    const count = history.filter(t => t === detected).length;
    if (count >= 12 || (detected === current && count >= 5)) {
      current = detected;
    }
    
    return { type: current, confidence: 0.8 };
  };
}

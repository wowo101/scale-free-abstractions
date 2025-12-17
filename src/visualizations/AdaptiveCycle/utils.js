import { PHASES } from './data';

/**
 * Holling's Adaptive Cycle - 3D B-Spline Model
 * 
 * The cycle forms a 3D figure-8 with two lobes at different depths:
 *   - LEFT lobe (r and α): HIGH resilience, front of cube
 *   - RIGHT lobe (K and Ω): LOW resilience, back of cube
 * 
 * Flow direction: r → K → Ω → α → r
 */

// Convert from [0,1] to centered [-1,1] space for rendering
function toCanvasCoords(p, c, r) {
  return {
    x: (c - 0.5) * 2,  // connectedness: 0→-1, 1→+1
    y: (p - 0.5) * 2,  // potential: 0→-1, 1→+1
    z: (0.5 - r) * 2,  // resilience: 0→+1 (front), 1→-1 (back)
  };
}

/**
 * Control points for B-spline curve (in normalized 0-1 space)
 * Format: [potential, connectedness, resilience]
 */
const CONTROL_POINTS = [
  [0.75, 0.00, 0.75],    // 0: α (reorganization)
  [0.15, 0.15, 0.95],    // 1: toward r
  [0.25, 0.45, 0.75],    // 2: r (exploitation)
  [0.60, 0.75, 0.40],    // 3: growth (crossing)
  [1.00, 0.95, 0.00],    // 4: K (conservation)
  [0.50, 0.96, 0.05],    // 5: toward Ω
  [0.00, 0.85, 0.00],    // 6: Ω (release)
  [0.40, 0.40, 0.40],    // 7: recomb (crossing)
];

// Convert control points to canvas coordinates
function getControlPointsCanvas() {
  return CONTROL_POINTS.map(([p, c, r]) => toCanvasCoords(p, c, r));
}

/**
 * Cubic B-spline basis function (uniform, non-rational)
 */
function bsplineBasis(u) {
  const u2 = u * u;
  const u3 = u2 * u;
  const oneMinusU = 1 - u;
  const oneMinusU3 = oneMinusU * oneMinusU * oneMinusU;
  
  return [
    oneMinusU3 / 6,
    (3*u3 - 6*u2 + 4) / 6,
    (-3*u3 + 3*u2 + 3*u + 1) / 6,
    u3 / 6,
  ];
}

/**
 * Evaluate cubic B-spline at parameter t for a closed curve
 */
function evaluateBSpline(t, points) {
  const n = points.length;
  const segmentFloat = t * n;
  const segmentIndex = Math.floor(segmentFloat) % n;
  const u = segmentFloat - Math.floor(segmentFloat);
  
  const p0 = points[(segmentIndex - 1 + n) % n];
  const p1 = points[segmentIndex];
  const p2 = points[(segmentIndex + 1) % n];
  const p3 = points[(segmentIndex + 2) % n];
  
  const basis = bsplineBasis(u);
  
  return {
    x: basis[0]*p0.x + basis[1]*p1.x + basis[2]*p2.x + basis[3]*p3.x,
    y: basis[0]*p0.y + basis[1]*p1.y + basis[2]*p2.y + basis[3]*p3.y,
    z: basis[0]*p0.z + basis[1]*p1.z + basis[2]*p2.z + basis[3]*p3.z,
  };
}

/**
 * Calculate position on the adaptive cycle using B-spline interpolation
 */
export function getCyclePosition(t) {
  const normalized = ((t % 1) + 1) % 1;
  const points = getControlPointsCanvas();
  return evaluateBSpline(normalized, points);
}

/**
 * Get the current phase based on cycle progress
 */
export function getPhase(t) {
  const normalized = ((t % 1) + 1) % 1;
  
  if (normalized < 0.15) return 'alpha';
  if (normalized < 0.40) return 'r';
  if (normalized < 0.5625) return 'K';
  if (normalized < 0.8125) return 'omega';
  return 'alpha';
}

// Trajectory state for bundled attractor visualization
let trajectoryOffset = { x: 0, y: 0, z: 0 };
let pendingDrift = { x: 0, y: 0, z: 0 };
let cycleCount = 0;
let lastT = 0;

// Spread configuration
const DRIFT_AMOUNT = 0.100;
const MAX_OFFSET = 0.500;
const SPREAD_MIN = 0.30;
const SPREAD_MAX = 2.00;
const DRIFT_SMOOTHING = 0.1;

/**
 * Simulate one step of the adaptive cycle
 * 
 * Uses persistent trajectory offsets that drift each cycle, modulated by
 * basin width to create bundled trajectories that reveal the attractor structure.
 */
export function stepCycle(state) {
  const dt = 0.003;
  let newT = (state.t + dt) % 1;
  
  // Detect cycle completion - schedule drift to apply gradually
  if (newT < lastT && lastT > 0.9) {
    cycleCount++;
    pendingDrift = {
      x: pendingDrift.x + (Math.random() - 0.5) * DRIFT_AMOUNT,
      y: pendingDrift.y + (Math.random() - 0.5) * DRIFT_AMOUNT,
      z: pendingDrift.z + (Math.random() - 0.5) * DRIFT_AMOUNT,
    };
  }
  lastT = newT;
  
  // Gradually apply pending drift (smooth transition)
  if (Math.abs(pendingDrift.x) > 0.0001 || Math.abs(pendingDrift.y) > 0.0001 || Math.abs(pendingDrift.z) > 0.0001) {
    const applyX = pendingDrift.x * DRIFT_SMOOTHING;
    const applyY = pendingDrift.y * DRIFT_SMOOTHING;
    const applyZ = pendingDrift.z * DRIFT_SMOOTHING;
    
    trajectoryOffset.x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, trajectoryOffset.x + applyX));
    trajectoryOffset.y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, trajectoryOffset.y + applyY));
    trajectoryOffset.z = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, trajectoryOffset.z + applyZ));
    
    pendingDrift.x -= applyX;
    pendingDrift.y -= applyY;
    pendingDrift.z -= applyZ;
  }
  
  const pos = getCyclePosition(newT);
  const basinWidth = getBasinWidth(newT);
  
  // Scale offset by basin width
  const spreadRange = SPREAD_MAX - SPREAD_MIN;
  const spreadMultiplier = SPREAD_MIN + (basinWidth - 0.25) * (spreadRange / 0.6);
  
  const scaledOffset = {
    x: trajectoryOffset.x * spreadMultiplier,
    y: trajectoryOffset.y * spreadMultiplier,
    z: trajectoryOffset.z * spreadMultiplier,
  };
  
  return {
    t: newT,
    potential: pos.y + scaledOffset.y,
    connectedness: pos.x + scaledOffset.x,
    resilience: pos.z + scaledOffset.z,
    phase: getPhase(newT),
    cycleCount,
  };
}

/**
 * Reset trajectory state
 */
export function resetTrajectory() {
  trajectoryOffset = { x: 0, y: 0, z: 0 };
  pendingDrift = { x: 0, y: 0, z: 0 };
  cycleCount = 0;
  lastT = 0;
}

/**
 * Calculate basin width based on cycle position
 */
export function getBasinWidth(t) {
  const normalized = ((t % 1) + 1) % 1;
  const widthCycle = 0.5 + 0.3 * Math.cos(normalized * Math.PI * 2 + Math.PI * 0.3);
  return Math.max(0.25, Math.min(0.85, widthCycle));
}

/**
 * Calculate basin depth based on cycle position
 */
export function getBasinDepth(t) {
  const normalized = ((t % 1) + 1) % 1;
  const depthCycle = 0.5 + 0.35 * Math.sin(normalized * Math.PI * 2 - Math.PI * 0.2);
  return Math.max(0.15, Math.min(0.9, depthCycle));
}

/**
 * Calculate system metrics for visualization
 */
export function getSystemMetrics(t) {
  const pos = getCyclePosition(t);
  const phase = getPhase(t);
  const basinWidth = getBasinWidth(t);
  const basinDepth = getBasinDepth(t);
  
  return {
    resilience: Math.max(0, Math.min(1, (pos.z + 1) / 2)),
    potential: Math.max(0, Math.min(1, (pos.y + 1) / 2)),
    connectedness: Math.max(0, Math.min(1, (pos.x + 1) / 2)),
    basinWidth,
    basinDepth,
    phase,
  };
}

/**
 * Get phase color with optional intensity
 */
export function getPhaseColor(phase, intensity = 1) {
  const baseColor = PHASES[phase]?.color || '#888888';
  if (intensity === 1) return baseColor;
  
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${intensity})`;
}

/**
 * Get positions for phase labels on the cycle
 */
export function getPhaseLabels() {
  return [
    { phase: 'alpha', t: 0.0, label: 'α' },
    { phase: 'r', t: 0.25, label: 'r' },
    { phase: 'K', t: 0.5, label: 'K' },
    { phase: 'omega', t: 0.75, label: 'Ω' },
  ];
}

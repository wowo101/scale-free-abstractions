// Vector utilities
export const vec3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (v, s) => [v[0] * s, v[1] * s, v[2] * s],
  length: (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
};

// Compute derivatives for the dynamical system
export function computeDerivatives(state, params) {
  const [x, y, z] = state;
  const { coupling, driving, dissipation, nonlinearity, feedback } = params;
  
  // Van der Pol mode: coupling < 0.3 triggers limit cycle oscillator
  const isVanDerPol = coupling < 0.3;
  
  if (isVanDerPol) {
    // Van der Pol oscillator in 3D
    const mu = driving * 4;
    const omega = 0.5 + dissipation;
    const amp = 1 + nonlinearity * 2;
    
    const dx = y * omega;
    const dy = (mu * (1 - (x/amp) * (x/amp)) * y - x) * omega;
    const dz = (x * 0.3 - z * 0.5);
    
    return [dx, dy, dz];
  } else {
    // Lorenz system for strange attractors
    const sigma = coupling * 10;
    const rho = driving * 35;
    const beta = 0.5 + dissipation * 4;
    
    const dx = sigma * (y - x) - feedback * 2 * x * Math.abs(x) * 0.1;
    const dy = x * (rho - nonlinearity * z) - y - feedback * 2 * y * Math.abs(y) * 0.05;
    const dz = nonlinearity * x * y - beta * z;
    return [dx, dy, dz];
  }
}

// 4th-order Runge-Kutta integration step
export function rk4Step(state, params, dt) {
  const k1 = computeDerivatives(state, params);
  const k2 = computeDerivatives(vec3.add(state, vec3.scale(k1, dt / 2)), params);
  const k3 = computeDerivatives(vec3.add(state, vec3.scale(k2, dt / 2)), params);
  const k4 = computeDerivatives(vec3.add(state, vec3.scale(k3, dt)), params);
  return [
    state[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    state[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    state[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])
  ];
}

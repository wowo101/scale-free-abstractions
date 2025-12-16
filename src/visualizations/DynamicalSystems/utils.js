// Re-export viridis from shared colors
export { viridis } from '../../utils/colors';

// 3D projection
export function project3D(p, rot, scale, off) {
  const x1 = p[0] * Math.cos(rot.ry) - p[2] * Math.sin(rot.ry);
  const z1 = p[0] * Math.sin(rot.ry) + p[2] * Math.cos(rot.ry);
  const y2 = p[1] * Math.cos(rot.rx) - z1 * Math.sin(rot.rx);
  const z2 = p[1] * Math.sin(rot.rx) + z1 * Math.cos(rot.rx);
  const persp = 300 / (300 + z2);
  return { x: off.x + x1 * scale * persp, y: off.y - y2 * scale * persp, z: z2 };
}

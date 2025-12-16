// Viridis color scale
export function viridis(t) {
  t = Math.max(0, Math.min(1, t));
  const c = [
    [68,1,84], [72,35,116], [64,67,135], [52,94,141], [41,120,142],
    [32,144,140], [34,167,132], [68,190,112], [121,209,81], [189,222,38], [253,231,36]
  ];
  const idx = t * (c.length - 1);
  const i = Math.floor(idx), f = idx - i;
  if (i >= c.length - 1) return c[c.length - 1];
  return [
    Math.round(c[i][0] + f * (c[i+1][0] - c[i][0])),
    Math.round(c[i][1] + f * (c[i+1][1] - c[i][1])),
    Math.round(c[i][2] + f * (c[i+1][2] - c[i][2]))
  ];
}

// 3D projection
export function project3D(p, rot, scale, off) {
  const x1 = p[0] * Math.cos(rot.ry) - p[2] * Math.sin(rot.ry);
  const z1 = p[0] * Math.sin(rot.ry) + p[2] * Math.cos(rot.ry);
  const y2 = p[1] * Math.cos(rot.rx) - z1 * Math.sin(rot.rx);
  const z2 = p[1] * Math.sin(rot.rx) + z1 * Math.cos(rot.rx);
  const persp = 300 / (300 + z2);
  return { x: off.x + x1 * scale * persp, y: off.y - y2 * scale * persp, z: z2 };
}

// Shared color utility functions

// Viridis color scale - perceptually uniform sequential colormap
export function viridis(t) {
  t = Math.max(0, Math.min(1, t));
  const c = [
    [68, 1, 84], [72, 35, 116], [64, 67, 135], [52, 94, 141], [41, 120, 142],
    [32, 144, 140], [34, 167, 132], [68, 190, 112], [121, 209, 81], [189, 222, 38], [253, 231, 36]
  ];
  const idx = t * (c.length - 1);
  const i = Math.floor(idx), f = idx - i;
  if (i >= c.length - 1) return c[c.length - 1];
  return [
    Math.round(c[i][0] + f * (c[i + 1][0] - c[i][0])),
    Math.round(c[i][1] + f * (c[i + 1][1] - c[i][1])),
    Math.round(c[i][2] + f * (c[i + 1][2] - c[i][2]))
  ];
}

// Color schemes for landscapes and heatmaps
export const COLOR_SCHEMES = {
  viridis: [
    [68, 1, 84], [72, 36, 117], [65, 68, 135], [53, 95, 141],
    [42, 120, 142], [33, 145, 140], [34, 168, 132], [68, 191, 112],
    [122, 209, 81], [189, 223, 38], [253, 231, 37]
  ],
  thermal: [
    [0, 0, 50], [20, 0, 80], [60, 0, 110], [100, 20, 100],
    [140, 40, 70], [180, 60, 40], [220, 100, 20], [240, 150, 30],
    [255, 200, 80], [255, 240, 150]
  ],
  terrain: [
    [40, 70, 120], [50, 120, 100], [70, 150, 80], [120, 170, 80],
    [170, 180, 100], [200, 170, 120], [180, 140, 110], [200, 190, 180],
    [230, 230, 230], [255, 255, 255]
  ]
};

// Interpolate within a color scheme based on normalized value [0,1]
export function getColor(value, colorScheme = 'viridis') {
  const colors = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.viridis;
  const idx = Math.min(value, 0.999) * (colors.length - 1);
  const i = Math.floor(idx);
  const t = idx - i;
  const c1 = colors[i];
  const c2 = colors[Math.min(i + 1, colors.length - 1)];

  return [
    Math.round(c1[0] + t * (c2[0] - c1[0])),
    Math.round(c1[1] + t * (c2[1] - c1[1])),
    Math.round(c1[2] + t * (c2[2] - c1[2]))
  ];
}

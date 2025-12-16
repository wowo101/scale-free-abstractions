import React, { useRef, useEffect } from 'react';
import { getColor } from './utils';

export default function ContourView({ heights, resolution, colorScheme, zoom }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
    
    const size = Math.max(width, height) * 2 * zoom;
    const offsetX = (width - size) / 2;
    const offsetY = (height - size) / 2 + height * 0.15;
    const cellSize = size / resolution;
    
    // Draw heatmap base
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const h = heights[i * resolution + j];
        const [r, g, b] = getColor(h, colorScheme);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(offsetX + j * cellSize, offsetY + i * cellSize, cellSize + 1, cellSize + 1);
      }
    }
    
    // Draw contour lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    
    const levels = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    
    for (const level of levels) {
      for (let i = 0; i < resolution - 1; i++) {
        for (let j = 0; j < resolution - 1; j++) {
          const h00 = heights[i * resolution + j];
          const h10 = heights[i * resolution + j + 1];
          const h01 = heights[(i + 1) * resolution + j];
          const h11 = heights[(i + 1) * resolution + j + 1];
          
          const crossings = [];
          
          if ((h00 < level) !== (h10 < level)) {
            const t = (level - h00) / (h10 - h00);
            crossings.push({ x: offsetX + (j + t) * cellSize, y: offsetY + i * cellSize });
          }
          if ((h10 < level) !== (h11 < level)) {
            const t = (level - h10) / (h11 - h10);
            crossings.push({ x: offsetX + (j + 1) * cellSize, y: offsetY + (i + t) * cellSize });
          }
          if ((h01 < level) !== (h11 < level)) {
            const t = (level - h01) / (h11 - h01);
            crossings.push({ x: offsetX + (j + t) * cellSize, y: offsetY + (i + 1) * cellSize });
          }
          if ((h00 < level) !== (h01 < level)) {
            const t = (level - h00) / (h01 - h00);
            crossings.push({ x: offsetX + j * cellSize, y: offsetY + (i + t) * cellSize });
          }
          
          if (crossings.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(crossings[0].x, crossings[0].y);
            ctx.lineTo(crossings[1].x, crossings[1].y);
            ctx.stroke();
          }
        }
      }
    }
  }, [heights, resolution, colorScheme, zoom]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={1400} 
      height={900} 
      className="w-full h-full object-cover" 
    />
  );
}

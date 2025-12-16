import React, { useRef, useEffect } from 'react';
import { getColor } from './utils';

export default function Heatmap({ heights, resolution, colorScheme, zoom }) {
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
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const h = heights[i * resolution + j];
        const [r, g, b] = getColor(h, colorScheme);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(offsetX + j * cellSize, offsetY + i * cellSize, cellSize + 1, cellSize + 1);
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

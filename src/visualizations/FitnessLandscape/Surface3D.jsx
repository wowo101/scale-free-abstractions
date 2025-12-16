import React, { useRef, useEffect } from 'react';
import { getColor } from './utils';

export default function Surface3D({ heights, resolution, colorScheme, rotation, zoom }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2 + height * 0.15;
    const baseScale = (Math.min(width, height) / 1.8) * 2 * zoom;
    const scale = baseScale / resolution;
    
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    
    const transform = (x, y, z) => {
      let rx = x * cosY - z * sinY;
      let rz = x * sinY + z * cosY;
      let ry = y * cosX - rz * sinX;
      rz = y * sinX + rz * cosX;
      return { x: rx, y: ry, z: rz };
    };
    
    const faces = [];
    const step = Math.max(1, Math.floor(resolution / 80));
    
    for (let i = 0; i < resolution - step; i += step) {
      for (let j = 0; j < resolution - step; j += step) {
        const getPoint = (ii, jj) => {
          const x = (jj - resolution / 2) * scale;
          const y = (ii - resolution / 2) * scale;
          const z = heights[ii * resolution + jj] * baseScale * 0.4;
          return transform(x, y, z);
        };
        
        const p1 = getPoint(i, j);
        const p2 = getPoint(i, j + step);
        const p3 = getPoint(i + step, j + step);
        const p4 = getPoint(i + step, j);
        
        const avgHeight = (
          heights[i * resolution + j] +
          heights[i * resolution + j + step] +
          heights[(i + step) * resolution + j + step] +
          heights[(i + step) * resolution + j]
        ) / 4;
        
        const depth = (p1.z + p2.z + p3.z + p4.z) / 4;
        faces.push({ points: [p1, p2, p3, p4], depth, height: avgHeight });
      }
    }
    
    faces.sort((a, b) => a.depth - b.depth);
    
    for (const face of faces) {
      const [r, g, b] = getColor(face.height, colorScheme);
      const light = 0.35 + face.height * 0.65;
      
      ctx.fillStyle = `rgb(${Math.floor(r * light)}, ${Math.floor(g * light)}, ${Math.floor(b * light)})`;
      ctx.strokeStyle = `rgba(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 0.5)}, 0.25)`;
      ctx.lineWidth = 0.5;
      
      ctx.beginPath();
      ctx.moveTo(centerX - face.points[0].x, centerY + face.points[0].y);
      for (let k = 1; k < 4; k++) {
        ctx.lineTo(centerX - face.points[k].x, centerY + face.points[k].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }, [heights, resolution, colorScheme, rotation, zoom]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={1400} 
      height={900} 
      className="w-full h-full object-cover"
    />
  );
}

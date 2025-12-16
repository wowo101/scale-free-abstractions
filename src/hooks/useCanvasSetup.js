import { useRef, useState, useEffect, useCallback } from 'react';
import useViewportSize from './useViewportSize';

export default function useCanvasSetup({
  width: customWidth = null,
  height: customHeight = null,
  pixelRatio = null,
  backgroundColor = '#0a0a0f',
} = {}) {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const viewport = useViewportSize();
  
  const width = customWidth ?? viewport.width;
  const height = customHeight ?? viewport.height;
  const dpr = pixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    
    // Set canvas size accounting for device pixel ratio
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Scale context to account for DPR
    context.scale(dpr, dpr);
    
    setCtx(context);
  }, [width, height, dpr]);
  
  const clear = useCallback((color = backgroundColor) => {
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.restore();
  }, [ctx, backgroundColor]);
  
  return {
    canvasRef,
    ctx,
    width,
    height,
    dpr,
    clear,
  };
}

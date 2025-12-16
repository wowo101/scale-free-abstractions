import { useState, useRef, useCallback, useEffect } from 'react';

export default function useDragRotation({
  initialRotation = { x: 0.3, y: 0 },
  sensitivity = 0.008,
  autoRotate = false,
  autoRotateSpeed = 0.3,
  bounds = null,
} = {}) {
  const [rotation, setRotation] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  
  // Apply bounds if specified
  const clampRotation = useCallback((rot) => {
    if (!bounds) return rot;
    return {
      x: bounds.x ? Math.max(bounds.x.min, Math.min(bounds.x.max, rot.x)) : rot.x,
      y: bounds.y ? Math.max(bounds.y.min, Math.min(bounds.y.max, rot.y)) : rot.y,
    };
  }, [bounds]);
  
  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating || isDragging) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }
    
    let lastTime = performance.now();
    
    const animate = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      setRotation(prev => clampRotation({
        ...prev,
        y: prev.y + autoRotateSpeed * dt,
      }));
      
      animFrameRef.current = requestAnimationFrame(animate);
    };
    
    animFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isAutoRotating, isDragging, autoRotateSpeed, clampRotation]);
  
  const onMouseDown = useCallback((e) => {
    setIsDragging(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);
  
  const onMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    
    setRotation(prev => clampRotation({
      x: prev.x - dy * sensitivity,
      y: prev.y - dx * sensitivity,
    }));
    
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, sensitivity, clampRotation]);
  
  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const onMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Touch handlers
  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      lastPosRef.current = { 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      };
    }
  }, []);
  
  const onTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const dx = e.touches[0].clientX - lastPosRef.current.x;
    const dy = e.touches[0].clientY - lastPosRef.current.y;
    
    setRotation(prev => clampRotation({
      x: prev.x - dy * sensitivity,
      y: prev.y - dx * sensitivity,
    }));
    
    lastPosRef.current = { 
      x: e.touches[0].clientX, 
      y: e.touches[0].clientY 
    };
  }, [isDragging, sensitivity, clampRotation]);
  
  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  return {
    rotation,
    setRotation,
    isDragging,
    setAutoRotate: setIsAutoRotating,
    isAutoRotating,
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}

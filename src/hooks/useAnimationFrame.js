import { useRef, useEffect, useCallback, useState } from 'react';

export default function useAnimationFrame({
  callback,
  fps = null,
  paused = false,
  deps = [],
}) {
  const frameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const frameInterval = fps ? 1000 / fps : 0;
  
  const animate = useCallback((timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - startTimeRef.current;
    const delta = timestamp - lastTimeRef.current;
    
    // If fps is set, throttle to target frame rate
    if (!fps || delta >= frameInterval) {
      callback(delta, elapsed);
      lastTimeRef.current = timestamp;
      frameCountRef.current++;
    }
    
    frameRef.current = requestAnimationFrame(animate);
  }, [callback, fps, frameInterval]);
  
  useEffect(() => {
    if (paused) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      setIsRunning(false);
      return;
    }
    
    setIsRunning(true);
    lastTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [animate, paused, ...deps]);
  
  const start = useCallback(() => {
    if (!frameRef.current) {
      startTimeRef.current = 0;
      lastTimeRef.current = performance.now();
      frameRef.current = requestAnimationFrame(animate);
      setIsRunning(true);
    }
  }, [animate]);
  
  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      setIsRunning(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    startTimeRef.current = 0;
    frameCountRef.current = 0;
    lastTimeRef.current = performance.now();
  }, []);
  
  return {
    start,
    stop,
    reset,
    isRunning,
    frameCount: frameCountRef.current,
  };
}

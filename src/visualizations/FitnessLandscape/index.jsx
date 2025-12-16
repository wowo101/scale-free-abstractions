import React, { useState, useMemo, useCallback } from 'react';
import { BackButton, GlassPanel, ParameterSlider, Button, ButtonGroup } from '../../components/shared';
import { useDragRotation } from '../../hooks';
import { generateLandscape, calculateStats, parameterInfo } from './utils';
import Surface3D from './Surface3D';
import Heatmap from './Heatmap';
import ContourView from './ContourView';
import StrategyInfo from './StrategyInfo';

// Helper for pinch zoom
function getTouchDistance(touches) {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function FitnessLandscape() {
  const [params, setParams] = useState({
    resolution: 96,
    peakiness: 0.7,
    numPeaks: 12,
    clusterTightness: 0.5,
    correlationLength: 4,
    valleyDepth: 0.5,
    asymmetry: 0.3
  });
  
  const [colorScheme, setColorScheme] = useState('viridis');
  const [seed, setSeed] = useState(42);
  const [viewMode, setViewMode] = useState('3d');
  const [panelOpen, setPanelOpen] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [showStrategyInfo, setShowStrategyInfo] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  
  const { rotation, isDragging, handlers } = useDragRotation({
    initialRotation: { x: 1.05, y: 0.26 },
    bounds: { x: { min: 0.1, max: Math.PI / 2 } },
  });
  
  const heights = useMemo(() => generateLandscape(params, seed), [params, seed]);
  const stats = useMemo(() => calculateStats(heights, params.resolution), [heights, params.resolution]);
  
  const updateParam = (key, value) => setParams(prev => ({ ...prev, [key]: value }));
  
  // Wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  }, []);
  
  // Touch pinch zoom
  const lastPinchRef = React.useRef(0);
  const isPinchingRef = React.useRef(false);
  
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      isPinchingRef.current = true;
      lastPinchRef.current = getTouchDistance(e.touches);
    } else if (viewMode === '3d') {
      handlers.onTouchStart(e);
    }
  };
  
  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && isPinchingRef.current) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const delta = currentDistance / lastPinchRef.current;
      setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
      lastPinchRef.current = currentDistance;
    } else if (viewMode === '3d') {
      handlers.onTouchMove(e);
    }
  };
  
  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      isPinchingRef.current = false;
    }
    handlers.onTouchEnd(e);
  };
  
  return (
    <div className="w-full h-screen bg-canvas overflow-hidden relative touch-none">
      {/* Full viewport canvas */}
      <div 
        className={`absolute inset-0 ${viewMode === '3d' ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
        onMouseDown={viewMode === '3d' ? handlers.onMouseDown : undefined}
        onMouseMove={viewMode === '3d' ? handlers.onMouseMove : undefined}
        onMouseUp={handlers.onMouseUp}
        onMouseLeave={handlers.onMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {viewMode === '3d' && (
          <Surface3D 
            heights={heights} 
            resolution={params.resolution}
            colorScheme={colorScheme} 
            rotation={rotation} 
            zoom={zoom} 
          />
        )}
        {viewMode === 'contour' && (
          <ContourView 
            heights={heights} 
            resolution={params.resolution} 
            colorScheme={colorScheme} 
            zoom={zoom} 
          />
        )}
        {viewMode === '2d' && (
          <Heatmap 
            heights={heights} 
            resolution={params.resolution} 
            colorScheme={colorScheme} 
            zoom={zoom} 
          />
        )}
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 glass-panel px-2 py-1 text-xs text-slate-400 z-20">
        {Math.round(zoom * 100)}%
      </div>
      
      {/* Floating control panel */}
      <div className={`absolute top-4 left-4 transition-all duration-300 z-30 ${panelOpen ? 'w-56' : 'w-auto'}`}>
        <GlassPanel accent="indigo">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setPanelOpen(!panelOpen)}
          >
            <div className="flex items-center gap-2">
              <div onClick={(e) => e.stopPropagation()}>
                <BackButton />
              </div>
              <h1 className="text-sm font-semibold text-slate-200">Fitness Landscape</h1>
            </div>
            <div className="flex items-center gap-2">
              {panelOpen && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowTooltips(!showTooltips); }}
                  className={`p-0.5 rounded transition ${showTooltips ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Toggle parameter tooltips"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              <button className="text-slate-400 hover:text-slate-200 text-xs">
                {panelOpen ? '−' : '+'}
              </button>
            </div>
          </div>
          
          {panelOpen && (
            <div className="mt-3">
              {/* View mode selector */}
              <ButtonGroup gap="sm" className="mb-3">
                {['3d', 'contour', '2d'].map(mode => (
                  <Button 
                    key={mode} 
                    onClick={() => setViewMode(mode)}
                    variant="secondary"
                    active={viewMode === mode}
                    accent="indigo"
                    size="sm"
                    fullWidth
                  >
                    {mode.toUpperCase()}
                  </Button>
                ))}
              </ButtonGroup>
              
              {/* Parameter sliders */}
              <div className="space-y-2">
                <ParameterSlider 
                  label="Peakiness" 
                  value={params.peakiness} 
                  onChange={(v) => updateParam('peakiness', v)}
                  min={0.1} max={1} step={0.05}
                  tooltip={showTooltips ? parameterInfo.peakiness : null}
                  accent="indigo"
                />
                <ParameterSlider 
                  label="Peaks" 
                  value={params.numPeaks} 
                  onChange={(v) => updateParam('numPeaks', Math.round(v))}
                  min={3} max={40} step={1}
                  tooltip={showTooltips ? parameterInfo.numPeaks : null}
                  accent="indigo"
                />
                <ParameterSlider 
                  label="Clustering" 
                  value={params.clusterTightness} 
                  onChange={(v) => updateParam('clusterTightness', v)}
                  min={0} max={1} step={0.05}
                  tooltip={showTooltips ? parameterInfo.clusterTightness : null}
                  accent="indigo"
                />
                <ParameterSlider 
                  label="Correlation" 
                  value={params.correlationLength} 
                  onChange={(v) => updateParam('correlationLength', v)}
                  min={1} max={12} step={0.5}
                  tooltip={showTooltips ? parameterInfo.correlationLength : null}
                  accent="indigo"
                />
                <ParameterSlider 
                  label="Valley Depth" 
                  value={params.valleyDepth} 
                  onChange={(v) => updateParam('valleyDepth', v)}
                  min={0} max={1} step={0.05}
                  tooltip={showTooltips ? parameterInfo.valleyDepth : null}
                  accent="indigo"
                />
                <ParameterSlider 
                  label="Asymmetry" 
                  value={params.asymmetry} 
                  onChange={(v) => updateParam('asymmetry', v)}
                  min={0} max={1} step={0.05}
                  tooltip={showTooltips ? parameterInfo.asymmetry : null}
                  accent="indigo"
                />
              </div>
              
              {/* Color scheme selector */}
              <ButtonGroup gap="sm" className="mt-3 mb-3">
                {['viridis', 'thermal', 'terrain'].map(scheme => (
                  <Button 
                    key={scheme} 
                    onClick={() => setColorScheme(scheme)}
                    variant="secondary"
                    active={colorScheme === scheme}
                    accent="indigo"
                    size="sm"
                    fullWidth
                  >
                    {scheme}
                  </Button>
                ))}
              </ButtonGroup>
              
              {/* New landscape button */}
              <Button 
                onClick={() => setSeed(Math.floor(Math.random() * 10000))}
                variant="primary"
                accent="indigo"
                fullWidth
                className="mb-3"
              >
                New Landscape
              </Button>
              
              {/* Stats */}
              <div className="flex gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Peaks:</span>{' '}
                  <span className="text-indigo-400 font-medium">{stats.localMaxima}</span>
                </div>
                <div>
                  <span className="text-slate-500">Rugged:</span>{' '}
                  <span className="text-purple-400 font-medium">{stats.ruggedness}</span>
                </div>
              </div>
              
              {/* Strategy guide toggle */}
              <button 
                onClick={() => setShowStrategyInfo(!showStrategyInfo)}
                className="w-full mt-3 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs text-slate-400 transition"
              >
                {showStrategyInfo ? 'Hide' : 'Show'} Strategy Guide
              </button>
            </div>
          )}
        </GlassPanel>
      </div>
      
      {/* Strategy info panel */}
      {showStrategyInfo && <StrategyInfo onClose={() => setShowStrategyInfo(false)} />}
      
      {/* Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-600 z-10">
        {viewMode === '3d' ? 'Drag to rotate • Scroll to zoom' : 'Scroll to zoom'}
      </div>
    </div>
  );
}

import React from 'react';
import Button, { ButtonGroup } from './Button';
import { getAccent } from '../../styles/theme';

export default function PlaybackControls({
  isPlaying,
  onPlayPause,
  onReset,
  onStep = null,
  onComplete = null,
  statusLabel = null,
  statusValue = null,
  variant = 'inline',
  accent = 'cyan',
}) {
  const accentColors = getAccent(accent);
  
  const controls = (
    <>
      <Button
        onClick={onPlayPause}
        variant="secondary"
        active={isPlaying}
        accent={accent}
      >
        {isPlaying ? 'pause' : 'play'}
      </Button>
      
      {onStep && (
        <Button
          onClick={onStep}
          variant="secondary"
          disabled={isPlaying}
          accent={accent}
        >
          step
        </Button>
      )}
      
      {onComplete && (
        <Button
          onClick={onComplete}
          variant="secondary"
          disabled={isPlaying}
          accent={accent}
        >
          complete
        </Button>
      )}
      
      <Button
        onClick={onReset}
        variant="secondary"
        accent={accent}
      >
        reset
      </Button>
    </>
  );
  
  const status = (statusLabel || statusValue !== null) && (
    <div className="flex items-center gap-1 text-xs">
      {statusLabel && <span className="text-slate-500">{statusLabel}</span>}
      {statusValue !== null && (
        <span className="font-mono" style={{ color: accentColors.primary }}>
          {statusValue}
        </span>
      )}
    </div>
  );
  
  if (variant === 'floating') {
    return (
      <div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-3 py-2 z-30 flex items-center gap-2"
        style={{ borderColor: accentColors.border }}
      >
        <ButtonGroup gap="sm">
          {controls}
        </ButtonGroup>
        
        {status && (
          <>
            <div className="w-px h-4 bg-white/10 mx-1" />
            {status}
          </>
        )}
      </div>
    );
  }
  
  // Inline variant
  return (
    <div className="flex items-center gap-2">
      <ButtonGroup gap="sm">
        {controls}
      </ButtonGroup>
      {status}
    </div>
  );
}

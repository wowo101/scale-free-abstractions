import React from 'react';
import { GlassPanel } from '../../components/shared';

export default function PhaseGuide({ onClose }) {
  return (
    <GlassPanel
      position="top-right"
      width={280}
      accent="cyan"
      title="Phase Guide"
      headerActions={
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 text-base leading-none"
        >
          ×
        </button>
      }
    >
      <div className="flex flex-col gap-4 text-xs leading-relaxed mt-3">
        <div>
          <h3 className="text-cyan-400 font-semibold mb-1">Subcritical</h3>
          <p className="text-slate-400">
            System building up. Mostly dark cells with scattered bright spots. Small, localized avalanches.
          </p>
        </div>
        
        <div>
          <h3 className="text-amber-400 font-semibold mb-1">Critical</h3>
          <p className="text-slate-400">
            Edge of chaos. Uniform texture—most cells near threshold. Scale-free behavior: avalanches of all sizes, power-law distributed.
          </p>
        </div>
        
        <div>
          <h3 className="text-rose-400 font-semibold mb-1">Supercritical</h3>
          <p className="text-slate-400">
            Constant collapse. Red flashing as cells continuously topple. Transient—settles to critical state.
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}

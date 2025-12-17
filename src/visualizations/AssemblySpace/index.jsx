import React from 'react';
import { BackButton, GlassPanel } from '../../components/shared';

export default function AssemblySpaceExplorer() {
  return (
    <div className="w-screen h-screen bg-[#0a0810] font-sans text-slate-200 overflow-hidden flex items-center justify-center">
      <GlassPanel
        position="top-left"
        width={220}
        accent="rose"
        style={{ background: 'rgba(10, 8, 16, 0.95)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BackButton />
          <span className="text-sm font-semibold">Assembly Space</span>
        </div>
      </GlassPanel>
      
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-rose-400 mb-2">Selection-Assembly Space</h1>
        <p className="text-slate-500">Coming soon...</p>
      </div>
    </div>
  );
}

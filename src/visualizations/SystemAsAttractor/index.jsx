import React from 'react';
import { BackButton, GlassPanel } from '../../components/shared';

export default function SystemAsAttractorExplorer() {
  return (
    <div className="w-screen h-screen bg-[#100a08] font-sans text-slate-200 overflow-hidden flex items-center justify-center">
      <GlassPanel
        position="top-left"
        width={220}
        accent="orange"
        style={{ background: 'rgba(16, 10, 8, 0.95)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BackButton />
          <span className="text-sm font-semibold">Identity Through Dynamics</span>
        </div>
      </GlassPanel>
      
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-orange-400 mb-2">System-as-Attractor</h1>
        <p className="text-slate-500">Coming soon...</p>
      </div>
    </div>
  );
}

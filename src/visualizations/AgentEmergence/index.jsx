import React from 'react';
import { BackButton, GlassPanel } from '../../components/shared';

export default function AgentEmergenceExplorer() {
  return (
    <div className="w-screen h-screen bg-[#0a0812] font-sans text-slate-200 overflow-hidden flex items-center justify-center">
      <GlassPanel
        position="top-left"
        width={220}
        accent="violet"
        style={{ background: 'rgba(10, 8, 18, 0.95)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BackButton />
          <span className="text-sm font-semibold">Agent Emergence</span>
        </div>
      </GlassPanel>
      
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-violet-400 mb-2">Agent Emergence</h1>
        <p className="text-slate-500">Coming soon...</p>
      </div>
    </div>
  );
}

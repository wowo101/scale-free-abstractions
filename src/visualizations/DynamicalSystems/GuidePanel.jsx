import React from 'react';
import { GlassPanel } from '../../components/shared';
import { EXPLANATIONS, ATTRACTOR_COLORS } from './data';

export default function GuidePanel({ attractorType }) {
  const exp = EXPLANATIONS[attractorType] || EXPLANATIONS.analyzing;
  const dotColor = ATTRACTOR_COLORS[attractorType] || ATTRACTOR_COLORS.analyzing;
  
  return (
    <GlassPanel
      position="top-right"
      width={260}
      accent="green"
      title="Understanding Attractors"
    >
      <div 
        className="bg-[#12121f] p-3.5 rounded-lg border border-white/10 mt-3"
      >
        <div 
          className="text-xs font-semibold mb-1.5"
          style={{ color: dotColor }}
        >
          {exp.title}
        </div>
        <div className="text-xs text-slate-400 leading-relaxed">
          {exp.desc}
        </div>
        <div className="mt-2.5 px-2.5 py-1.5 bg-[#1a1a2e] rounded text-[11px] text-cyan-400">
          <strong>Mechanism:</strong> {exp.mech}
        </div>
      </div>
      
      <div className="h-px bg-white/10 my-3.5" />
      
      <div className="text-[11px] text-slate-500 italic leading-relaxed mb-3.5">
        The topology of state space fundamentally determines which long-term behaviours are possible – there is no universal path to stability.
      </div>
      
      <div className="text-[10px] text-slate-600">
        Hover over parameters for details
      </div>
    </GlassPanel>
  );
}

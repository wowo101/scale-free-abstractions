import React, { useState } from 'react';
import { GlassPanel } from '../../components/shared';
import { EXPLANATIONS } from './data';

const TABS = [
  { key: 'emergence', label: 'Emergence' },
  { key: 'ei', label: 'EI' },
  { key: 'coarsegraining', label: 'Grouping' },
];

export default function GuidePanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('emergence');
  
  const explanation = EXPLANATIONS[activeTab];
  
  return (
    <GlassPanel
      position="top-right"
      width={280}
      accent="amber"
      style={{ background: 'rgba(15, 15, 10, 0.95)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-amber-400">Guide</span>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 text-lg leading-none"
        >
          ×
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-0.5 bg-white/5 rounded-lg">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all ${
              activeTab === tab.key
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="text-[11px] leading-relaxed text-slate-400 whitespace-pre-line">
        {explanation.content}
      </div>
      
      {/* Visual legend */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Visual Legend
        </div>
        <div className="space-y-2 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-400">Micro states (original)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-400">Macro states (coarse-grained)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-amber-500/50" />
            <span className="text-slate-400">Transition probability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-300" />
            <span className="text-slate-400">Animated probability flow</span>
          </div>
        </div>
      </div>
      
      {/* Key insight */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Key Insight
        </div>
        <p className="text-[10px] text-slate-500 italic">
          "When CE &gt; 0, the macro level isn't just a convenient summary—it captures 
          more causal structure than the micro level. The higher level is more real."
        </p>
      </div>
    </GlassPanel>
  );
}

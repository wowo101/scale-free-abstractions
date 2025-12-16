import React from 'react';
import { GlassPanel } from '../../components/shared';

export default function StrategyInfo({ onClose }) {
  return (
    <GlassPanel
      position="bottom-right"
      width={320}
      accent="indigo"
      title="Navigation Strategies"
      collapsible={false}
      headerActions={
        <button 
          onClick={onClose} 
          className="text-slate-500 hover:text-slate-300 text-xs"
        >
          ✕
        </button>
      }
    >
      <div className="space-y-4 text-xs text-slate-400 mt-3">
        <div>
          <h4 className="text-emerald-400 font-medium mb-1">Smooth Landscapes</h4>
          <p>Gradient ascent works optimally. Local information reliably guides toward global optima. Single agents following fitness gradients will find peaks. Evolution proceeds steadily via incremental improvement.</p>
        </div>
        
        <div>
          <h4 className="text-amber-400 font-medium mb-1">Rugged / Peaky Landscapes</h4>
          <p>Gradient followers get trapped in local optima. Requires stochastic jumps, simulated annealing, or population-based search. Recombination can leap between basins. High mutation rates help escape local traps.</p>
        </div>
        
        <div>
          <h4 className="text-rose-400 font-medium mb-1">Clustered Peaks</h4>
          <p>Creates "super-basins" where neutral drift between nearby peaks is possible. Modularity emerges naturally. Stepping-stone evolution can reach higher peaks via intermediate optima.</p>
        </div>
        
        <div>
          <h4 className="text-sky-400 font-medium mb-1">Deep Valleys</h4>
          <p>Fitness barriers isolate populations. Crossing requires coordinated multi-step moves or environmental change. Valley-crossing is the key evolutionary bottleneck—often requires drift through low-fitness intermediates.</p>
        </div>
        
        <div className="pt-3 border-t border-white/10">
          <p className="text-slate-500 italic">The topology of the fitness landscape fundamentally determines which search strategies can succeed—there is no universal optimizer.</p>
        </div>
      </div>
    </GlassPanel>
  );
}

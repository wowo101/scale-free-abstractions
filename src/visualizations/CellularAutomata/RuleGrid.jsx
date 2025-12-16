import React from 'react';
import { COMPLEXITY_CLASSES, NOTABLE_RULES, getClassForRule } from './data';
import { formatRule } from './utils';

export default function RuleGrid({ currentRule, onSelectRule }) {
  return (
    <div className="flex flex-col border-t border-white/10 mt-2 pt-2 flex-1 min-h-0 overflow-hidden">
      {/* Legend */}
      <div className="flex gap-2 mb-2 text-[9px] flex-wrap flex-shrink-0">
        {Object.entries(COMPLEXITY_CLASSES).map(([key, data]) => (
          <div key={key} className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-sm" 
              style={{ backgroundColor: data.color + '30', border: `1px solid ${data.color}50` }} 
            />
            <span className="text-slate-500">{key}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-2 h-2 rounded-sm" style={{ border: '1px solid #eab308' }} />
          <span className="text-slate-500">notable</span>
        </div>
      </div>
      
      {/* Scrollable grid */}
      <div className="overflow-y-auto flex-1 min-h-0" style={{ scrollbarWidth: 'thin' }}>
        <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
          {Array.from({ length: 256 }, (_, r) => {
            const cls = getClassForRule(r);
            const clsData = COMPLEXITY_CLASSES[cls];
            const isNotable = NOTABLE_RULES.has(r);
            const isCurrent = r === currentRule;
            
            const bgAlpha = isCurrent ? '60' : '20';
            const borderAlpha = isCurrent ? 'cc' : (isNotable ? '' : '40');
            const borderColor = isNotable ? '#eab308' : clsData.color + borderAlpha;
            
            return (
              <button
                key={r}
                onClick={() => onSelectRule(r)}
                className="py-0.5 rounded text-[9px] font-mono border transition-transform hover:scale-110"
                style={{ 
                  backgroundColor: clsData.color + bgAlpha,
                  borderColor: borderColor,
                  color: isCurrent ? '#fff' : clsData.color,
                  fontWeight: isCurrent ? '600' : '400'
                }}
              >
                {formatRule(r)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

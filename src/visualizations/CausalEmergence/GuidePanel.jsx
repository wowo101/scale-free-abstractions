import React, { useState } from 'react';
import { GlassPanel } from '../../components/shared';
import { EXPLANATIONS } from './data';

// Render inline markdown (bold text)
function renderInline(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-slate-200">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Markdown renderer that handles bold text, line breaks, and bullet lists
function renderMarkdown(text) {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  
  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-1.5 space-y-1 pl-4">
          {currentList.map((item, i) => (
            <li key={i} className="relative before:content-['•'] before:absolute before:-left-3 before:text-amber-500/60">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };
  
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2));
    } else {
      flushList();
      if (trimmed) {
        elements.push(
          <React.Fragment key={i}>
            {renderInline(trimmed)}
            <br />
          </React.Fragment>
        );
      } else if (i > 0 && i < lines.length - 1) {
        // Empty line = paragraph break
        elements.push(<br key={i} />);
      }
    }
  });
  
  flushList();
  return elements;
}

const TABS = [
  { key: 'emergence', label: 'Emergence' },
  { key: 'ei', label: 'EI' },
  { key: 'coarsegraining', label: 'Grouping' },
];

export default function GuidePanel() {
  const [activeTab, setActiveTab] = useState('emergence');
  
  const explanation = EXPLANATIONS[activeTab];
  
  return (
    <GlassPanel
      position="top-right"
      width={280}
      accent="amber"
      style={{ background: 'rgba(15, 15, 10, 0.95)' }}
      title="Guide"
    >
      
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
      <div className="text-[11px] leading-relaxed text-slate-400">
        {renderMarkdown(explanation.content)}
      </div>
      
      {/* Visual legend */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Visual Legend
        </div>
        <div className="space-y-1.5 text-[10px]">
          {/* Nodes */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-400">Micro states (original)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-400">Macro states (coarse-grained)</span>
          </div>
          
          {/* Lines */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-amber-500/60 rounded" />
            <span className="text-slate-400">Micro transition (curved)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-green-500/60 rounded" />
            <span className="text-slate-400">Macro transition (straight)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-full border border-amber-500/50" style={{ borderWidth: '1.5px' }} />
            <span className="text-slate-400">Self-loop (stays in state)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0 border-t-2 border-dashed border-white/30" />
            <span className="text-slate-400">Grouping (micro → macro)</span>
          </div>
          
          {/* Animated */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-300" />
            <span className="text-slate-400">Animated probability flow</span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

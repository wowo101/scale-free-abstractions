import React from 'react';

export default function RuleTable({ ruleBinary }) {
  const patterns = ['111', '110', '101', '100', '011', '010', '001', '000'];
  
  return (
    <div className="flex justify-between gap-1">
      {patterns.map((pattern, idx) => (
        <div key={pattern} className="flex flex-col items-center">
          <div className="flex gap-px mb-1">
            {pattern.split('').map((bit, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-sm ${bit === '1' ? 'bg-slate-300' : 'bg-slate-700'}`} 
              />
            ))}
          </div>
          <div 
            className={`w-2 h-2 rounded-sm ${ruleBinary[idx] === '1' ? 'bg-slate-300' : 'bg-slate-700'}`} 
          />
        </div>
      ))}
    </div>
  );
}

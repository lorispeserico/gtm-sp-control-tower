// FILE: src/components/TimelineAxis.tsx
import React from 'react';

interface TimelineAxisProps {
  timeScale: {
    months: { name: string; year: number }[];
    startDay: string;
    endDay: string;
  };
}

export const TimelineAxis: React.FC<TimelineAxisProps> = ({ timeScale }) => {
  return (
    <div className="flex border-b-2 border-slate-100 bg-slate-50/50 py-2 items-center font-semibold text-slate-500 uppercase tracking-wider text-xs">
      {/* Spacer matching the Left Info Pane of our Swimlanes */}
      <div className="w-64 flex-shrink-0 pr-4 pl-4 border-r border-gray-100 select-none">
        Project Details
      </div>

      {/* Monthly Timeline Intervals */}
      <div className="flex-grow flex justify-between relative mx-4">
        {timeScale.months.map((month, idx) => (
          <div 
            key={`${month.name}-${month.year}`} 
            className="flex-1 text-center relative border-l border-slate-200/60 first:border-l-0 py-1"
          >
            <span className="text-slate-700 font-bold">{month.name}</span>
            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{month.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

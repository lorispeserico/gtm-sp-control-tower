// FILE: src/components/ProjectSwimlane.tsx
import React from 'react';
import { Project, ComputedMilestoneSchedule } from '../domain/types';

interface ProjectSwimlaneProps {
  project: Project;
  schedules: ComputedMilestoneSchedule[];
  timeScale: {
    months: { name: string; year: number }[];
    startDay: string;
    endDay: string;
  };
}

export const ProjectSwimlane: React.FC<ProjectSwimlaneProps> = ({ project, schedules, timeScale }) => {
  // Calculates the relative horizontal percentage for positioning nodes on our visual timeline canvas
  const getHorizontalPercentage = (dateStr: string): number => {
    const start = new Date(timeScale.startDay).getTime();
    const end = new Date(timeScale.endDay).getTime();
    const target = new Date(dateStr).getTime();
    
    if (target <= start) return 0;
    if (target >= end) return 100;
    
    return ((target - start) / (end - start)) * 100;
  };

  const getNodeColorClass = (sched: ComputedMilestoneSchedule): string => {
    if (sched.deficitDays > 0) {
      return 'bg-red-600 ring-4 ring-red-100 text-white animate-pulse border-red-700';
    }
    if (sched.varianceDays > 0) {
      return 'bg-amber-500 border-amber-600 text-white';
    }
    return 'bg-emerald-600 border-emerald-700 text-white';
  };

  return (
    <div className="flex border-b border-gray-100 items-center hover:bg-slate-50/80 transition-all duration-150 py-4">
      {/* Left Info Column */}
      <div className="w-64 flex-shrink-0 pr-4 pl-4 border-r border-gray-100">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
            {project.season}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-wider">
            {project.category}
          </span>
        </div>
        <h4 className="font-bold text-slate-800 text-sm mt-1.5 truncate" title={project.name}>
          {project.name}
        </h4>
        {project.isFixedTarget && (
          <div className="flex items-center text-[11px] font-medium text-red-500 mt-1">
            <span className="mr-1">🎯</span> Target: {project.launchDateFixed}
          </div>
        )}
      </div>

      {/* Right Visual Timeline Lane */}
      <div className="flex-grow relative h-16 bg-slate-50/40 rounded-lg overflow-visible mx-4">
        {/* Horizontal Connector Line connecting the milestones */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2" />

        {/* Milestone Indicator Nodes */}
        {schedules.map(sched => {
          const xPercent = getHorizontalPercentage(sched.forecastDate);
          const baselinePercent = getHorizontalPercentage(sched.baselineDate);
          const isDelayed = sched.varianceDays > 0;

          return (
            <div key={sched.milestoneId} className="absolute top-1/2" style={{ left: `${xPercent}%` }}>
              {/* Baseline Ghost Shadow Node (Visualizes Delay Distance) */}
              {isDelayed && (
                <div 
                  className="absolute w-3.5 h-3.5 rounded-full bg-slate-300/60 border border-dashed border-slate-400 -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${((baselinePercent - xPercent) / xPercent) * 100}%`,
                    top: '-18px'
                  }}
                  title={`Original Approved Baseline: ${sched.baselineDate}`}
                />
              )}

              {/* Main Forecast Milestone Node */}
              <div className="relative -translate-x-1/2 -translate-y-1/2 group z-10">
                <button 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-sm transition-all duration-200 border transform hover:scale-125 focus:outline-none ${getNodeColorClass(sched)}`}
                >
                  {sched.type === 'Launch' ? '◆' : '●'}
                </button>

                {/* Hover Tooltip Card */}
                <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 w-52 bg-slate-900 text-slate-100 rounded-lg p-2.5 text-xs shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="font-bold border-b border-slate-700 pb-1 mb-1.5 text-white flex justify-between">
                    <span>{sched.type}</span>
                    <span className="text-[10px] text-slate-400">Forecast</span>
                  </p>
                  <div className="space-y-1 text-slate-300">
                    <p>📅 Forecast: <span className="font-semibold text-white">{sched.forecastDate}</span></p>
                    <p>📋 Baseline: <span>{sched.baselineDate}</span></p>
                    {sched.varianceDays > 0 && (
                      <p className="text-amber-400 font-medium">Delay: +{sched.varianceDays} Working Days</p>
                    )}
                    {sched.deficitDays > 0 && (
                      <p className="text-red-400 font-bold animate-pulse">Deficit: -{sched.deficitDays} Working Days!</p>
                    )}
                    {sched.floatDays > 0 && (
                      <p className="text-emerald-400 font-medium">Float: {sched.floatDays} Working Days</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

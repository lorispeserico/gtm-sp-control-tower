// FILE: src/views/ControlTowerDashboard.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Project, Season, Category, Milestone } from '@/domain/types';
import { CalendarEngine } from '@/engine/CalendarEngine';
import { DeterministicScheduler } from '@/engine/DeterministicScheduler';
import { fetchDataFromGoogleSheets, AppData } from '@/adapters/GoogleSheetsAdapter';
import { TimelineAxis } from '@/components/TimelineAxis';
import { ProjectSwimlane } from '@/components/ProjectSwimlane';
import { ControlBar } from '@/components/ControlBar';

export const ControlTowerDashboard: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState<Season | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rawData, setRawData] = useState<AppData | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'monthly' | 'weekly'>('monthly');

  const calendarEngine = useMemo(() => new CalendarEngine({ holidays: new Set(), factoryClosures: [] }), []);
  const scheduler = useMemo(() => new DeterministicScheduler(calendarEngine), [calendarEngine]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDataFromGoogleSheets();
        if(!data.projects || data.projects.length === 0) {
          setLoadingError("Data loaded, but no projects were found in the 'projects' tab of your Google Sheet. Please check your data.");
          return;
        }
        setRawData(data);
      } catch (error: any) {
        setLoadingError(error?.message || "An unknown error occurred while fetching data.");
      }
    };
    loadData();
  }, []);

  const calculatedSchedules = useMemo(() => {
    if (!rawData) return [];
    return rawData.projects.map(proj => {
      const projMilestones = (rawData.milestones || []).filter((m: Milestone) => m.project_id === proj.project_id);
      const allDeps = (rawData as any).dependencies || [];
      const projDeps = allDeps.filter((d: any) => projMilestones.some(m => m.node_id === d.predecessorId || m.node_id === d.successorId));
      const computedSchedules = scheduler.calculateSchedules(proj, projMilestones, projDeps);
      return { project: proj, schedules: computedSchedules };
    });
  }, [rawData, scheduler]);

  const filteredRows = useMemo(() => {
    if (!calculatedSchedules) return [];
    return calculatedSchedules.filter(({ project }) => {
      const matchesSeason = selectedSeason === 'ALL' || project.primary_season_id === selectedSeason;
      const matchesSearch = (project.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeason && matchesSearch;
    });
  }, [calculatedSchedules, selectedSeason, searchQuery]);

  // DYNAMIC TIME SCALE LOGIC
  const timeScale = useMemo(() => {
    const firstDate = new Date('2026-09-01');
    const lastDate = new Date('2027-06-30');
    let months = [];
    let current = new Date(firstDate);

    while (current <= lastDate) {
        months.push({
            name: current.toLocaleString('default', { month: 'short' }).toUpperCase(),
            year: current.getFullYear()
        });
        current.setMonth(current.getMonth() + 1);
    }
    
    let containerWidth = zoomLevel === 'monthly' ? 1200 : 2400; // Wider for weekly view

    return {
        months,
        startDay: '2026-09-01',
        endDay: '2027-06-30',
        containerWidth: `${containerWidth}px`
    };
  }, [zoomLevel]);
  
  if (loadingError) return <div className="p-6 text-red-600">{loadingError}</div>;
  if (!rawData) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>🇨🇭</span> GTM Control Tower
            </h1>
          </div>
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 shadow-inner">
            <button 
              onClick={() => setZoomLevel('monthly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${zoomLevel === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setZoomLevel('weekly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${zoomLevel === 'weekly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Weekly
            </button>
          </div>
        </header>
        <ControlBar {...{ selectedSeason, setSelectedSeason, selectedCategory, setSelectedCategory, selectedTeam, setSelectedTeam, searchQuery, setSearchQuery }} />
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="overflow-x-auto">
                <div style={{ minWidth: timeScale.containerWidth }}>
                    <TimelineAxis timeScale={timeScale} />
                    <div className="divide-y divide-gray-100">
                    {filteredRows.map(({ project, schedules }) => (
                        <ProjectSwimlane
                        key={project.project_id}
                        project={project}
                        schedules={schedules}
                        timeScale={timeScale}
                        />
                    ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ControlTowerDashboard;

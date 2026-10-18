// FILE: src/views/ControlTowerDashboard.tsx
import React, { useState, useMemo } from 'react';
import { Season, Category } from '../domain/types';
import { CalendarEngine } from '../engine/CalendarEngine';
import { DeterministicScheduler } from '../engine/DeterministicScheduler';
import { SyntheticDataAdapter } from '../adapters/SyntheticDataAdapter';
import { TimelineAxis } from '../components/TimelineAxis';
import { ProjectSwimlane } from '../components/ProjectSwimlane';
import { ControlBar } from '../components/ControlBar';

export const ControlTowerDashboard: React.FC = () => {
  // 1. Initial State Filters
  const [selectedSeason, setSelectedSeason] = useState<Season | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. Instantiate Deterministic Engines with Mock Config
  const calendarEngine = useMemo(() => {
    return new CalendarEngine(SyntheticDataAdapter.getMockCalendarConfig());
  }, []);

  const scheduler = useMemo(() => {
    return new DeterministicScheduler(calendarEngine);
  }, [calendarEngine]);

  // 3. Load Synthetic Project Datasets
  const rawData = useMemo(() => {
    return SyntheticDataAdapter.getScenarioData();
  }, []);

  // 4. Define Visual Time Horizon (SS27 Window: Oct 2026 to Mar 2027)
  const timeScale = useMemo(() => {
    return {
      months: [
        { name: 'OCT', year: 2026 },
        { name: 'NOV', year: 2026 },
        { name: 'DEC', year: 2026 },
        { name: 'JAN', year: 2027 },
        { name: 'FEB', year: 2027 },
        { name: 'MAR', year: 2027 },
      ],
      startDay: '2026-10-01',
      endDay: '2027-03-31',
    };
  }, []);

  // 5. Execute Schedule Calculations & Filter Views
  const calculatedSchedules = useMemo(() => {
    return rawData.projects.map(proj => {
      const projMilestones = rawData.milestones.filter(m => m.projectId === proj.id);
      const projDeps = rawData.dependencies.filter(d => {
        const matchingMilestone = rawData.milestones.find(m => m.id === d.predecessorMilestoneId);
        return matchingMilestone && matchingMilestone.projectId === proj.id;
      });

      // Run our exact deterministic calculations
      const computedSchedules = scheduler.calculateSchedules(proj, projMilestones, projDeps);
      return {
        project: proj,
        schedules: computedSchedules,
      };
    });
  }, [rawData, scheduler]);

  // 6. Apply Active User Filters to Timeline Row Index
  const filteredRows = useMemo(() => {
    return calculatedSchedules.filter(({ project, schedules }) => {
      const matchesSeason = selectedSeason === 'ALL' || project.season === selectedSeason;
      const matchesCategory = selectedCategory === 'ALL' || project.category === selectedCategory;
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by functional team if selected (only show rows that have tasks mapped to that team)
      const matchesTeam = selectedTeam === 'ALL' || schedules.some(s => {
        if (selectedTeam === 'Design') return s.type === 'Kickoff' || s.type === 'Brief_Lock';
        if (selectedTeam === 'Development') return s.type === 'Proto' || s.type === 'SMS';
        if (selectedTeam === 'Testing') return s.type === 'Wear_Test' || s.type === 'LR2';
        if (selectedTeam === 'Materials') return s.type === 'LR1';
        return true;
      });

      return matchesSeason && matchesCategory && matchesSearch && matchesTeam;
    });
  }, [calculatedSchedules, selectedSeason, selectedCategory, selectedTeam, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      {/* Header Panel */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>🇨🇭</span> GTM Control Tower
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Special Projects & Collaborations Governance & Dynamic Planning Layer
        </p>
      </div>

      {/* Dynamic Filters */}
      <ControlBar
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Roadmap Board */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Horizontal Calendar Monthly Axis */}
        <TimelineAxis timeScale={timeScale} />

        {/* Project Swimlanes */}
        <div className="divide-y divide-gray-100">
          {filteredRows.length > 0 ? (
            filteredRows.map(({ project, schedules }) => (
              <ProjectSwimlane
                key={project.id}
                project={project}
                schedules={schedules}
                timeScale={timeScale}
              />
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 font-medium text-sm">
              No projects found matching the active filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

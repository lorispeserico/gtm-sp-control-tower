// FILE: src/views/ControlTowerDashboard.tsx
import React, { useState, useMemo } from 'react';
import { Season, Category, ScenarioState } from '../domain/types';
import { CalendarEngine } from '../engine/CalendarEngine';
import { DeterministicScheduler } from '../engine/DeterministicScheduler';
import { SyntheticDataAdapter } from '../adapters/SyntheticDataAdapter';
import { TimelineAxis } from '../components/TimelineAxis';
import { ProjectSwimlane } from '../components/ProjectSwimlane';
import { ControlBar } from '../components/ControlBar';
import { ScenarioDrawer } from '../components/ScenarioDrawer';

const initialScenarioState: ScenarioState = {
  id: 'temp-scenario',
  name: 'Default Scenario',
  projectId: '',
  lagOverrides: {},
  dateOverrides: {},
  extraSampleRound: false,
};

const ControlTowerDashboard: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState<Season | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [selectedTeam, setSelectedTeam] = useState<string | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<ScenarioState>(initialScenarioState);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const calendarEngine = useMemo(() => new CalendarEngine(SyntheticDataAdapter.getMockCalendarConfig()), []);
  const scheduler = useMemo(() => new DeterministicScheduler(calendarEngine), [calendarEngine]);
  const rawData = useMemo(() => SyntheticDataAdapter.getScenarioData(), []);

  const calculatedSchedules = useMemo(() => {
    return rawData.projects.map(proj => {
      const projMilestones = rawData.milestones.filter(m => m.projectId === proj.id);
      const projDeps = rawData.dependencies.filter(d => projMilestones.some(m => m.id === d.predecessorMilestoneId));
      return { project: proj, schedules: scheduler.calculateSchedules(proj, projMilestones, projDeps) };
    });
  }, [rawData, scheduler]);

  const scenarioSchedules = useMemo(() => {
    if (!selectedProjectId) return null;
    const projectData = rawData.projects.find(p => p.id === selectedProjectId);
    if (!projectData) return null;

    const projMilestones = rawData.milestones.filter(m => m.projectId === selectedProjectId);
    const projDeps = rawData.dependencies.filter(d => projMilestones.some(m => m.id === d.predecessorMilestoneId));

    return scheduler.calculateScenario(projectData, projMilestones, projDeps, activeScenario);
  }, [activeScenario, selectedProjectId, rawData, scheduler]);

  const filteredRows = useMemo(() => {
    return calculatedSchedules.filter(({ project }) => {
      const matchesSeason = selectedSeason === 'ALL' || project.season === selectedSeason;
      const matchesCategory = selectedCategory === 'ALL' || project.category === selectedCategory;
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeason && matchesCategory && matchesSearch;
    });
  }, [calculatedSchedules, selectedSeason, selectedCategory, searchQuery]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveScenario({ ...initialScenarioState, projectId });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProjectId(null);
  };

  const handleResetScenario = () => {
    if (selectedProjectId) setActiveScenario({ ...initialScenarioState, projectId: selectedProjectId });
  };

  const timeScale = useMemo(() => ({
    months: [
      { name: 'OCT', year: 2026 }, { name: 'NOV', year: 2026 }, { name: 'DEC', year: 2026 },
      { name: 'JAN', year: 2027 }, { name: 'FEB', year: 2027 }, { name: 'MAR', year: 2027 },
      { name: 'APR', year: 2027 }, { name: 'MAY', year: 2027 },
    ],
    startDay: '2026-10-01',
    endDay: '2027-05-31',
  }), []);

  return (
    <>
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🇨🇭</span> GTM Control Tower
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Special Projects & Collaborations Governance & Dynamic Planning Layer
          </p>
        </header>

        <ControlBar {...{ selectedSeason, setSelectedSeason, selectedCategory, setSelectedCategory, selectedTeam, setSelectedTeam, searchQuery, setSearchQuery }} />

        <main className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <TimelineAxis timeScale={timeScale} />
          <div className="divide-y divide-gray-100">
            {filteredRows.map(({ project, schedules }) => (
              <ProjectSwimlane
                key={project.id}
                project={project}
                schedules={schedules}
                scenarioSchedules={project.id === selectedProjectId && scenarioSchedules ? scenarioSchedules : undefined}
                timeScale={timeScale}
                onSelectProject={handleSelectProject}
              />
            ))}
          </div>
        </main>
      </div>

      {isDrawerOpen && selectedProjectId && (
        <ScenarioDrawer 
          scenario={activeScenario}
          setScenario={setActiveScenario}
          onClose={handleCloseDrawer}
          resetScenario={handleResetScenario}
        />
      )}
    </>
  );
};

export default ControlTowerDashboard;

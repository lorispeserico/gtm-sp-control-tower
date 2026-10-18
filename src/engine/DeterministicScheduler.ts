// FILE: src/engine/DeterministicScheduler.ts
import {
  Project,
  Milestone,
  Dependency,
  ComputedMilestoneSchedule,
  MilestoneType,
  ScenarioState, // <-- Import ScenarioState
} from '@/domain/types';
import { CalendarEngine } from './CalendarEngine';

export class DeterministicScheduler {
  private calendar: CalendarEngine;

  constructor(calendarEngine: CalendarEngine) {
    this.calendar = calendarEngine;
  }

  // NEW: A public method dedicated to running scenarios
  public calculateScenario(
    project: Project,
    milestones: Milestone[],
    dependencies: Dependency[],
    scenario: ScenarioState
  ): ComputedMilestoneSchedule[] {
    // Apply scenario overrides to the data before calculating
    const scenarioDependencies = [...dependencies];
    const scenarioMilestones = [...milestones];
    const scenarioOffsets: Record<string, number> = {};

    // Apply lag overrides from the scenario
    Object.entries(scenario.lagOverrides).forEach(([milestoneType, lag]) => {
      const milestone = scenarioMilestones.find(m => m.type === milestoneType);
      if (milestone) {
        const dep = scenarioDependencies.find(d => d.successorMilestoneId === milestone.id);
        if (dep) {
          dep.lag = lag;
        }
      }
    });
    
    // Apply extra sample round if toggled
    if (scenario.extraSampleRound) {
        const protoMilestone = scenarioMilestones.find(m => m.type === 'Proto');
        const lr1Milestone = scenarioMilestones.find(m => m.type === 'LR1');
        if (protoMilestone && lr1Milestone) {
            const dep = scenarioDependencies.find(d => d.predecessorMilestoneId === protoMilestone.id && d.successorMilestoneId === lr1Milestone.id);
            if (dep) {
                dep.lag += 15; // Add 15 working days for the extra round
            }
        }
    }


    // The core calculation logic is now run with the temporary, modified data
    return this.calculateSchedules(project, scenarioMilestones, scenarioDependencies, scenarioOffsets);
  }

  // Main calculation engine (now used by both live forecast and scenarios)
  public calculateSchedules(
    project: Project,
    milestones: Milestone[],
    dependencies: Dependency[],
    operationalOffsets: Record<string, number> = {}
  ): ComputedMilestoneSchedule[] {
    const schedules: Record<string, ComputedMilestoneSchedule> = {};
    const milestoneMap = new Map(milestones.map(m => [m.type, m]));

    // Initialize schedule entries
    milestones.forEach(m => {
      schedules[m.type] = {
        milestoneId: m.id,
        projectId: m.projectId,
        type: m.type,
        baselineDate: m.baselineDate,
        forecastDate: m.baselineDate,
        latestAllowableDate: m.baselineDate,
        varianceDays: 0,
        floatDays: 0,
        deficitDays: 0,
        isCriticalPath: false,
        isWorkBlocker: false,
      };
    });

    // 1. FORWARD PASS
    const resolved = new Set<MilestoneType>();
    const processing = new Set<MilestoneType>();

    const resolveForecast = (type: MilestoneType) => {
      if (resolved.has(type)) return;
      if (processing.has(type)) throw new Error(`Circular dependency detected at: ${type}`);

      processing.add(type);
      const m = milestoneMap.get(type);
      if (!m) return;

      const incoming = dependencies.filter(d => d.successorMilestoneId === m.id);
      let computedForecast: string;

      if (incoming.length === 0) {
        computedForecast = m.baselineDate;
      } else {
        let maxDepDate: string | null = null;
        incoming.forEach(dep => {
          const predMilestone = milestones.find(ms => ms.id === dep.predecessorMilestoneId);
          if (predMilestone) {
            resolveForecast(predMilestone.type);
            const predSchedule = schedules[predMilestone.type];
            let calculatedDate = predSchedule.forecastDate;

            if (dep.lagUnit === 'WorkingDays') {
              calculatedDate = this.calendar.addWorkingDays(predSchedule.forecastDate, dep.lag);
            } else {
              const tempDate = this.calendar.parseDate(predSchedule.forecastDate);
              tempDate.setDate(tempDate.getDate() + dep.lag);
              calculatedDate = this.calendar.formatDate(tempDate);
            }

            if (!maxDepDate || this.calendar.parseDate(calculatedDate) > this.calendar.parseDate(maxDepDate)) {
              maxDepDate = calculatedDate;
            }
          }
        });
        computedForecast = maxDepDate || m.baselineDate;
      }

      if (operationalOffsets[type]) {
        computedForecast = this.calendar.addWorkingDays(computedForecast, operationalOffsets[type]);
      }

      schedules[type].forecastDate = computedForecast;
      schedules[type].varianceDays = this.calendar.workingDaysBetween(m.baselineDate, computedForecast);
      
      processing.delete(type);
      resolved.add(type);
    };

    milestones.forEach(m => resolveForecast(m.type));

    // 2. BACKWARD PASS
    const launchMilestone = milestones.find(m => m.type === 'Launch');
    if (launchMilestone) {
      const fixedLaunchDate = project.launchDateFixed;
      schedules['Launch'].latestAllowableDate = fixedLaunchDate;

      const resolvedBackward = new Set<MilestoneType>();
      const processingBackward = new Set<MilestoneType>();

      const resolveBackward = (type: MilestoneType) => {
        if (resolvedBackward.has(type)) return;
        if (processingBackward.has(type)) return;

        processingBackward.add(type);
        const m = milestoneMap.get(type);
        if (!m) return;

        if (type === 'Launch') {
          resolvedBackward.add('Launch');
          processingBackward.delete('Launch');
          return;
        }

        let minAllowableDate = fixedLaunchDate;
        const outgoing = dependencies.filter(d => {
          const pred = milestones.find(ms => ms.id === d.predecessorMilestoneId);
          return pred && pred.type === type;
        });

        outgoing.forEach(dep => {
          const succMilestone = milestones.find(ms => ms.id === dep.successorMilestoneId);
          if (succMilestone) {
            resolveBackward(succMilestone.type);
            const succSchedule = schedules[succMilestone.type];
            let calculatedAllowable = succSchedule.latestAllowableDate;

            if (dep.lagUnit === 'WorkingDays') {
              calculatedAllowable = this.calendar.subtractWorkingDays(succSchedule.latestAllowableDate, dep.lag);
            } else {
              const tempDate = this.calendar.parseDate(succSchedule.latestAllowableDate);
              tempDate.setDate(tempDate.getDate() - dep.lag);
              calculatedAllowable = this.calendar.formatDate(tempDate);
            }

            if (this.calendar.parseDate(calculatedAllowable) < this.calendar.parseDate(minAllowableDate)) {
              minAllowableDate = calculatedAllowable;
            }
          }
        });

        schedules[type].latestAllowableDate = minAllowableDate;
        resolvedBackward.add(type);
        processingBackward.delete(type);
      };

      milestones.forEach(m => resolveBackward(m.type));
    }

    // 3. COMPUTE FLOAT & DEFICIT
    milestones.forEach(m => {
      const sched = schedules[m.type];
      const workingDiff = this.calendar.workingDaysBetween(sched.forecastDate, sched.latestAllowableDate);

      if (workingDiff >= 0) {
        sched.floatDays = workingDiff;
        sched.deficitDays = 0;
      } else {
        sched.floatDays = 0;
        sched.deficitDays = Math.abs(workingDiff);
      }

      sched.isCriticalPath = sched.floatDays === 0;
      sched.isWorkBlocker = (sched.varianceDays > 0 && sched.isCriticalPath) || sched.deficitDays > 0;
    });

    return Object.values(schedules);
  }
}

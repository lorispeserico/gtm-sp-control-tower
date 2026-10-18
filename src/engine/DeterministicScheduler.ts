// FILE: src/engine/DeterministicScheduler.ts
import { 
  Project, Milestone, Dependency, ComputedMilestoneSchedule, MilestoneType 
} from '../domain/types';
import { CalendarEngine } from './CalendarEngine';

export class DeterministicScheduler {
  private calendar: CalendarEngine;

  constructor(calendarEngine: CalendarEngine) {
    this.calendar = calendarEngine;
  }

  public calculateSchedules(
    project: Project,
    milestones: Milestone[],
    dependencies: Dependency[],
    operationalOffsets: Record<string, number> = {} // e.g. {"LR1": 5}
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
        isWorkBlocker: false
      };
    });

    // 1. FORWARD PASS: Calculate Early Forecast Dates
    const resolved = new Set<MilestoneType>();
    const processing = new Set<MilestoneType>();

    const resolveForecast = (type: MilestoneType) => {
      if (resolved.has(type)) return;
      if (processing.has(type)) throw new Error(`Circular dependency detected at: ${type}`);

      processing.add(type);

      const m = milestoneMap.get(type);
      if (!m) return;

      // Find predecessors
      const incoming = dependencies.filter(d => d.successorMilestoneId === m.id);
      
      let computedForecast: string;

      if (incoming.length === 0) {
        // Root milestone starts at baseline
        computedForecast = m.baselineDate;
      } else {
        // Dependent milestone is determined by its predecessors
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

      // Apply external operational signal delay if present for this milestone
      if (operationalOffsets[type]) {
        computedForecast = this.calendar.addWorkingDays(computedForecast, operationalOffsets[type]);
      }

      schedules[type].forecastDate = computedForecast;
      schedules[type].varianceDays = this.calendar.workingDaysBetween(m.baselineDate, computedForecast);
      
      processing.delete(type);
      resolved.add(type);
    };

    milestones.forEach(m => resolveForecast(m.type));

    // 2. BACKWARD PASS: Anchor on Fixed Target / Launch
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

// FILE: src/engine/DeterministicScheduler.ts
import { Project, Milestone, ComputedMilestoneSchedule, MilestoneType } from '@/domain/types';
import { CalendarEngine } from '@/engine/CalendarEngine';

// We will use a proper dependency structure now
interface SimpleDependency {
  predecessorId: string;
  successorId: string;
  lag: number;
}

export class DeterministicScheduler {
  private calendar: CalendarEngine;

  constructor(calendarEngine: CalendarEngine) {
    this.calendar = calendarEngine;
  }

        public calculateSchedules(
        project: Project,
        milestones: Milestone[],
        dependencies: SimpleDependency[] = []
      ): ComputedMilestoneSchedule[] {
    
    const schedules: Record<string, ComputedMilestoneSchedule> = {};
    const milestoneMap = new Map(milestones.map((m: Milestone) => [m.node_id, m]));

    milestones.forEach((m: Milestone) => {
      schedules[m.node_id] = {
        node_id: m.node_id, project_id: m.project_id, standard_task_code: m.standard_task_code,
        target_baseline_date: m.target_baseline_date, forecast_working_date: m.target_baseline_date,
        is_critical_path: false, total_float_days: 0, deficit_days: 0,
      };
    });

    const resolved = new Set<string>();
    const processing = new Set<string>();

    const resolveForecast = (nodeId: string) => {
      if (resolved.has(nodeId)) return;
      if (processing.has(nodeId)) throw new Error(`Circular dependency detected involving node: ${nodeId}`);
      processing.add(nodeId);

      const m = milestoneMap.get(nodeId);
      if (!m) {
        processing.delete(nodeId); // Remove from processing if milestone not found
        return;
      };

      const incoming = dependencies.filter((d: SimpleDependency) => d.successorId === m.node_id);
      let computedForecast: string;

      if (incoming.length === 0) {
        computedForecast = m.target_baseline_date;
      } else {
        let maxDepDate: string | null = null;
        incoming.forEach((dep: SimpleDependency) => {
          const predMilestone = milestones.find((ms: Milestone) => ms.node_id === dep.predecessorId);
          if (predMilestone) {
            resolveForecast(predMilestone.node_id);
            const predSchedule = schedules[predMilestone.node_id];
            if(predSchedule) { // Ensure predecessor was resolved
              let calculatedDate = this.calendar.addWorkingDays(predSchedule.forecast_working_date, dep.lag);
              if (!maxDepDate || this.calendar.parseDate(calculatedDate) > this.calendar.parseDate(maxDepDate)) {
                maxDepDate = calculatedDate;
              }
            }
          }
        });
        computedForecast = maxDepDate || m.target_baseline_date;
      }

      schedules[nodeId].forecast_working_date = computedForecast;
      
      processing.delete(nodeId);
      resolved.add(nodeId);
    };

    milestones.forEach((m: Milestone) => resolveForecast(m.node_id));

    // Note: Backward pass logic for deficit calculation will be added in a later step
    // For now, we focus on fixing the forward pass crash.

    return Object.values(schedules);
  }
}

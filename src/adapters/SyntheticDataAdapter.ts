// FILE: src/adapters/SyntheticDataAdapter.ts
import { Project, Milestone, Style, ProjectStyleBinding } from '../domain/types';

export class SyntheticDataAdapter {
  public static getMockCalendarConfig() {
    return {
      holidays: new Set(['2026-12-25', '2027-01-01']),
      factoryClosures: [
        {
          startDate: '2027-02-08',
          endDate: '2027-02-19',
          supplierId: 'VN_FACTORY_A'
        }
      ]
    };
  }

  public static getScenarioData(): {
    projects: Project[];
    styles: Style[];
    bindings: ProjectStyleBinding[];
    milestones: Milestone[];
  } {
    const projects: Project[] = [
      {
        project_id: 'PRJ_GIGI',
        name: 'Gigi Collab',
        primary_season_id: 'SS27',
        department_id: 'Collaborations',
        smartsheet_source_url: 'https://app.smartsheet.com/sheets/vxGWwmFW2QRRfHhvqpFXjCcfPGxWfXcQmcGcj621'
      },
      {
        project_id: 'PRJ_LOEWE',
        name: 'On x Loewe Run',
        primary_season_id: 'SS27',
        department_id: 'Collaborations',
        smartsheet_source_url: 'https://app.smartsheet.com/sheets/XcPQ9X4pj38GW4Cc78hWCc3pX84WX59w3fvvPHq1'
      },
      {
        project_id: 'PRJ_KITH',
        name: 'Kith Capsule',
        primary_season_id: 'SS27',
        department_id: 'Collaborations',
      }
    ];

    const styles: Style[] = [
      { style_number: '11001-A', style_name: 'Gigi Mesh Tee' },
      { style_number: '21004-F', style_name: 'Loewe Cloudtilt' },
      { style_number: '11005-K', style_name: 'Kith Track Jacket' }
    ];

    const bindings: ProjectStyleBinding[] = [
      { binding_id: 'b1', project_id: 'PRJ_GIGI', style_number: '11001-A' },
      { binding_id: 'b2', project_id: 'PRJ_LOEWE', style_number: '21004-F' },
      { binding_id: 'b3', project_id: 'PRJ_KITH', style_number: '11005-K' }
    ];

    const milestones: Milestone[] = [
      // Gigi Milestones
      { node_id: 'm1_ko', project_id: 'PRJ_GIGI', standard_task_code: 'KICKOFF', custom_task_label: 'Collab Kickoff', duration_days: 1, calendar_type: 'WORKING_DAYS', target_baseline_date: '2026-10-01' },
      { node_id: 'm1_pr', project_id: 'PRJ_GIGI', standard_task_code: 'PROTO', custom_task_label: 'Proto Sample Lock', duration_days: 30, calendar_type: 'WORKING_DAYS', target_baseline_date: '2026-11-15' },
      { node_id: 'm1_lr1', project_id: 'PRJ_GIGI', standard_task_code: 'LR1', custom_task_label: 'Line Review 1', duration_days: 20, calendar_type: 'WORKING_DAYS', target_baseline_date: '2026-12-20' },
      { node_id: 'm1_ln', project_id: 'PRJ_GIGI', standard_task_code: 'LAUNCH', custom_task_label: 'Global Launch Window', duration_days: 1, calendar_type: 'WORKING_DAYS', target_baseline_date: '2027-04-15' },

      // Loewe Milestones
      { node_id: 'm2_ko', project_id: 'PRJ_LOEWE', standard_task_code: 'KICKOFF', custom_task_label: 'Design Handoff', duration_days: 1, calendar_type: 'WORKING_DAYS', target_baseline_date: '2026-10-01' },
      { node_id: 'm2_pr', project_id: 'PRJ_LOEWE', standard_task_code: 'PROTO', custom_task_label: 'Outsole Fitting', duration_days: 35, calendar_type: 'WORKING_DAYS', target_baseline_date: '2026-11-20' },
      { node_id: 'm2_lr2', project_id: 'PRJ_LOEWE', standard_task_code: 'LR2', custom_task_label: 'Production Validation', duration_days: 30, calendar_type: 'WORKING_DAYS', target_baseline_date: '2027-01-10' },
      { node_id: 'm2_ln', project_id: 'PRJ_LOEWE', standard_task_code: 'LAUNCH', custom_task_label: 'Commercial Release', duration_days: 1, calendar_type: 'WORKING_DAYS', target_baseline_date: '2027-03-01' },

      // Kith Milestones
      { node_id: 'm3_ko', project_id: 'PRJ_KITH', standard_task_code: 'KICKOFF', custom_task_label: 'Initial Alignment', duration_days: 1, calendar_type: 'WORKING_DAYS', target_baseline_date: '2026-10-01' },
      { node_id: 'm3_pr', project_id: 'PRJ_KITH', standard_task_code: 'PROTO', custom_task_label: 'First Prototype', duration_days: 40, calendar_type: 'WORKING_DAYS', target_baseline_date: '2026-12-01' },
      { node_id: 'm3_ln', project_id: 'PRJ_KITH', standard_task_code: 'LAUNCH', custom_task_label: 'Kith Delivery Drop', duration_days: 1, calendar_type: 'WORKING_DAYS', target_baseline_date: '2027-05-15' },
    ];

    return { projects, styles, bindings, milestones };
  }
}

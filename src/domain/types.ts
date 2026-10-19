// FILE: src/domain/types.ts
// This file is now updated to precisely match the GTM_App_Database schema.

export type Season = 'SS26' | 'FW26' | 'SS27' | 'FW27' | 'SS28' | 'FW28';
export type Category = 'Apparel' | 'Footwear' | 'Accessories';
export type Department = 'Performance' | 'Lifestyle' | 'Collaborations';
export type CalendarType = 'WORKING_DAYS' | 'CALENDAR_DAYS';

// Corresponds to the 'projects' tab
export interface Project {
  project_id: string;
  name: string;
  primary_season_id: Season;
  department_id: Department;
  smartsheet_source_url?: string;
}

// Corresponds to the 'styles' tab
export interface Style {
  style_number: string;
  style_name: string;
  development_name?: string;
}

// Corresponds to the 'project_style_bindings' tab
export interface ProjectStyleBinding {
  binding_id: string;
  project_id: string;
  style_number: string;
}

// Corresponds to the 'milestones' tab
export interface Milestone {
  node_id: string;
  project_id: string;
  standard_task_code: string; // e.g., "LR1", "PROTO"
  custom_task_label: string; // The verbatim name from Smartsheet
  duration_days: number;
  calendar_type: CalendarType;
  target_baseline_date: string; // YYYY-MM-DD
}

// This is not a database table, but the output of our scheduler
export interface ComputedMilestoneSchedule {
  node_id: string;
  project_id: string;
  standard_task_code: string;
  target_baseline_date: string;
  forecast_working_date: string;
  is_critical_path: boolean;
  total_float_days: number;
  deficit_days: number;
}

// The interfaces for ScenarioState, ChangeRequest, and AuditLogEntry remain conceptually similar
// but will now reference the new primary keys (project_id, node_id, etc.)
export interface ScenarioState {
    id: string;
    name: string;
    projectId: string;
    lagOverrides: Record<string, number>;
    dateOverrides: Record<string, string>;
    extraSampleRound: boolean;
}

export interface ChangeRequest {
    cr_id: string;
    project_id: string;
    status: 'Draft' | 'Approved' | 'Pending_Execution' | 'Reconciled';
    // ... other fields from your change_requests table
}

export interface AuditLogEntry {
    audit_event_id: string;
    timestamp_utc: string;
    user_email: string;
    project_id: string;
    action_type: string;
    details_json: string;
}

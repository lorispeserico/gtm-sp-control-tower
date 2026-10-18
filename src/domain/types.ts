// FILE: src/domain/types.ts

export type Season = 'SS26' | 'FW26' | 'SS27' | 'FW27' | 'SS28' | 'FW28';
export type Category = 'Apparel' | 'Footwear' | 'Accessories';

export type MilestoneType = 
  | 'Kickoff' 
  | 'Brief_Lock' 
  | 'Proto' 
  | 'Wear_Test' 
  | 'LR1' 
  | 'SMS' 
  | 'LR2' 
  | 'Buy_Ready' 
  | 'Commercial_Handover' 
  | 'Launch';

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';
export type RelationshipState = 'CONFIRMED' | 'CANDIDATE' | 'AMBIGUOUS' | 'UNMATCHED';

export interface Project {
  id: string;
  name: string;
  season: Season;
  category: Category;
  collabPartner?: string;
  isFixedTarget: boolean;
  launchDateFixed: string; // ISO 8601 Date String (YYYY-MM-DD)
  status: 'On_Time' | 'At_Risk' | 'Delayed';
}

export interface Style {
  id: string;
  projectId: string;
  styleCode: string;
  styleName: string;
  materials: string[];
}

export interface Material {
  id: string;
  materialCode: string;
  name: string;
  supplier: string;
  status: string;
  expectedAvailability: string; // YYYY-MM-DD
}

export interface Dependency {
  id: string;
  predecessorMilestoneId: string;
  successorMilestoneId: string;
  type: DependencyType;
  lag: number; // Positive gap or negative lag
  lagUnit: 'WorkingDays' | 'CalendarDays';
}

export interface Milestone {
  id: string;
  projectId: string;
  type: MilestoneType;
  sourceTaskName: string; // Verbatim name from source
  baselineDate: string; // YYYY-MM-DD
  status: 'Not_Started' | 'In_Progress' | 'Complete';
}

export interface OperationalSignal {
  id: string;
  sourceSystem: 'Material_Tracker' | 'Testing_Tracker' | 'Buy_Ready_Tracker' | 'STS_Tracker';
  entityRef: string; // Material ID or Style ID
  signalType: 'Material_Delay' | 'Testing_Failure' | 'STS_Delayed' | 'Buy_Ready_Slipped';
  expectedDate: string; // YYYY-MM-DD
  statusValue: string;
}

export interface ComputedMilestoneSchedule {
  milestoneId: string;
  projectId: string;
  type: MilestoneType;
  baselineDate: string;
  forecastDate: string;
  latestAllowableDate: string; // Derived from backward pass
  varianceDays: number; // Forecast - Baseline
  floatDays: number; // Buffer days before delay touches fixed target
  deficitDays: number; // Number of days forecast exceeds fixed target limit
  isCriticalPath: boolean;
  isWorkBlocker: boolean;
}

export interface ProjectAlias {
  canonicalId: string;
  displayName: string;
  aliases: string[];
  season: Season;
  category: Category;
}

export interface RelationshipMatch {
  id: string;
  sourceRef: string;
  canonicalId: string;
  state: RelationshipState;
  confidenceScore: number; // 0 to 100
}

export interface CalendarDefinition {
  holidays: Set<string>; // Set of "YYYY-MM-DD"
  factoryClosures: Array<{
    supplierId: string;
    startDate: string;
    endDate: string;
  }>;
}

export interface Scenario {
  id: string;
  name: string;
  projectId: string;
  signalOverrides: Record<string, string>; // Maps signal ID -> hypothetical date YYYY-MM-DD
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  proposedChanges: Array<{
    milestoneType: MilestoneType;
    newTargetDate: string;
  }>;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Pending_Execution' | 'Reconciled';
}

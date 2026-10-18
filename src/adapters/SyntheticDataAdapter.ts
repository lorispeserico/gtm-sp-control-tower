// FILE: src/adapters/SyntheticDataAdapter.ts
import { Project, Milestone, Dependency, OperationalSignal, Style, Material } from '../domain/types';

export class SyntheticDataAdapter {
  public static getMockCalendarConfig() {
    return {
      holidays: new Set(['2026-12-25', '2027-01-01']),
      factoryClosures: [
        {
          startDate: '2027-02-08', // Lunar New Year factory shutdown window
          endDate: '2027-02-19',
          supplierId: 'VN_FACTORY_A'
        }
      ]
    };
  }

  public static getScenarioData(): {
    projects: Project[];
    milestones: Milestone[];
    dependencies: Dependency[];
    styles: Style[];
    materials: Material[];
    signals: OperationalSignal[];
  } {
    // -------------------------------------------------------------
    // PROJECT 1: GIGI - Normal Path (On-Time baseline)
    // -------------------------------------------------------------
    const p1: Project = {
      id: 'PRJ_GIGI',
      name: 'Gigi Collab',
      season: 'SS27',
      category: 'Apparel',
      isFixedTarget: true,
      launchDateFixed: '2027-04-15',
      status: 'On_Time'
    };

    const m1: Milestone[] = [
      { id: 'm1_ko', projectId: 'PRJ_GIGI', type: 'Kickoff', sourceTaskName: 'Collab Kickoff', baselineDate: '2026-10-01', status: 'Complete' },
      { id: 'm1_pr', projectId: 'PRJ_GIGI', type: 'Proto', sourceTaskName: 'Proto Sample Lock', baselineDate: '2026-11-15', status: 'In_Progress' },
      { id: 'm1_lr1', projectId: 'PRJ_GIGI', type: 'LR1', sourceTaskName: 'Line Review 1 Signoff', baselineDate: '2026-12-20', status: 'Not_Started' },
      { id: 'm1_ln', projectId: 'PRJ_GIGI', type: 'Launch', sourceTaskName: 'Fixed Launch Window', baselineDate: '2027-04-15', status: 'Not_Started' }
    ];

    const d1: Dependency[] = [
      { id: 'd1_1', predecessorMilestoneId: 'm1_ko', successorMilestoneId: 'm1_pr', type: 'FS', lag: 30, lagUnit: 'WorkingDays' },
      { id: 'd1_2', predecessorMilestoneId: 'm1_pr', successorMilestoneId: 'm1_lr1', type: 'FS', lag: 20, lagUnit: 'WorkingDays' },
      { id: 'd1_3', predecessorMilestoneId: 'm1_lr1', successorMilestoneId: 'm1_ln', type: 'FS', lag: 60, lagUnit: 'WorkingDays' }
    ];

    // -------------------------------------------------------------
    // PROJECT 2: KITH - Upstream Delay but with sufficient buffer float
    // -------------------------------------------------------------
    const p2: Project = {
      id: 'PRJ_KITH',
      name: 'Kith Capsule',
      season: 'SS27',
      category: 'Apparel',
      isFixedTarget: true,
      launchDateFixed: '2027-05-30',
      status: 'On_Time'
    };

    const m2: Milestone[] = [
      { id: 'm2_ko', projectId: 'PRJ_KITH', type: 'Kickoff', sourceTaskName: 'Kith Initial Meeting', baselineDate: '2026-10-01', status: 'Complete' },
      { id: 'm2_pr', projectId: 'PRJ_KITH', type: 'Proto', sourceTaskName: 'First Prototype Target', baselineDate: '2026-12-01', status: 'In_Progress' },
      { id: 'm2_ln', projectId: 'PRJ_KITH', type: 'Launch', sourceTaskName: 'Kith Delivery', baselineDate: '2027-05-30', status: 'Not_Started' }
    ];

    const d2: Dependency[] = [
      { id: 'd2_1', predecessorMilestoneId: 'm2_ko', successorMilestoneId: 'm2_pr', type: 'FS', lag: 45, lagUnit: 'WorkingDays' },
      { id: 'd2_2', predecessorMilestoneId: 'm2_pr', successorMilestoneId: 'm2_ln', type: 'FS', lag: 40, lagUnit: 'WorkingDays' }
    ];

    // -------------------------------------------------------------
    // PROJECT 3: LOEWE - Severe delay pushing past fixed target (Deficit)
    // -------------------------------------------------------------
    const p3: Project = {
      id: 'PRJ_LOEWE',
      name: 'On x Loewe Run',
      season: 'SS27',
      category: 'Footwear',
      isFixedTarget: true,
      launchDateFixed: '2027-03-01',
      status: 'Delayed'
    };

    const m3: Milestone[] = [
      { id: 'm3_ko', projectId: 'PRJ_LOEWE', type: 'Kickoff', sourceTaskName: 'Design Handoff', baselineDate: '2026-10-01', status: 'Complete' },
      { id: 'm3_pr', projectId: 'PRJ_LOEWE', type: 'Proto', sourceTaskName: 'First Outsole Fitting', baselineDate: '2026-11-20', status: 'In_Progress' },
      { id: 'm3_lr2', projectId: 'PRJ_LOEWE', type: 'LR2', sourceTaskName: 'Production Validation Gate', baselineDate: '2027-01-10', status: 'Not_Started' },
      { id: 'm3_ln', projectId: 'PRJ_LOEWE', type: 'Launch', sourceTaskName: 'Global Commercial Release', baselineDate: '2027-03-01', status: 'Not_Started' }
    ];

    const d3: Dependency[] = [
      { id: 'd3_1', predecessorMilestoneId: 'm3_ko', successorMilestoneId: 'm3_pr', type: 'FS', lag: 35, lagUnit: 'WorkingDays' },
      { id: 'd3_2', predecessorMilestoneId: 'm3_pr', successorMilestoneId: 'm3_lr2', type: 'FS', lag: 30, lagUnit: 'WorkingDays' },
      { id: 'd3_3', predecessorMilestoneId: 'm3_lr2', successorMilestoneId: 'm3_ln', type: 'FS', lag: 35, lagUnit: 'WorkingDays' }
    ];

    // -------------------------------------------------------------
    // PROJECT 4: OAC - Athlete Pack (Affected by shared material knit)
    // -------------------------------------------------------------
    const p4: Project = {
      id: 'PRJ_OAC',
      name: 'OAC Athlete Pack',
      season: 'SS27',
      category: 'Apparel',
      isFixedTarget: true,
      launchDateFixed: '2027-04-20',
      status: 'At_Risk'
    };

    const m4: Milestone[] = [
      { id: 'm4_ko', projectId: 'PRJ_OAC', type: 'Kickoff', sourceTaskName: 'Briefing', baselineDate: '2026-10-01', status: 'Complete' },
      { id: 'm4_pr', projectId: 'PRJ_OAC', type: 'Proto', sourceTaskName: 'Fabric In House Gate', baselineDate: '2026-12-05', status: 'Not_Started' },
      { id: 'm4_ln', projectId: 'PRJ_OAC', type: 'Launch', sourceTaskName: 'Summer Games Delivery', baselineDate: '2027-04-20', status: 'Not_Started' }
    ];

    const d4: Dependency[] = [
      { id: 'd4_1', predecessorMilestoneId: 'm4_ko', successorMilestoneId: 'm4_pr', type: 'FS', lag: 45, lagUnit: 'WorkingDays' },
      { id: 'd4_2', predecessorMilestoneId: 'm4_pr', successorMilestoneId: 'm4_ln', type: 'FS', lag: 50, lagUnit: 'WorkingDays' }
    ];

    // -------------------------------------------------------------
    // SHARED ASSETS & SIGNALS
    // -------------------------------------------------------------
    const materials: Material[] = [
      {
        id: 'MAT_KNIT_990',
        materialCode: 'M-990',
        name: 'Technical Grid Knit (Recycled)',
        supplier: 'Mill A',
        status: 'In_Development',
        expectedAvailability: '2026-12-15'
      }
    ];

    const styles: Style[] = [
      { id: 'sty_gigi_01', projectId: 'PRJ_GIGI', styleCode: '11001-A', styleName: 'Gigi Mesh Tee', materials: ['MAT_KNIT_990'] },
      { id: 'sty_oac_22', projectId: 'PRJ_OAC', styleCode: '11009-S', styleName: 'OAC Aero Singlet', materials: ['MAT_KNIT_990'] }
    ];

    const signals: OperationalSignal[] = [
      {
        id: 'sig_mat_delay',
        sourceSystem: 'Material_Tracker',
        entityRef: 'MAT_KNIT_990',
        signalType: 'Material_Delay',
        expectedDate: '2026-12-28',
        statusValue: 'Delayed'
      },
      {
        id: 'sig_wear_test_fail',
        sourceSystem: 'Testing_Tracker',
        entityRef: 'sty_gigi_01',
        signalType: 'Testing_Failure',
        expectedDate: '2027-01-15',
        statusValue: 'Failed'
      }
    ];

    return {
      projects: [p1, p2, p3, p4],
      milestones: [...m1, ...m2, ...m3, ...m4],
      dependencies: [...d1, ...d2, ...d3, ...d4],
      styles,
      materials,
      signals
    };
  }
}

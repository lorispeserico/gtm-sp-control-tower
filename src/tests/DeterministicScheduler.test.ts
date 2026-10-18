// FILE: src/tests/DeterministicScheduler.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { CalendarEngine } from '../engine/CalendarEngine';
import { DeterministicScheduler } from '../engine/DeterministicScheduler';
import { Project, Milestone, Dependency } from '../domain/types';

describe('GTM Control Tower Deterministic Engine Tests', () => {
  let calendarEngine: CalendarEngine;
  let scheduler: DeterministicScheduler;

  beforeEach(() => {
    // 2026 holiday array containing Christmas and New Year's Day
    calendarEngine = new CalendarEngine({
      holidays: new Set(['2026-12-25', '2027-01-01']),
      factoryClosures: [
        {
          startDate: '2027-02-08', // Lunar New Year
          endDate: '2027-02-19',
          supplierId: 'VN_FACTORY_A'
        }
      ]
    });
    scheduler = new DeterministicScheduler(calendarEngine);
  });

  test('Correctly identifies non-working days and skips weekends', () => {
    const thursday = '2026-10-15';
    // Adding 2 working days to Thursday should push past Saturday/Sunday to Monday (Oct 19)
    const result = calendarEngine.addWorkingDays(thursday, 2);
    expect(result).toBe('2026-10-19');
  });

  test('Correctly accounts for holiday lists', () => {
    const xmasEve = '2026-12-24';
    // Dec 25 is a holiday, Dec 26-27 is a weekend. 1 working day after Dec 24 should land on Monday Dec 28.
    const result = calendarEngine.addWorkingDays(xmasEve, 1);
    expect(result).toBe('2026-12-28');
  });

  test('Resolves basic Finish-to-Start link', () => {
    const p: Project = { id: 'P1', name: 'Test P', season: 'SS27', category: 'Apparel', isFixedTarget: false, launchDateFixed: '2027-05-01', status: 'On_Time' };
    const milestones: Milestone[] = [
      { id: 'm_ko', projectId: 'P1', type: 'Kickoff', sourceTaskName: 'Kickoff', baselineDate: '2026-10-01', status: 'Complete' },
      { id: 'm_pr', projectId: 'P1', type: 'Proto', sourceTaskName: 'Proto', baselineDate: '2026-10-15', status: 'Not_Started' }
    ];
    const deps: Dependency[] = [
      { id: 'd1', predecessorMilestoneId: 'm_ko', successorMilestoneId: 'm_pr', type: 'FS', lag: 5, lagUnit: 'WorkingDays' }
    ];

    const results = scheduler.calculateSchedules(p, milestones, deps);
    const protoSched = results.find(r => r.type === 'Proto');
    expect(protoSched?.forecastDate).toBe('2026-10-08'); // Thursday Oct 1 + 5 working days
  });

  test('Resolves overlapping stages with negative lag (negative backward offset)', () => {
    const p: Project = { id: 'P2', name: 'Test Neg Lag', season: 'SS27', category: 'Apparel', isFixedTarget: false, launchDateFixed: '2027-05-01', status: 'On_Time' };
    const milestones: Milestone[] = [
      { id: 'm_ko', projectId: 'P2', type: 'Kickoff', sourceTaskName: 'Kickoff', baselineDate: '2026-10-01', status: 'Complete' },
      { id: 'm_pr', projectId: 'P2', type: 'Proto', sourceTaskName: 'Proto', baselineDate: '2026-10-15', status: 'Not_Started' }
    ];
    // Start Proto -3 working days before Kickoff is officially marked complete (e.g., parallel tasks)
    const deps: Dependency[] = [
      { id: 'd2', predecessorMilestoneId: 'm_ko', successorMilestoneId: 'm_pr', type: 'FS', lag: -3, lagUnit: 'WorkingDays' }
    ];

    const results = scheduler.calculateSchedules(p, milestones, deps);
    const protoSched = results.find(r => r.type === 'Proto');
    expect(protoSched?.forecastDate).toBe('2026-09-28'); // Oct 1 minus 3 working days back
  });

  test('Calculates positive deficit when forecast date overruns fixed target boundary', () => {
    const p: Project = { 
      id: 'P3', 
      name: 'Fixed Target Block', 
      season: 'SS27', 
      category: 'Apparel', 
      isFixedTarget: true, 
      launchDateFixed: '2026-10-10', // Fixed Target Launch date is locked to Oct 10
      status: 'Delayed' 
    };
    const milestones: Milestone[] = [
      { id: 'm_ko', projectId: 'P3', type: 'Kickoff', sourceTaskName: 'Kickoff', baselineDate: '2026-10-01', status: 'Complete' },
      { id: 'm_ln', projectId: 'P3', type: 'Launch', sourceTaskName: 'Launch', baselineDate: '2026-10-08', status: 'Not_Started' }
    ];
    const deps: Dependency[] = [
      { id: 'd3', predecessorMilestoneId: 'm_ko', successorMilestoneId: 'm_ln', type: 'FS', lag: 12, lagUnit: 'WorkingDays' }
    ];

    const results = scheduler.calculateSchedules(p, milestones, deps);
    const launchSched = results.find(r => r.type === 'Launch');
    
    // Forecast is Oct 1 + 12 working days = Oct 19.
    // The fixed launch date target is locked to Oct 10.
    // Overrun should trigger a schedule deficit of 7 working days.
    expect(launchSched?.forecastDate).toBe('2026-10-19');
    expect(launchSched?.latestAllowableDate).toBe('2026-10-10');
    expect(launchSched?.deficitDays).toBe(6);
    expect(launchSched?.floatDays).toBe(0);
  });
});

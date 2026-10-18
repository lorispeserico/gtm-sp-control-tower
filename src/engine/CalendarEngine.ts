// FILE: src/engine/CalendarEngine.ts
import { CalendarDefinition } from '@/domain/types';

export class CalendarEngine {
  private holidays: Set<string>;
  private factoryClosures: Array<{ startDate: Date; endDate: Date; supplierId?: string }>;

  constructor(config: CalendarDefinition) {
    this.holidays = new Set(config.holidays);
    this.factoryClosures = config.factoryClosures.map(c => ({
      startDate: this.parseDate(c.startDate),
      endDate: this.parseDate(c.endDate),
      supplierId: c.supplierId
    }));
  }

  public parseDate(dateStr: string): Date {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      throw new Error(`Invalid date string format: ${dateStr}`);
    }
    // Return a normalized Date at midnight in the local timezone to avoid timezone shift errors
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  public formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  public isWorkingDay(date: Date, supplierId?: string): boolean {
    const day = date.getDay();
    if (day === 0 || day === 6) return false; // Exclude Saturdays and Sundays

    const dateStr = this.formatDate(date);
    if (this.holidays.has(dateStr)) return false; // Exclude Holidays

    // Exclude Factory Closure windows
    for (const closure of this.factoryClosures) {
      if (supplierId && closure.supplierId && closure.supplierId !== supplierId) {
        continue; 
      }
      if (date >= closure.startDate && date <= closure.endDate) {
        return false;
      }
    }
    return true;
  }

  public addWorkingDays(dateStr: string, days: number, supplierId?: string): string {
    let date = this.parseDate(dateStr);
    if (days === 0) return dateStr;

    const step = days > 0 ? 1 : -1;
    let absoluteDays = Math.abs(days);

    while (absoluteDays > 0) {
      date.setDate(date.getDate() + step);
      if (this.isWorkingDay(date, supplierId)) {
        absoluteDays--;
      }
    }
    return this.formatDate(date);
  }

  public subtractWorkingDays(dateStr: string, days: number, supplierId?: string): string {
    return this.addWorkingDays(dateStr, -days, supplierId);
  }

  public workingDaysBetween(startDateStr: string, endDateStr: string, supplierId?: string): number {
    const start = this.parseDate(startDateStr);
    const end = this.parseDate(endDateStr);
    if (start.getTime() === end.getTime()) return 0;

    let count = 0;
    const isForward = start < end;
    const step = isForward ? 1 : -1;
    let current = new Date(start);

    while (this.formatDate(current) !== this.formatDate(end)) {
      if (this.isWorkingDay(current, supplierId)) {
        count += step;
      }
      current.setDate(current.getDate() + step);
    }
    return count;
  }
}

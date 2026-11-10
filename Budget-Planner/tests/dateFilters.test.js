import { describe, it, expect } from 'vitest';
import { getDateRange, isDateInRange, formatMonthYear } from '../src/utils/dateUtils';
import { subMonths, format } from 'date-fns';

describe('Date Boundaries & Filter Range Accuracy (TEST 10)', () => {
  it('Computes Current Month date boundaries accurately', () => {
    const range = getDateRange('current_month');
    expect(range.start).toBeDefined();
    expect(range.end).toBeDefined();

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    expect(isDateInRange(todayStr, range.start, range.end)).toBe(true);

    // Date from 2 months ago should NOT fall in current month
    const twoMonthsAgoStr = format(subMonths(new Date(), 2), 'yyyy-MM-dd');
    expect(isDateInRange(twoMonthsAgoStr, range.start, range.end)).toBe(false);
  });

  it('Computes Previous Month date boundaries without bleeding into current month', () => {
    const prevRange = getDateRange('prev_month');
    const prevMonthDate = subMonths(new Date(), 1);
    const prevDateStr = format(prevMonthDate, 'yyyy-MM-dd');

    expect(isDateInRange(prevDateStr, prevRange.start, prevRange.end)).toBe(true);

    // Current date must NOT be inside previous month
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    expect(isDateInRange(todayStr, prevRange.start, prevRange.end)).toBe(false);
  });

  it('Accurately handles Custom Date Range filters', () => {
    const customRange = getDateRange('custom', {
      start: '2026-06-01',
      end: '2026-06-30'
    });

    expect(isDateInRange('2026-06-15', customRange.start, customRange.end)).toBe(true);
    expect(isDateInRange('2026-05-31', customRange.start, customRange.end)).toBe(false);
    expect(isDateInRange('2026-07-01', customRange.start, customRange.end)).toBe(false);
  });

  it('Formats Month and Year strings consistently', () => {
    const formatted = formatMonthYear(new Date(2026, 10, 8)); // Month index 10 is November
    expect(formatted).toBe('November 2026');
  });
});

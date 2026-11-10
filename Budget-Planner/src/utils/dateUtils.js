import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  format,
  isValid
} from 'date-fns';

/**
 * Safely parse a date string (YYYY-MM-DD) into a local Date object set to midday
 * to prevent timezone boundary shifts (e.g., UTC midnight falling into previous day).
 * @param {string|Date} dateString
 * @returns {Date|null}
 */
export function parseLocalDate(dateString) {
  if (!dateString) return null;
  if (dateString instanceof Date) {
    return isValid(dateString) ? dateString : null;
  }
  if (typeof dateString === 'string') {
    // If format is YYYY-MM-DD
    const parts = dateString.split('T')[0].split('-').map(Number);
    if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const d = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
      return isValid(d) ? d : null;
    }
  }
  const d = new Date(dateString);
  return isValid(d) ? d : null;
}

/**
 * Format a Date object or ISO string to YYYY-MM-DD for HTML input[type="date"]
 * @param {Date|string} date
 * @returns {string}
 */
export function toInputDateFormat(date = new Date()) {
  const d = parseLocalDate(date) || new Date();
  return format(d, 'yyyy-MM-dd');
}

/**
 * Format a Date or ISO string for user-friendly display (e.g., "08 Nov 2026")
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDisplayDate(date) {
  if (!date) return '-';
  const d = parseLocalDate(date);
  if (!d) return '-';
  return format(d, 'dd MMM yyyy');
}

/**
 * Format Month & Year (e.g., "November 2026")
 * @param {Date|string} date
 * @returns {string}
 */
export function formatMonthYear(date = new Date()) {
  const d = parseLocalDate(date) || new Date();
  return format(d, 'MMMM yyyy');
}

/**
 * Get date range bounds based on period filter preset
 * @param {string} periodType 'current_month' | 'prev_month' | 'last_3_months' | 'last_6_months' | 'current_year' | 'all'
 * @param {object} customBounds { start, end } optional custom range
 * @returns {{ start: Date|null, end: Date|null }}
 */
export function getDateRange(periodType, customBounds = {}) {
  const now = new Date();

  switch (periodType) {
    case 'current_month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };

    case 'prev_month': {
      const prevMonth = subMonths(now, 1);
      return {
        start: startOfMonth(prevMonth),
        end: endOfMonth(prevMonth)
      };
    }

    case 'last_3_months': {
      const threeMonthsAgo = subMonths(now, 2);
      return {
        start: startOfMonth(threeMonthsAgo),
        end: endOfMonth(now)
      };
    }

    case 'last_6_months': {
      const sixMonthsAgo = subMonths(now, 5);
      return {
        start: startOfMonth(sixMonthsAgo),
        end: endOfMonth(now)
      };
    }

    case 'current_year':
      return {
        start: startOfYear(now),
        end: endOfYear(now)
      };

    case 'custom':
      return {
        start: customBounds.start ? parseLocalDate(customBounds.start) : null,
        end: customBounds.end ? parseLocalDate(customBounds.end) : null
      };

    case 'all':
    default:
      return { start: null, end: null };
  }
}

/**
 * Check if a transaction date string falls inside the given date range.
 * Compares year, month, and day accurately without UTC timezone shifting.
 * @param {string} dateString
 * @param {Date|null} start
 * @param {Date|null} end
 * @returns {boolean}
 */
export function isDateInRange(dateString, start, end) {
  if (!dateString) return false;
  if (!start && !end) return true; // all time

  const d = parseLocalDate(dateString);
  if (!d) return false;

  const targetTime = d.getTime();

  if (start) {
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
    if (targetTime < s.getTime()) return false;
  }

  if (end) {
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
    if (targetTime > e.getTime()) return false;
  }

  return true;
}

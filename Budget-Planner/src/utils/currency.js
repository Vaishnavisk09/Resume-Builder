/**
 * Currency formatting utilities for Finora
 * Defaults to INR (₹) as requested in the requirements.
 */

export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_CURRENCY_SYMBOL = '₹';

/**
 * Format a number as Indian Rupee (or other configured currency)
 * @param {number|string} amount
 * @param {object} options
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, options = {}) {
  const {
    symbol = DEFAULT_CURRENCY_SYMBOL,
    includeSign = false,
    compact = false,
    fractionDigits = 2
  } = options;

  const num = Number(amount);
  if (isNaN(num)) return `${symbol}0.00`;

  // Standard Indian formatting grouping (e.g. 1,00,000.00)
  try {
    const formatter = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      notation: compact ? 'compact' : 'standard'
    });

    const formattedNumber = formatter.format(Math.abs(num));
    const signPrefix = num < 0 ? '-' : (includeSign && num > 0 ? '+' : '');

    return `${signPrefix}${symbol}${formattedNumber}`;
  } catch {
    // Fallback if Intl fails
    const fixed = Math.abs(num).toFixed(fractionDigits);
    const signPrefix = num < 0 ? '-' : (includeSign && num > 0 ? '+' : '');
    return `${signPrefix}${symbol}${fixed}`;
  }
}

/**
 * Safely parse a numeric input string to float
 * @param {string|number} value
 * @returns {number}
 */
export function parseAmount(value) {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  // Remove commas, symbols, spaces
  const clean = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate savings rate percentage safely avoiding NaN / Infinity
 * @param {number} savings
 * @param {number} income
 * @returns {number} percentage (0 - 100 or negative)
 */
export function calculateSavingsRate(savings, income) {
  const safeIncome = Number(income) || 0;
  const safeSavings = Number(savings) || 0;
  if (safeIncome <= 0) return 0;
  const rate = (safeSavings / safeIncome) * 100;
  return Math.round(rate * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate budget used percentage
 * @param {number} spent
 * @param {number} budget
 * @returns {number} percentage
 */
export function calculateBudgetPercentage(spent, budget) {
  const safeBudget = Number(budget) || 0;
  const safeSpent = Number(spent) || 0;
  if (safeBudget <= 0) return 0;
  const percentage = (safeSpent / safeBudget) * 100;
  return Math.round(percentage * 10) / 10;
}

/**
 * Calculate goal progress percentage capped at 100% for display
 * @param {number} current
 * @param {number} target
 * @returns {number}
 */
export function calculateGoalProgress(current, target) {
  const safeTarget = Number(target) || 0;
  const safeCurrent = Number(current) || 0;
  if (safeTarget <= 0) return 0;
  const progress = (safeCurrent / safeTarget) * 100;
  return Math.min(100, Math.max(0, Math.round(progress * 10) / 10));
}

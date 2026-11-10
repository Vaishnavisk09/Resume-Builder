import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseAmount,
  calculateSavingsRate,
  calculateBudgetPercentage,
  calculateGoalProgress
} from '../src/utils/currency';

describe('Financial Formulas & Calculations (Section 5, 7, 8)', () => {
  it('TEST 3 & 4: Total Income, Total Expenses & Net Balance', () => {
    const transactions = [
      { id: '1', type: 'income', amount: 50000 },
      { id: '2', type: 'expense', amount: 10000 }
    ];

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    expect(totalIncome).toBe(50000);
    expect(totalExpenses).toBe(10000);
    expect(netBalance).toBe(40000);
  });

  it('Calculates Monthly Savings and Savings Rate safely', () => {
    // Normal case
    const monthlyIncome = 50000;
    const monthlyExpenses = 10000;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const rate = calculateSavingsRate(monthlySavings, monthlyIncome);

    expect(monthlySavings).toBe(40000);
    expect(rate).toBe(80); // (40000 / 50000) * 100 = 80%

    // Safe zero income case (prevent NaN / Infinity)
    const zeroIncomeRate = calculateSavingsRate(0, 0);
    expect(zeroIncomeRate).toBe(0);
    expect(Number.isNaN(zeroIncomeRate)).toBe(false);

    // Negative income or zero income with expense
    const zeroIncomeWithExpense = calculateSavingsRate(-5000, 0);
    expect(zeroIncomeWithExpense).toBe(0);
  });

  it('TEST 8: Budget Used Percentage and Remaining Budget', () => {
    const categoryBudget = 10000;
    const categoryExpense1 = 8000;

    const usedPct1 = calculateBudgetPercentage(categoryExpense1, categoryBudget);
    const remaining1 = categoryBudget - categoryExpense1;

    expect(usedPct1).toBe(80);
    expect(remaining1).toBe(2000);

    // Exceeding 100%
    const categoryExpense2 = 12000;
    const usedPct2 = calculateBudgetPercentage(categoryExpense2, categoryBudget);
    const remaining2 = categoryBudget - categoryExpense2;

    expect(usedPct2).toBe(120);
    expect(remaining2).toBe(-2000);
  });

  it('TEST 9: Savings Goal Progress and Completion Calculation', () => {
    const targetAmount = 50000;
    let currentSavings = 20000;

    let progress = calculateGoalProgress(currentSavings, targetAmount);
    let remaining = targetAmount - currentSavings;

    expect(progress).toBe(40); // (20000 / 50000) * 100 = 40%
    expect(remaining).toBe(30000);

    // Update to 50,000 (Goal Achieved)
    currentSavings = 50000;
    progress = calculateGoalProgress(currentSavings, targetAmount);
    remaining = Math.max(0, targetAmount - currentSavings);

    expect(progress).toBe(100);
    expect(remaining).toBe(0);
    expect(currentSavings >= targetAmount).toBe(true);
  });

  it('Formats Currency in Indian Rupee (INR ₹) correctly', () => {
    expect(formatCurrency(50000)).toBe('₹50,000.00');
    expect(formatCurrency(10000)).toBe('₹10,000.00');
    expect(formatCurrency(0)).toBe('₹0.00');
    expect(formatCurrency(null)).toBe('₹0.00');
    expect(formatCurrency(undefined)).toBe('₹0.00');
  });

  it('Safely parses amounts from text inputs', () => {
    expect(parseAmount('50,000')).toBe(50000);
    expect(parseAmount('₹1,250.50')).toBe(1250.5);
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('abc')).toBe(0);
  });
});

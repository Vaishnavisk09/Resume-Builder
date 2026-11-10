import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../src/stores/authStore';
import { useTransactionStore } from '../src/stores/transactionStore';
import { useBudgetStore } from '../src/stores/budgetStore';
import { validateTransaction } from '../src/utils/validators';
import { toInputDateFormat, formatDisplayDate, parseLocalDate } from '../src/utils/dateUtils';
import { routes } from '../src/router/index';

describe('FINORA Prompt Requirements Audit & Verification Suite', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // =========================================================================
  // REQUIREMENT 1: FIX THE DASHBOARD NEW ENTRY BUTTON & FORMS
  // =========================================================================
  describe('Requirement 1: New Entry Form & Validation', () => {
    it('validates required fields: rejects empty title, zero/negative amounts, missing category, invalid date', () => {
      // Empty title
      const res1 = validateTransaction({ title: '', amount: 100, category: 'Food', date: '2026-11-01', type: 'expense' });
      expect(res1.isValid).toBe(false);
      expect(res1.errors.title).toBeDefined();

      // Zero amount
      const res2 = validateTransaction({ title: 'Lunch', amount: 0, category: 'Food', date: '2026-11-01', type: 'expense' });
      expect(res2.isValid).toBe(false);
      expect(res2.errors.amount).toBeDefined();

      // Negative amount
      const res3 = validateTransaction({ title: 'Dinner', amount: -500, category: 'Food', date: '2026-11-01', type: 'expense' });
      expect(res3.isValid).toBe(false);
      expect(res3.errors.amount).toBeDefined();

      // Missing category
      const res4 = validateTransaction({ title: 'Bonus', amount: 5000, category: '', date: '2026-11-01', type: 'income' });
      expect(res4.isValid).toBe(false);
      expect(res4.errors.category).toBeDefined();

      // Invalid date
      const res5 = validateTransaction({ title: 'Salary', amount: 50000, category: 'Salary', date: 'invalid-date', type: 'income' });
      expect(res5.isValid).toBe(false);
      expect(res5.errors.date).toBeDefined();

      // Valid transaction passes
      const resValid = validateTransaction({ title: 'Freelance Design', amount: 15000, category: 'Freelance', date: '2026-11-05', type: 'income' });
      expect(resValid.isValid).toBe(true);
      expect(Object.keys(resValid.errors).length).toBe(0);
    });

    it('successfully adds Income and Expense and immediately reflects in store without full-page reload', async () => {
      const auth = useAuthStore();
      auth.user = { uid: 'user_audit_1', email: 'audit1@finora.test', displayName: 'Audit User' };

      const txStore = useTransactionStore();
      await txStore.loadTransactions();

      const todayStr = toInputDateFormat(new Date());

      // 1. Add Income
      await txStore.addTransaction({
        title: 'Monthly Salary',
        amount: 85000,
        type: 'income',
        category: 'Salary',
        date: todayStr
      });

      expect(txStore.transactions.length).toBe(1);
      expect(txStore.currentMonthIncome).toBe(85000);
      expect(txStore.currentMonthExpenses).toBe(0);
      expect(txStore.currentMonthNetBalance).toBe(85000);

      // 2. Add Expense
      await txStore.addTransaction({
        title: 'Apartment Rent',
        amount: 25000,
        type: 'expense',
        category: 'Housing / Rent',
        date: todayStr
      });

      expect(txStore.transactions.length).toBe(2);
      expect(txStore.currentMonthIncome).toBe(85000);
      expect(txStore.currentMonthExpenses).toBe(25000);
      expect(txStore.currentMonthNetBalance).toBe(60000);
      expect(txStore.currentMonthSavings).toBe(60000);
      expect(txStore.currentMonthSavingsRate).toBeCloseTo(70.59, 1);
    });
  });

  // =========================================================================
  // REQUIREMENT 2: FIX ANALYTICS NAVIGATION & ROUTING
  // =========================================================================
  describe('Requirement 2: Analytics & Page Routing', () => {
    it('defines distinct routes for Dashboard, Transactions, Budgets, Goals, Analytics, and Settings', () => {
      const pathMap = {};
      routes.forEach(r => {
        pathMap[r.path] = r;
      });

      expect(pathMap['/dashboard']).toBeDefined();
      expect(pathMap['/transactions']).toBeDefined();
      expect(pathMap['/budgets']).toBeDefined();
      expect(pathMap['/goals']).toBeDefined();
      expect(pathMap['/analytics']).toBeDefined();
      expect(pathMap['/settings']).toBeDefined();

      // Verify each route has requiresAuth meta
      ['/dashboard', '/transactions', '/budgets', '/goals', '/analytics', '/settings'].forEach(p => {
        expect(pathMap[p].meta.requiresAuth).toBe(true);
      });
    });

    it('calculates analytics category expenses and savings rate correctly', async () => {
      const auth = useAuthStore();
      auth.user = { uid: 'user_audit_analytics', email: 'analytics@finora.test', displayName: 'Analytics User' };

      const txStore = useTransactionStore();
      const today = toInputDateFormat(new Date());

      await txStore.addTransaction({ title: 'Salary', amount: 50000, type: 'income', category: 'Salary', date: today });
      await txStore.addTransaction({ title: 'Groceries', amount: 6000, type: 'expense', category: 'Food & Dining', date: today });
      await txStore.addTransaction({ title: 'Electricity', amount: 2000, type: 'expense', category: 'Utilities', date: today });
      await txStore.addTransaction({ title: 'Internet', amount: 1000, type: 'expense', category: 'Utilities', date: today });

      expect(txStore.categoryExpenses['Food & Dining']).toBe(6000);
      expect(txStore.categoryExpenses['Utilities']).toBe(3000);
      expect(txStore.filteredNetBalance).toBe(41000);
      expect(txStore.filteredSavingsRate).toBe(82);
    });
  });

  // =========================================================================
  // REQUIREMENT 3: FIX TRANSACTION DELETE FUNCTIONALITY
  // =========================================================================
  describe('Requirement 3: Transaction Deletion & Immediate Recalculation', () => {
    it('deletes transaction from store and recalculates all totals immediately', async () => {
      const auth = useAuthStore();
      auth.user = { uid: 'user_audit_delete', email: 'delete@finora.test', displayName: 'Delete Tester' };

      const txStore = useTransactionStore();
      const budgetStore = useBudgetStore();
      const today = toInputDateFormat(new Date());

      // Create budget
      await budgetStore.addBudget({ category: 'Food & Dining', amount: 10000 });

      // Add 2 transactions
      const tx1 = await txStore.addTransaction({ title: 'Dinner 1', amount: 3000, type: 'expense', category: 'Food & Dining', date: today });
      const tx2 = await txStore.addTransaction({ title: 'Dinner 2', amount: 4000, type: 'expense', category: 'Food & Dining', date: today });

      expect(txStore.transactions.length).toBe(2);
      expect(txStore.allTimeExpenses).toBe(7000);
      expect(budgetStore.budgetsWithProgress[0].spentAmount).toBe(7000);

      // Now delete tx2
      await txStore.removeTransaction(tx2.id);

      // Verify immediate state update
      expect(txStore.transactions.length).toBe(1);
      expect(txStore.transactions[0].id).toBe(tx1.id);
      expect(txStore.allTimeExpenses).toBe(3000);

      // Verify budget spending immediately dropped from 7000 to 3000
      expect(budgetStore.budgetsWithProgress[0].spentAmount).toBe(3000);
      expect(budgetStore.budgetsWithProgress[0].remainingAmount).toBe(7000);
    });
  });

  // =========================================================================
  // REQUIREMENT 4: DASHBOARD & ANALYTICS GRAPHS DATA PREPARATION
  // =========================================================================
  describe('Requirement 4: Graph Datasets & Date Handling', () => {
    it('parses local dates safely without timezone boundary shifts', () => {
      const d1 = parseLocalDate('2026-11-01');
      expect(d1).not.toBeNull();
      expect(d1.getFullYear()).toBe(2026);
      expect(d1.getMonth()).toBe(10); // November is index 10
      expect(d1.getDate()).toBe(1);

      const formatted = formatDisplayDate('2026-11-01');
      expect(formatted).toBe('01 Nov 2026');
    });

    it('handles zero or empty transaction state gracefully without NaN or errors', () => {
      const txStore = useTransactionStore();
      expect(txStore.transactions.length).toBe(0);
      expect(txStore.allTimeIncome).toBe(0);
      expect(txStore.allTimeExpenses).toBe(0);
      expect(txStore.allTimeNetBalance).toBe(0);
      expect(txStore.filteredSavingsRate).toBe(0);
      expect(Object.keys(txStore.categoryExpenses).length).toBe(0);
    });
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../src/stores/authStore';
import { useTransactionStore } from '../src/stores/transactionStore';
import { useBudgetStore } from '../src/stores/budgetStore';
import { useGoalStore } from '../src/stores/goalStore';
import { toInputDateFormat } from '../src/utils/dateUtils';
import { calculateSavingsRate } from '../src/utils/currency';

describe('Finora Verification Suite (Test A to Test F)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('Test A – Income (₹50,000) & Expense (₹10,000) on Dashboard', async () => {
    const authStore = useAuthStore();
    const txStore = useTransactionStore();

    // 1. Register and sign in
    await authStore.register({
      name: 'Test User A',
      email: 'usera@finora.test',
      password: 'password123'
    });
    expect(authStore.isAuthenticated).toBe(true);

    const today = toInputDateFormat(new Date());

    // 2. Add income of ₹50,000
    await txStore.addTransaction({
      title: 'Salary Deposit',
      amount: 50000,
      type: 'income',
      category: 'Salary',
      date: today
    });

    // 3. Add expense of ₹10,000
    await txStore.addTransaction({
      title: 'Monthly Rent',
      amount: 10000,
      type: 'expense',
      category: 'Housing & Rent',
      date: today
    });

    // Expected values
    expect(txStore.currentMonthIncome).toBe(50000);
    expect(txStore.currentMonthExpenses).toBe(10000);
    expect(txStore.currentMonthNetBalance).toBe(40000);
    expect(txStore.currentMonthSavings).toBe(40000);
    expect(txStore.currentMonthSavingsRate).toBe(80); // (40000/50000)*100
  });

  it('Test B – Edit and Delete Transactions with Immediate Recalculation', async () => {
    const authStore = useAuthStore();
    const txStore = useTransactionStore();

    await authStore.register({
      name: 'Editor User',
      email: 'editor@finora.test',
      password: 'password123'
    });

    const today = toInputDateFormat(new Date());

    const inc = await txStore.addTransaction({
      title: 'Consulting Fee',
      amount: 50000,
      type: 'income',
      category: 'Freelance & Consulting',
      date: today
    });

    const exp = await txStore.addTransaction({
      title: 'Laptop Repair',
      amount: 10000,
      type: 'expense',
      category: 'Shopping',
      date: today
    });

    expect(txStore.currentMonthExpenses).toBe(10000);
    expect(txStore.currentMonthNetBalance).toBe(40000);

    // Edit expense from ₹10,000 to ₹12,000
    await txStore.editTransaction(exp.id, {
      ...exp,
      amount: 12000,
      title: 'Laptop Repair & Battery'
    });

    expect(txStore.currentMonthExpenses).toBe(12000);
    expect(txStore.currentMonthNetBalance).toBe(38000); // 50000 - 12000 = 38000

    // Delete the expense
    await txStore.removeTransaction(exp.id);

    expect(txStore.currentMonthExpenses).toBe(0);
    expect(txStore.currentMonthNetBalance).toBe(50000);
  });

  it('Test C – Budget Spending and Warning Alerts (80% & >100%)', async () => {
    const authStore = useAuthStore();
    const txStore = useTransactionStore();
    const budgetStore = useBudgetStore();

    await authStore.register({
      name: 'Budget Master',
      email: 'budget@finora.test',
      password: 'password123'
    });

    const today = toInputDateFormat(new Date());

    // Create budget of ₹10,000 for Food & Dining
    await budgetStore.addBudget({
      category: 'Food & Dining',
      amount: 10000,
      period: 'monthly'
    });

    // Add expense of ₹8,000 (80% threshold warning)
    await txStore.addTransaction({
      title: 'Groceries',
      amount: 8000,
      type: 'expense',
      category: 'Food & Dining',
      date: today
    });

    let budgetProgress = budgetStore.budgetsWithProgress.find(b => b.category === 'Food & Dining');
    expect(budgetProgress.spentAmount).toBe(8000);
    expect(budgetProgress.percentage).toBe(80);
    expect(budgetProgress.remainingAmount).toBe(2000);
    expect(budgetProgress.status).toBe('warning');
    expect(budgetStore.hasWarningBudgets).toBe(true);
    expect(budgetStore.hasExceededBudgets).toBe(false);

    // Add another expense of ₹3,000 (Total ₹11,000 -> 110% exceeded)
    await txStore.addTransaction({
      title: 'Restaurant Dinner',
      amount: 3000,
      type: 'expense',
      category: 'Food & Dining',
      date: today
    });

    budgetProgress = budgetStore.budgetsWithProgress.find(b => b.category === 'Food & Dining');
    expect(budgetProgress.spentAmount).toBe(11000);
    expect(budgetProgress.percentage).toBe(110);
    expect(budgetProgress.remainingAmount).toBe(-1000);
    expect(budgetProgress.status).toBe('exceeded');
    expect(budgetStore.hasExceededBudgets).toBe(true);
  });

  it('Test D – Savings Goals Calculation and Completion', async () => {
    const authStore = useAuthStore();
    const goalStore = useGoalStore();

    await authStore.register({
      name: 'Saver User',
      email: 'saver@finora.test',
      password: 'password123'
    });

    // Create goal: Target ₹50,000, Current ₹20,000 (40%)
    const goal = await goalStore.addGoal({
      title: 'Emergency Fund',
      targetAmount: 50000,
      currentAmount: 20000
    });

    let goalProgress = goalStore.goalsWithProgress.find(g => g.id === goal.id);
    expect(goalProgress.progressPercentage).toBe(40);
    expect(goalProgress.remainingAmount).toBe(30000);
    expect(goalProgress.isCompleted).toBe(false);

    // Deposit ₹30,000 to reach ₹50,000
    await goalStore.depositToGoal(goal.id, 30000);

    goalProgress = goalStore.goalsWithProgress.find(g => g.id === goal.id);
    expect(goalProgress.currentAmount).toBe(50000);
    expect(goalProgress.progressPercentage).toBe(100);
    expect(goalProgress.remainingAmount).toBe(0);
    expect(goalProgress.isCompleted).toBe(true);
  });

  it('Test E – Data Persistence Across Sign Out & Sign In', async () => {
    const authStore = useAuthStore();
    const txStore = useTransactionStore();

    const registered = await authStore.register({
      name: 'Persistent User',
      email: 'persist@finora.test',
      password: 'password123'
    });

    const today = toInputDateFormat(new Date());

    await txStore.addTransaction({
      title: 'Fixed Salary',
      amount: 60000,
      type: 'income',
      category: 'Salary',
      date: today
    });

    // Sign out
    await authStore.logout();
    txStore.clearState();
    expect(authStore.isAuthenticated).toBe(false);
    expect(txStore.transactions.length).toBe(0);

    // Sign back in
    await authStore.login({
      email: 'persist@finora.test',
      password: 'password123'
    });
    expect(authStore.isAuthenticated).toBe(true);

    await txStore.loadTransactions();
    expect(txStore.transactions.length).toBe(1);
    expect(txStore.transactions[0].amount).toBe(60000);
    expect(txStore.currentMonthIncome).toBe(60000);
  });

  it('Test F – Strict User Data Isolation', async () => {
    const authStore = useAuthStore();
    const txStore = useTransactionStore();

    // User A
    await authStore.register({
      name: 'Alice A',
      email: 'alice@finora.test',
      password: 'passwordA'
    });
    const today = toInputDateFormat(new Date());
    await txStore.addTransaction({
      title: 'Alice Salary',
      amount: 70000,
      type: 'income',
      category: 'Salary',
      date: today
    });

    await authStore.logout();
    txStore.clearState();

    // User B
    await authStore.register({
      name: 'Bob B',
      email: 'bob@finora.test',
      password: 'passwordB'
    });
    await txStore.addTransaction({
      title: 'Bob Freelance',
      amount: 30000,
      type: 'income',
      category: 'Freelance & Consulting',
      date: today
    });

    expect(txStore.transactions.length).toBe(1);
    expect(txStore.transactions[0].title).toBe('Bob Freelance');
    expect(txStore.currentMonthIncome).toBe(30000);

    // Switch back to User A
    await authStore.logout();
    txStore.clearState();

    await authStore.login({
      email: 'alice@finora.test',
      password: 'passwordA'
    });
    await txStore.loadTransactions();

    expect(txStore.transactions.length).toBe(1);
    expect(txStore.transactions[0].title).toBe('Alice Salary');
    expect(txStore.currentMonthIncome).toBe(70000);
  });
});

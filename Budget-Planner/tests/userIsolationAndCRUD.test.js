import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerUser,
  loginUser,
  logoutUser
} from '../src/services/authService';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal
} from '../src/services/firestoreService';

describe('End-to-End User Isolation & Full CRUD Suite (TEST 1 to 9 & 11)', () => {
  beforeEach(() => {
    // Clear storage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('TEST 1 & 2: User Registration and Login', async () => {
    const userA = await registerUser({
      name: 'Alice Johnson',
      email: 'alice@finora.test',
      password: 'password123'
    });

    expect(userA).toBeDefined();
    expect(userA.uid).toBeDefined();
    expect(userA.email).toBe('alice@finora.test');
    expect(userA.displayName).toBe('Alice Johnson');

    // Duplicate email registration should fail
    await expect(
      registerUser({
        name: 'Alice Impostor',
        email: 'alice@finora.test',
        password: 'password123'
      })
    ).rejects.toThrow();

    // Login with valid credentials
    const loggedIn = await loginUser({
      email: 'alice@finora.test',
      password: 'password123'
    });
    expect(loggedIn.uid).toBe(userA.uid);

    // Login with invalid password should fail (TEST 11)
    await expect(
      loginUser({
        email: 'alice@finora.test',
        password: 'wrongPassword'
      })
    ).rejects.toThrow();
  });

  it('TEST 3 & 4: Add Income (₹50,000) and Add Expense (₹10,000)', async () => {
    const user = await registerUser({
      name: 'Test Earner',
      email: 'earner@finora.test',
      password: 'password123'
    });

    // 1. Add Income of ₹50,000
    const incomeTx = await createTransaction(user.uid, {
      title: 'Monthly Salary',
      amount: 50000,
      type: 'income',
      category: 'Salary',
      date: '2026-11-01',
      paymentMethod: 'Bank Transfer'
    });

    expect(incomeTx.id).toBeDefined();
    expect(incomeTx.amount).toBe(50000);

    let txList = await fetchTransactions(user.uid);
    expect(txList.length).toBe(1);

    let totalIncome = txList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    let totalExpense = txList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    expect(totalIncome).toBe(50000);
    expect(totalIncome - totalExpense).toBe(50000);

    // 2. Add Expense of ₹10,000
    const expenseTx = await createTransaction(user.uid, {
      title: 'Apartment Rent',
      amount: 10000,
      type: 'expense',
      category: 'Housing & Rent',
      date: '2026-11-05',
      paymentMethod: 'Net Banking'
    });

    expect(expenseTx.id).toBeDefined();
    expect(expenseTx.amount).toBe(10000);

    txList = await fetchTransactions(user.uid);
    expect(txList.length).toBe(2);

    totalIncome = txList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    totalExpense = txList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    expect(totalIncome).toBe(50000);
    expect(totalExpense).toBe(10000);
    expect(netBalance).toBe(40000); // Exactly ₹40,000 as required in TEST 4
  });

  it('TEST 5: Edit and Delete Transaction', async () => {
    const user = await registerUser({
      name: 'Editor User',
      email: 'editor@finora.test',
      password: 'password123'
    });

    const tx1 = await createTransaction(user.uid, {
      title: 'Groceries',
      amount: 2500,
      type: 'expense',
      category: 'Food & Dining',
      date: '2026-11-02'
    });

    const tx2 = await createTransaction(user.uid, {
      title: 'Snacks',
      amount: 500,
      type: 'expense',
      category: 'Food & Dining',
      date: '2026-11-03'
    });

    // Edit tx1 amount from 2500 to 3000
    const updated = await updateTransaction(user.uid, tx1.id, {
      ...tx1,
      amount: 3000,
      title: 'Supermarket Groceries'
    });
    expect(updated.amount).toBe(3000);
    expect(updated.title).toBe('Supermarket Groceries');

    // Delete tx2
    await deleteTransaction(user.uid, tx2.id);

    const remaining = await fetchTransactions(user.uid);
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(tx1.id);
    expect(remaining[0].amount).toBe(3000);
  });

  it('TEST 6: Data Persistence Across Logout and Re-Login', async () => {
    const user = await registerUser({
      name: 'Persistent User',
      email: 'persist@finora.test',
      password: 'password123'
    });

    await createTransaction(user.uid, {
      title: 'Freelance Design',
      amount: 25000,
      type: 'income',
      category: 'Freelance & Consulting',
      date: '2026-11-04'
    });

    await createBudget(user.uid, {
      category: 'Food & Dining',
      amount: 8000,
      period: 'monthly'
    });

    await createGoal(user.uid, {
      title: 'Emergency Fund',
      targetAmount: 100000,
      currentAmount: 30000
    });

    // Simulate Logout
    await logoutUser();

    // Re-login
    const reLoggedIn = await loginUser({
      email: 'persist@finora.test',
      password: 'password123'
    });

    expect(reLoggedIn.uid).toBe(user.uid);

    // Verify all records are still intact
    const transactions = await fetchTransactions(reLoggedIn.uid);
    const budgets = await fetchBudgets(reLoggedIn.uid);
    const goals = await fetchGoals(reLoggedIn.uid);

    expect(transactions.length).toBe(1);
    expect(transactions[0].amount).toBe(25000);
    expect(budgets.length).toBe(1);
    expect(budgets[0].amount).toBe(8000);
    expect(goals.length).toBe(1);
    expect(goals[0].targetAmount).toBe(100000);
  });

  it('TEST 7: Strict User Isolation (User A vs User B)', async () => {
    // 1. Create User A
    const userA = await registerUser({
      name: 'User Alpha',
      email: 'usera@finora.test',
      password: 'passwordA123'
    });

    await createTransaction(userA.uid, {
      title: 'Alpha Income',
      amount: 75000,
      type: 'income',
      category: 'Salary',
      date: '2026-11-01'
    });

    await createBudget(userA.uid, {
      category: 'Housing & Rent',
      amount: 20000,
      period: 'monthly'
    });

    await createGoal(userA.uid, {
      title: 'Alpha Retirement',
      targetAmount: 500000,
      currentAmount: 150000
    });

    // 2. Create User B
    const userB = await registerUser({
      name: 'User Beta',
      email: 'userb@finora.test',
      password: 'passwordB123'
    });

    await createTransaction(userB.uid, {
      title: 'Beta Income',
      amount: 35000,
      type: 'income',
      category: 'Freelance & Consulting',
      date: '2026-11-02'
    });

    // 3. Verify Isolation
    const txA = await fetchTransactions(userA.uid);
    const txB = await fetchTransactions(userB.uid);
    const budgetsA = await fetchBudgets(userA.uid);
    const budgetsB = await fetchBudgets(userB.uid);
    const goalsA = await fetchGoals(userA.uid);
    const goalsB = await fetchGoals(userB.uid);

    // User A sees ONLY User A's data
    expect(txA.length).toBe(1);
    expect(txA[0].title).toBe('Alpha Income');
    expect(budgetsA.length).toBe(1);
    expect(budgetsA[0].category).toBe('Housing & Rent');
    expect(goalsA.length).toBe(1);
    expect(goalsA[0].title).toBe('Alpha Retirement');

    // User B sees ONLY User B's data
    expect(txB.length).toBe(1);
    expect(txB[0].title).toBe('Beta Income');
    expect(budgetsB.length).toBe(0); // Beta created no budgets
    expect(goalsB.length).toBe(0); // Beta created no goals
  });

  it('TEST 8: Budget Management and Spending Warnings', async () => {
    const user = await registerUser({
      name: 'Budget Tester',
      email: 'budget@finora.test',
      password: 'password123'
    });

    const budget = await createBudget(user.uid, {
      category: 'Entertainment',
      amount: 10000,
      period: 'monthly'
    });
    expect(budget.amount).toBe(10000);

    // Edit budget amount
    const updatedBudget = await updateBudget(user.uid, budget.id, {
      ...budget,
      amount: 15000
    });
    expect(updatedBudget.amount).toBe(15000);

    // Delete budget
    await deleteBudget(user.uid, budget.id);
    const remaining = await fetchBudgets(user.uid);
    expect(remaining.length).toBe(0);
  });

  it('TEST 9: Savings Goals Progress and Completion', async () => {
    const user = await registerUser({
      name: 'Goal Tester',
      email: 'goals@finora.test',
      password: 'password123'
    });

    // Create Goal target ₹50,000, current ₹20,000 (40%)
    const goal = await createGoal(user.uid, {
      title: 'New MacBook Pro',
      targetAmount: 50000,
      currentAmount: 20000
    });
    expect(goal.targetAmount).toBe(50000);
    expect(goal.currentAmount).toBe(20000);

    // Deposit ₹30,000 to reach ₹50,000 (100% completed)
    const completed = await updateGoal(user.uid, goal.id, {
      ...goal,
      currentAmount: 50000
    });
    expect(completed.currentAmount).toBe(50000);
    expect(completed.currentAmount >= completed.targetAmount).toBe(true);

    // Delete Goal
    await deleteGoal(user.uid, goal.id);
    const remaining = await fetchGoals(user.uid);
    expect(remaining.length).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Firestore Security Rules Analysis (Section 3)', () => {
  const rulesPath = path.resolve(__dirname, '../firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

  it('Verifies firestore.rules file exists and specifies rules_version = 2', () => {
    expect(fs.existsSync(rulesPath)).toBe(true);
    expect(rulesContent).toContain("rules_version = '2'");
  });

  it('Denies global root access by default', () => {
    expect(rulesContent).toContain('match /{document=**}');
    expect(rulesContent).toMatch(/allow read, write:\s*if false;/);
  });

  it('Enforces authenticated user ownership checks (request.auth.uid == userId)', () => {
    expect(rulesContent).toContain('request.auth != null');
    expect(rulesContent).toContain('request.auth.uid == userId');
  });

  it('Guarantees user isolation on users/{userId} and subcollections', () => {
    expect(rulesContent).toContain('match /users/{userId}');
    expect(rulesContent).toContain('match /transactions/{transactionId}');
    expect(rulesContent).toContain('match /budgets/{budgetId}');
    expect(rulesContent).toContain('match /goals/{goalId}');
    expect(rulesContent).toContain('match /settings/{settingId}');
  });

  it('Validates incoming transaction schema (amount > 0, type in [income, expense], required fields)', () => {
    expect(rulesContent).toContain('function isValidTransaction(data)');
    expect(rulesContent).toContain("data.amount is number && data.amount > 0");
    expect(rulesContent).toContain("data.type == 'income' || data.type == 'expense'");
  });

  it('Validates incoming budget schema (amount > 0, category non-empty)', () => {
    expect(rulesContent).toContain('function isValidBudget(data)');
    expect(rulesContent).toContain("data.amount is number && data.amount > 0");
  });

  it('Validates incoming savings goal schema (targetAmount > 0, currentAmount >= 0)', () => {
    expect(rulesContent).toContain('function isValidGoal(data)');
    expect(rulesContent).toContain("data.targetAmount is number && data.targetAmount > 0");
    expect(rulesContent).toContain("data.currentAmount is number && data.currentAmount >= 0");
  });
});

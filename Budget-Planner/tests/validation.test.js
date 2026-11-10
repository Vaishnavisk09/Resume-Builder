import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateRegistration,
  validateLogin,
  validateTransaction,
  validateBudget,
  validateGoal
} from '../src/utils/validators';

describe('Form & Field Validations (TEST 1, 2, 11)', () => {
  it('Validates email formatting', () => {
    expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('test@example.com')).toBeNull();
  });

  it('Validates password constraints', () => {
    expect(validatePassword('123')).toBe('Password must be at least 6 characters long');
    expect(validatePassword('')).toBe('Password is required');
    expect(validatePassword('securePass123')).toBeNull();
  });

  it('Validates registration fields and password confirmation', () => {
    // Empty form
    const empty = validateRegistration({ name: '', email: '', password: '', confirmPassword: '' });
    expect(empty.isValid).toBe(false);
    expect(empty.errors.name).toBeDefined();
    expect(empty.errors.email).toBeDefined();

    // Mismatched passwords
    const mismatch = validateRegistration({
      name: 'User One',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'differentPassword'
    });
    expect(mismatch.isValid).toBe(false);
    expect(mismatch.errors.confirmPassword).toBe('Passwords do not match');

    // Valid registration
    const valid = validateRegistration({
      name: 'Vaishnavi Kadam',
      email: 'vaishnavi@finora.app',
      password: 'password123',
      confirmPassword: 'password123'
    });
    expect(valid.isValid).toBe(true);
    expect(Object.keys(valid.errors).length).toBe(0);
  });

  it('Validates transaction constraints (TEST 11: invalid amounts, required fields)', () => {
    // Invalid amount <= 0
    const zeroAmount = validateTransaction({
      title: 'Coffee',
      amount: 0,
      type: 'expense',
      category: 'Food & Dining',
      date: '2026-11-08'
    });
    expect(zeroAmount.isValid).toBe(false);
    expect(zeroAmount.errors.amount).toBeDefined();

    // Negative amount
    const negative = validateTransaction({
      title: 'Coffee',
      amount: -150,
      type: 'expense',
      category: 'Food & Dining',
      date: '2026-11-08'
    });
    expect(negative.isValid).toBe(false);

    // Empty title
    const noTitle = validateTransaction({
      title: '',
      amount: 500,
      type: 'income',
      category: 'Salary',
      date: '2026-11-08'
    });
    expect(noTitle.isValid).toBe(false);
    expect(noTitle.errors.title).toBeDefined();

    // Valid transaction
    const valid = validateTransaction({
      title: 'Salary Deposit',
      amount: 50000,
      type: 'income',
      category: 'Salary',
      date: '2026-11-08'
    });
    expect(valid.isValid).toBe(true);
  });

  it('Validates budget fields', () => {
    const invalid = validateBudget({ category: '', amount: 0 });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.category).toBeDefined();
    expect(invalid.errors.amount).toBeDefined();

    const valid = validateBudget({ category: 'Food & Dining', amount: 10000 });
    expect(valid.isValid).toBe(true);
  });

  it('Validates savings goal constraints', () => {
    const invalid = validateGoal({ title: '', targetAmount: -500, currentAmount: -100 });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.title).toBeDefined();
    expect(invalid.errors.targetAmount).toBeDefined();
    expect(invalid.errors.currentAmount).toBeDefined();

    const valid = validateGoal({ title: 'Emergency Fund', targetAmount: 50000, currentAmount: 20000 });
    expect(valid.isValid).toBe(true);
  });
});

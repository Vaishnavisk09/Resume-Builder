/**
 * Input validators for Finora
 */

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  return null;
}

export function validateRegistration(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) {
    errors.name = 'Full name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(data.password);
  if (passErr) errors.password = passErr;

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateLogin(data) {
  const errors = {};
  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateTransaction(data) {
  const errors = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.trim().length > 120) {
    errors.title = 'Title must be 120 characters or less';
  }

  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Amount must be a positive number greater than zero';
  }

  if (!['income', 'expense'].includes(data.type)) {
    errors.type = 'Type must be income or expense';
  }

  if (!data.category || !data.category.trim()) {
    errors.category = 'Category is required';
  }

  if (!data.date) {
    errors.date = 'Date is required';
  } else {
    const d = new Date(data.date);
    if (isNaN(d.getTime())) {
      errors.date = 'Please provide a valid date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateBudget(data) {
  const errors = {};

  if (!data.category || !data.category.trim()) {
    errors.category = 'Category is required';
  }

  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Budget amount must be greater than zero';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateGoal(data) {
  const errors = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Goal title is required';
  }

  const targetAmount = Number(data.targetAmount);
  if (isNaN(targetAmount) || targetAmount <= 0) {
    errors.targetAmount = 'Target amount must be greater than zero';
  }

  const currentAmount = Number(data.currentAmount);
  if (isNaN(currentAmount) || currentAmount < 0) {
    errors.currentAmount = 'Current savings cannot be negative';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

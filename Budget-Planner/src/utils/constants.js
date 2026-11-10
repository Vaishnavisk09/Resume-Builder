export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

export const EXPENSE_CATEGORIES = [
  { id: 'Food & Dining', name: 'Food & Dining', color: '#f59e0b', icon: 'Utensils' },
  { id: 'Housing & Rent', name: 'Housing & Rent', color: '#3b82f6', icon: 'Home' },
  { id: 'Transportation', name: 'Transportation', color: '#8b5cf6', icon: 'Car' },
  { id: 'Utilities & Bills', name: 'Utilities & Bills', color: '#06b6d4', icon: 'Zap' },
  { id: 'Healthcare', name: 'Healthcare', color: '#ec4899', icon: 'HeartPulse' },
  { id: 'Entertainment', name: 'Entertainment', color: '#a855f7', icon: 'Film' },
  { id: 'Shopping', name: 'Shopping', color: '#f43f5e', icon: 'ShoppingBag' },
  { id: 'Education', name: 'Education', color: '#10b981', icon: 'GraduationCap' },
  { id: 'Personal Care', name: 'Personal Care', color: '#14b8a6', icon: 'Sparkles' },
  { id: 'Investments', name: 'Investments', color: '#6366f1', icon: 'TrendingUp' },
  { id: 'Travel', name: 'Travel', color: '#0ea5e9', icon: 'Plane' },
  { id: 'Other Expense', name: 'Other Expense', color: '#64748b', icon: 'MoreHorizontal' }
];

export const INCOME_CATEGORIES = [
  { id: 'Salary', name: 'Salary', color: '#10b981', icon: 'Briefcase' },
  { id: 'Freelance & Consulting', name: 'Freelance & Consulting', color: '#059669', icon: 'Laptop' },
  { id: 'Investments & Dividends', name: 'Investments & Dividends', color: '#3b82f6', icon: 'TrendingUp' },
  { id: 'Business Profits', name: 'Business Profits', color: '#6366f1', icon: 'Building2' },
  { id: 'Rental Income', name: 'Rental Income', color: '#8b5cf6', icon: 'Home' },
  { id: 'Gifts & Grants', name: 'Gifts & Grants', color: '#ec4899', icon: 'Gift' },
  { id: 'Refunds & Cashbacks', name: 'Refunds & Cashbacks', color: '#14b8a6', icon: 'RotateCcw' },
  { id: 'Other Income', name: 'Other Income', color: '#64748b', icon: 'MoreHorizontal' }
];

export const PAYMENT_METHODS = [
  'UPI / GPay / PhonePe',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Cheque',
  'Bank Transfer'
];

export const PERIOD_FILTERS = [
  { id: 'current_month', label: 'Current Month' },
  { id: 'prev_month', label: 'Previous Month' },
  { id: 'last_3_months', label: 'Last 3 Months' },
  { id: 'last_6_months', label: 'Last 6 Months' },
  { id: 'current_year', label: 'Current Year' },
  { id: 'custom', label: 'Custom Range' },
  { id: 'all', label: 'All Time' }
];

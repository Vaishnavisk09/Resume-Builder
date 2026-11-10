import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '@/services/firestoreService';
import { useAuthStore } from './authStore';
import { getDateRange, isDateInRange } from '@/utils/dateUtils';
import { calculateSavingsRate } from '@/utils/currency';
import { startOfMonth, endOfMonth, format, parseISO, isValid } from 'date-fns';

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Filter states
  const periodFilter = ref('current_month'); // 'current_month' | 'prev_month' | 'last_3_months' | 'last_6_months' | 'current_year' | 'custom' | 'all'
  const customStartDate = ref('');
  const customEndDate = ref('');
  const typeFilter = ref('all'); // 'all' | 'income' | 'expense'
  const categoryFilter = ref('all');
  const searchQuery = ref('');

  const authStore = useAuthStore();

  /**
   * Reset filters back to default
   */
  function resetFilters() {
    periodFilter.value = 'current_month';
    customStartDate.value = '';
    customEndDate.value = '';
    typeFilter.value = 'all';
    categoryFilter.value = 'all';
    searchQuery.value = '';
  }

  /**
   * Clear all transactions on logout
   */
  function clearState() {
    transactions.value = [];
    resetFilters();
    error.value = null;
  }

  /**
   * Fetch all transactions for the current authenticated user
   */
  async function loadTransactions() {
    const uid = authStore.userUid;
    if (!uid) {
      transactions.value = [];
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const data = await fetchTransactions(uid);
      transactions.value = data;
    } catch (err) {
      error.value = err.message || 'Failed to load transactions';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function addTransaction(transactionData) {
    const uid = authStore.userUid;
    if (!uid) throw new Error('You must be signed in to add transactions');

    isLoading.value = true;
    try {
      const created = await createTransaction(uid, transactionData);
      transactions.value = [created, ...transactions.value].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      return created;
    } catch (err) {
      error.value = err.message || 'Failed to save transaction';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function editTransaction(transactionId, transactionData) {
    const uid = authStore.userUid;
    if (!uid) throw new Error('You must be signed in to edit transactions');

    isLoading.value = true;
    try {
      const updated = await updateTransaction(uid, transactionId, transactionData);
      transactions.value = transactions.value.map(tx => (tx.id === transactionId ? { ...tx, ...updated } : tx))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      return updated;
    } catch (err) {
      error.value = err.message || 'Failed to update transaction';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function removeTransaction(transactionId) {
    const uid = authStore.userUid;
    if (!uid) throw new Error('You must be signed in to delete transactions');

    isLoading.value = true;
    try {
      await deleteTransaction(uid, transactionId);
      transactions.value = transactions.value.filter(tx => tx.id !== transactionId);
      return true;
    } catch (err) {
      error.value = err.message || 'Failed to delete transaction';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ==========================================
  // GETTERS & COMPUTED PROPERTIES
  // ==========================================

  /**
   * Filtered list of transactions based on active filter controls
   */
  const filteredTransactions = computed(() => {
    const range = getDateRange(periodFilter.value, {
      start: customStartDate.value,
      end: customEndDate.value
    });

    const query = searchQuery.value.trim().toLowerCase();

    return transactions.value.filter(tx => {
      // 1. Date Range Filter
      if (!isDateInRange(tx.date, range.start, range.end)) {
        return false;
      }

      // 2. Type Filter (income / expense)
      if (typeFilter.value !== 'all' && tx.type !== typeFilter.value) {
        return false;
      }

      // 3. Category Filter
      if (categoryFilter.value !== 'all' && tx.category !== categoryFilter.value) {
        return false;
      }

      // 4. Search Filter (matches title, description, or payment method)
      if (query) {
        const titleMatch = (tx.title || '').toLowerCase().includes(query);
        const descMatch = (tx.description || '').toLowerCase().includes(query);
        const catMatch = (tx.category || '').toLowerCase().includes(query);
        const methodMatch = (tx.paymentMethod || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !catMatch && !methodMatch) {
          return false;
        }
      }

      return true;
    });
  });

  // Global All-Time Calculations
  const allTimeIncome = computed(() => {
    return transactions.value
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  });

  const allTimeExpenses = computed(() => {
    return transactions.value
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  });

  const allTimeNetBalance = computed(() => {
    return allTimeIncome.value - allTimeExpenses.value;
  });

  // Filtered Period Calculations (used on Dashboard & Analytics when filters are applied)
  const filteredIncome = computed(() => {
    return filteredTransactions.value
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  });

  const filteredExpenses = computed(() => {
    return filteredTransactions.value
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  });

  const filteredNetBalance = computed(() => {
    return filteredIncome.value - filteredExpenses.value;
  });

  const filteredSavingsRate = computed(() => {
    return calculateSavingsRate(filteredNetBalance.value, filteredIncome.value);
  });

  // Current Calendar Month Calculations (for strict monthly budget & savings calculations)
  const currentMonthTransactions = computed(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    return transactions.value.filter(tx => isDateInRange(tx.date, start, end));
  });

  const currentMonthIncome = computed(() => {
    return currentMonthTransactions.value
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  });

  const currentMonthExpenses = computed(() => {
    return currentMonthTransactions.value
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  });

  const currentMonthSavings = computed(() => {
    return currentMonthIncome.value - currentMonthExpenses.value;
  });

  const currentMonthNetBalance = computed(() => {
    return currentMonthIncome.value - currentMonthExpenses.value;
  });

  const currentMonthSavingsRate = computed(() => {
    return calculateSavingsRate(currentMonthSavings.value, currentMonthIncome.value);
  });

  // Expense breakdown specifically for the current month
  const currentMonthCategoryExpenses = computed(() => {
    const map = {};
    currentMonthTransactions.value
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const cat = tx.category || 'Other Expense';
        map[cat] = (map[cat] || 0) + (Number(tx.amount) || 0);
      });
    return map;
  });

  // Expense breakdown by category for filtered transactions (for doughnut chart)
  const categoryExpenses = computed(() => {
    const map = {};
    filteredTransactions.value
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const cat = tx.category || 'Other Expense';
        map[cat] = (map[cat] || 0) + (Number(tx.amount) || 0);
      });
    return map;
  });

  // Income breakdown by category
  const categoryIncome = computed(() => {
    const map = {};
    filteredTransactions.value
      .filter(tx => tx.type === 'income')
      .forEach(tx => {
        const cat = tx.category || 'Other Income';
        map[cat] = (map[cat] || 0) + (Number(tx.amount) || 0);
      });
    return map;
  });

  return {
    transactions,
    isLoading,
    error,
    periodFilter,
    customStartDate,
    customEndDate,
    typeFilter,
    categoryFilter,
    searchQuery,
    filteredTransactions,
    allTimeIncome,
    allTimeExpenses,
    allTimeNetBalance,
    filteredIncome,
    filteredExpenses,
    filteredNetBalance,
    filteredSavingsRate,
    currentMonthTransactions,
    currentMonthIncome,
    currentMonthExpenses,
    currentMonthNetBalance,
    currentMonthSavings,
    currentMonthSavingsRate,
    currentMonthCategoryExpenses,
    categoryExpenses,
    categoryIncome,
    resetFilters,
    clearState,
    loadTransactions,
    addTransaction,
    editTransaction,
    removeTransaction
  };
});

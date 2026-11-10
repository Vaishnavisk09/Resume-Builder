import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} from '@/services/firestoreService';
import { useAuthStore } from './authStore';
import { useTransactionStore } from './transactionStore';
import { calculateBudgetPercentage } from '@/utils/currency';

export const useBudgetStore = defineStore('budget', () => {
  const budgets = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const authStore = useAuthStore();
  const transactionStore = useTransactionStore();

  function clearState() {
    budgets.value = [];
    error.value = null;
  }

  async function loadBudgets() {
    const uid = authStore.userUid;
    if (!uid) {
      budgets.value = [];
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const data = await fetchBudgets(uid);
      budgets.value = data;
    } catch (err) {
      error.value = err.message || 'Failed to load budgets';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function addBudget(budgetData) {
    const uid = authStore.userUid;
    if (!uid) throw new Error('You must be signed in to add budgets');

    isLoading.value = true;
    try {
      const created = await createBudget(uid, budgetData);
      budgets.value = [...budgets.value, created];
      return created;
    } catch (err) {
      error.value = err.message || 'Failed to create budget';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function editBudget(budgetId, budgetData) {
    const uid = authStore.userUid;
    if (!uid) throw new Error('You must be signed in to edit budgets');

    isLoading.value = true;
    try {
      const updated = await updateBudget(uid, budgetId, budgetData);
      budgets.value = budgets.value.map(b => (b.id === budgetId ? { ...b, ...updated } : b));
      return updated;
    } catch (err) {
      error.value = err.message || 'Failed to update budget';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function removeBudget(budgetId) {
    const uid = authStore.userUid;
    if (!uid) throw new Error('You must be signed in to delete budgets');

    isLoading.value = true;
    try {
      await deleteBudget(uid, budgetId);
      budgets.value = budgets.value.filter(b => b.id !== budgetId);
      return true;
    } catch (err) {
      error.value = err.message || 'Failed to delete budget';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ==========================================
  // COMPUTED PROPERTIES & PROGRESS
  // ==========================================

  /**
   * Budgets computed with actual category expenses for the current month
   */
  const budgetsWithProgress = computed(() => {
    // Current month expenses map by category
    const monthTx = transactionStore.currentMonthTransactions;
    const expenseByCat = {};

    monthTx
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const cat = tx.category || 'Other Expense';
        expenseByCat[cat] = (expenseByCat[cat] || 0) + (Number(tx.amount) || 0);
      });

    return budgets.value.map(b => {
      const spent = expenseByCat[b.category] || 0;
      const budgetAmount = Number(b.amount) || 0;
      const percentage = calculateBudgetPercentage(spent, budgetAmount);
      const remaining = budgetAmount - spent;

      // Status classification
      let status = 'normal'; // < 80%
      if (percentage > 100) {
        status = 'exceeded'; // > 100%
      } else if (percentage >= 80) {
        status = 'warning'; // 80% - 100%
      }

      return {
        ...b,
        spentAmount: spent,
        budgetAmount,
        percentage,
        remainingAmount: remaining,
        status // 'normal' | 'warning' | 'exceeded'
      };
    });
  });

  const totalMonthlyBudget = computed(() => {
    return budgets.value.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  });

  const totalBudgetSpent = computed(() => {
    return budgetsWithProgress.value.reduce((sum, b) => sum + b.spentAmount, 0);
  });

  const totalRemainingBudget = computed(() => {
    return totalMonthlyBudget.value - totalBudgetSpent.value;
  });

  const totalBudgetPercentage = computed(() => {
    return calculateBudgetPercentage(totalBudgetSpent.value, totalMonthlyBudget.value);
  });

  const hasExceededBudgets = computed(() => {
    return budgetsWithProgress.value.some(b => b.status === 'exceeded');
  });

  const hasWarningBudgets = computed(() => {
    return budgetsWithProgress.value.some(b => b.status === 'warning');
  });

  return {
    budgets,
    isLoading,
    error,
    budgetsWithProgress,
    totalMonthlyBudget,
    totalBudgetSpent,
    totalRemainingBudget,
    totalBudgetPercentage,
    hasExceededBudgets,
    hasWarningBudgets,
    loadBudgets,
    addBudget,
    editBudget,
    removeBudget,
    clearState
  };
});

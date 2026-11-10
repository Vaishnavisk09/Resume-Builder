import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal
} from '@/services/firestoreService';
import { useAuthStore } from './authStore';
import { calculateGoalProgress } from '@/utils/currency';

export const useGoalStore = defineStore('goal', () => {
  const goals = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const authStore = useAuthStore();

  function clearState() {
    goals.value = [];
    error.value = null;
  }

  async function loadGoals() {
    const uid = authStore.userUid;
    if (!uid) {
      goals.value = [];
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const data = await fetchGoals(uid);
      goals.value = data;
    } catch (err) {
      error.value = err.message || 'Failed to load goals';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function addGoal(goalData) {
    const uid = authStore.userUid;
    if (!uid) throw new Error('You must be signed in to add goals');

    isLoading.value = true;
    try {
      const created = await createGoal(uid, goalData);
      goals.value = [...goals.value, created];
      return created;
    } catch (err) {
      error.value = err.message || 'Failed to create goal';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function editGoal(goalId, goalData) {
    const uid = authStore.userUid;
    if (!uid) throw new Error('You must be signed in to edit goals');

    isLoading.value = true;
    try {
      const updated = await updateGoal(uid, goalId, goalData);
      goals.value = goals.value.map(g => (g.id === goalId ? { ...g, ...updated } : g));
      return updated;
    } catch (err) {
      error.value = err.message || 'Failed to update goal';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Deposit money towards a goal
   */
  async function depositToGoal(goalId, depositAmount) {
    const targetGoal = goals.value.find(g => g.id === goalId);
    if (!targetGoal) throw new Error('Goal not found');

    const deposit = Number(depositAmount);
    if (isNaN(deposit) || deposit <= 0) {
      throw new Error('Deposit amount must be greater than zero');
    }

    const newCurrent = Number(targetGoal.currentAmount || 0) + deposit;
    return editGoal(goalId, {
      ...targetGoal,
      currentAmount: newCurrent
    });
  }

  async function removeGoal(goalId) {
    const uid = authStore.userUid;
    if (!uid) throw new Error('You must be signed in to delete goals');

    isLoading.value = true;
    try {
      await deleteGoal(uid, goalId);
      goals.value = goals.value.filter(g => g.id !== goalId);
      return true;
    } catch (err) {
      error.value = err.message || 'Failed to delete goal';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ==========================================
  // COMPUTED PROPERTIES
  // ==========================================

  const goalsWithProgress = computed(() => {
    return goals.value.map(g => {
      const target = Number(g.targetAmount) || 0;
      const current = Math.max(0, Number(g.currentAmount) || 0);
      const progress = calculateGoalProgress(current, target);
      const remaining = Math.max(0, target - current);
      const isCompleted = current >= target && target > 0;

      return {
        ...g,
        targetAmount: target,
        currentAmount: current,
        progressPercentage: progress,
        remainingAmount: remaining,
        isCompleted
      };
    });
  });

  const totalTargetSavings = computed(() => {
    return goalsWithProgress.value.reduce((sum, g) => sum + g.targetAmount, 0);
  });

  const totalCurrentSavings = computed(() => {
    return goalsWithProgress.value.reduce((sum, g) => sum + g.currentAmount, 0);
  });

  const overallGoalProgress = computed(() => {
    return calculateGoalProgress(totalCurrentSavings.value, totalTargetSavings.value);
  });

  const completedGoalsCount = computed(() => {
    return goalsWithProgress.value.filter(g => g.isCompleted).length;
  });

  return {
    goals,
    isLoading,
    error,
    goalsWithProgress,
    totalTargetSavings,
    totalCurrentSavings,
    overallGoalProgress,
    completedGoalsCount,
    loadGoals,
    addGoal,
    editGoal,
    depositToGoal,
    removeGoal,
    clearState
  };
});

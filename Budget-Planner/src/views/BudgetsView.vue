<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Monthly Budgets
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Set spending limits per category and track your progress to avoid overspending
        </p>
      </div>

      <button
        @click="openAddModal"
        class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition flex items-center space-x-1.5 active:scale-95 self-start sm:self-auto"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Create Budget</span>
      </button>
    </div>

    <!-- Overall Budget Stats Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Monthly Budget</span>
        <p class="text-2xl font-extrabold text-slate-900 mt-1">
          {{ formatCurrency(budgetStore.totalMonthlyBudget) }}
        </p>
        <p class="text-xs text-slate-500 mt-1">Allocated across categories</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Spent</span>
        <p class="text-2xl font-extrabold text-slate-900 mt-1">
          {{ formatCurrency(budgetStore.totalBudgetSpent) }}
        </p>
        <p class="text-xs text-slate-500 mt-1">From current calendar month</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Remaining Budget</span>
        <p
          class="text-2xl font-extrabold mt-1"
          :class="budgetStore.totalRemainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'"
        >
          {{ formatCurrency(budgetStore.totalRemainingBudget) }}
        </p>
        <p class="text-xs text-slate-500 mt-1">
          {{ budgetStore.totalRemainingBudget < 0 ? 'Over budget limit' : 'Available to spend' }}
        </p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Utilization</span>
        <p class="text-2xl font-extrabold text-slate-900 mt-1">
          {{ budgetStore.totalBudgetPercentage }}%
        </p>
        <div class="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="budgetStore.totalBudgetPercentage > 100
              ? 'bg-rose-500'
              : budgetStore.totalBudgetPercentage >= 80
                ? 'bg-amber-400'
                : 'bg-emerald-500'"
            :style="{ width: `${Math.min(100, budgetStore.totalBudgetPercentage)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Status Alerts if any category exceeded or 80% used -->
    <div
      v-if="budgetStore.hasExceededBudgets"
      class="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-900 text-sm"
    >
      <AlertCircle class="w-5 h-5 text-rose-600 shrink-0" />
      <span>
        <strong>Exceeded Alert:</strong> You have exceeded your budget limit in one or more categories this month. Review below.
      </span>
    </div>
    <div
      v-else-if="budgetStore.hasWarningBudgets"
      class="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-3 text-amber-900 text-sm"
    >
      <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0" />
      <span>
        <strong>80% Spending Warning:</strong> Some categories are nearing their monthly limits (80% or higher).
      </span>
    </div>

    <!-- Budgets Grid -->
    <div v-if="budgetStore.budgetsWithProgress.length === 0" class="py-16 text-center bg-white rounded-2xl border border-slate-200/80">
      <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
        <PieChart class="w-8 h-8" />
      </div>
      <h4 class="text-base font-bold text-slate-800">No category budgets yet</h4>
      <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
        Start by setting a monthly spending limit for categories like Food & Dining, Shopping, or Utilities.
      </p>
      <button
        @click="openAddModal"
        class="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition inline-flex items-center space-x-1.5"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Create First Budget</span>
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <BudgetCard
        v-for="b in budgetStore.budgetsWithProgress"
        :key="b.id"
        :budget="b"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Modals -->
    <BudgetModal
      :is-open="isModalOpen"
      :budget="activeBudget"
      @close="isModalOpen = false"
      @save="handleSave"
    />

    <ConfirmModal
      :is-open="isConfirmOpen"
      title="Delete Budget"
      :message="`Are you sure you want to delete the budget for '${budgetToDelete?.category}'?`"
      warning="This will remove the monthly spending limit for this category."
      :is-loading="isDeleting"
      @cancel="isConfirmOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useBudgetStore } from '@/stores/budgetStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency } from '@/utils/currency';
import BudgetCard from '@/components/budgets/BudgetCard.vue';
import BudgetModal from '@/components/budgets/BudgetModal.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import {
  PlusCircle,
  PieChart,
  AlertCircle,
  AlertTriangle
} from 'lucide-vue-next';

const budgetStore = useBudgetStore();
const notificationStore = useNotificationStore();

const isModalOpen = ref(false);
const activeBudget = ref(null);

const isConfirmOpen = ref(false);
const budgetToDelete = ref(null);
const isDeleting = ref(false);

function openAddModal() {
  activeBudget.value = null;
  isModalOpen.value = true;
}

function handleEdit(b) {
  activeBudget.value = { ...b };
  isModalOpen.value = true;
}

function handleDelete(b) {
  budgetToDelete.value = b;
  isConfirmOpen.value = true;
}

async function handleSave(data) {
  try {
    if (data.id) {
      await budgetStore.editBudget(data.id, data);
      notificationStore.success(`Budget for ${data.category} updated!`);
    } else {
      await budgetStore.addBudget(data);
      notificationStore.success(`Budget for ${data.category} created!`);
    }
  } catch (err) {
    notificationStore.error(err.message || 'Failed to save budget');
  }
}

async function confirmDelete() {
  if (!budgetToDelete.value) return;
  isDeleting.value = true;
  try {
    await budgetStore.removeBudget(budgetToDelete.value.id);
    notificationStore.success('Budget removed successfully.');
    isConfirmOpen.value = false;
  } catch (err) {
    notificationStore.error(err.message || 'Failed to delete budget');
  } finally {
    isDeleting.value = false;
  }
}
</script>

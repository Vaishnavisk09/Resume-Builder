<template>
  <div class="space-y-6 pb-12">
    <!-- Header / Welcome Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {{ authStore.userDisplayName }} 👋
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Financial overview for <strong class="text-slate-700">{{ activeMonthLabel }}</strong>
        </p>
      </div>

      <!-- Controls & Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Dashboard Period View Toggle -->
        <div class="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
          <button
            type="button"
            @click="dashboardPeriod = 'current_month'"
            class="px-3 py-1.5 rounded-lg transition"
            :class="dashboardPeriod === 'current_month' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'"
          >
            This Month
          </button>
          <button
            type="button"
            @click="dashboardPeriod = 'all'"
            class="px-3 py-1.5 rounded-lg transition"
            :class="dashboardPeriod === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'"
          >
            All Time
          </button>
        </div>

        <button
          id="dashboard-new-entry-btn"
          @click="openNewEntry"
          class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition flex items-center space-x-1.5 active:scale-95"
          title="Add a new income or expense record"
        >
          <PlusCircle class="w-4 h-4" />
          <span>New Entry</span>
        </button>
        <button
          @click="openAddTransaction('income')"
          class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition flex items-center space-x-1.5 active:scale-95"
        >
          <ArrowDownLeft class="w-4 h-4" />
          <span>Add Income</span>
        </button>
        <button
          @click="openAddTransaction('expense')"
          class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition flex items-center space-x-1.5 active:scale-95"
        >
          <ArrowUpRight class="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>
    </div>

    <!-- 4 Key Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- Income Card -->
      <StatCard
        :title="dashboardPeriod === 'current_month' ? 'Monthly Income' : 'Total Income'"
        :amount="dashboardIncome"
        :icon="TrendingUp"
        type="income"
        :subtitle="dashboardPeriodLabel"
        badge-text="Inflow"
      />

      <!-- Expenses Card -->
      <StatCard
        :title="dashboardPeriod === 'current_month' ? 'Monthly Expenses' : 'Total Expenses'"
        :amount="dashboardExpenses"
        :icon="TrendingDown"
        type="expense"
        :subtitle="dashboardPeriodLabel"
        badge-text="Outflow"
      />

      <!-- Net Balance Card -->
      <StatCard
        title="Net Balance"
        :amount="dashboardNetBalance"
        :icon="Wallet"
        type="balance"
        subtitle="Income minus expenses"
        :badge-text="dashboardNetBalance >= 0 ? 'Surplus' : 'Deficit'"
      />

      <!-- Savings Card -->
      <StatCard
        :title="dashboardPeriod === 'current_month' ? 'Monthly Savings' : 'Total Savings'"
        :amount="dashboardSavings"
        :icon="PiggyBank"
        type="savings"
        :subtitle="`Savings rate: ${dashboardSavingsRate}%`"
        :badge-text="`${dashboardSavingsRate}% Rate`"
      />
    </div>

    <!-- Budget Warning Banner (if any budget exceeded or >=80%) -->
    <div
      v-if="budgetStore.hasExceededBudgets"
      class="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-900 text-sm"
    >
      <div class="flex items-center space-x-2.5">
        <AlertCircle class="w-5 h-5 text-rose-600 shrink-0" />
        <span>
          <strong>Budget Alert:</strong> One or more category budgets have exceeded 100% of their spending limits!
        </span>
      </div>
      <router-link
        to="/budgets"
        class="text-xs font-bold text-rose-700 underline shrink-0 hover:text-rose-900"
      >
        View Budgets &rarr;
      </router-link>
    </div>
    <div
      v-else-if="budgetStore.hasWarningBudgets"
      class="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-amber-900 text-sm"
    >
      <div class="flex items-center space-x-2.5">
        <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          <strong>Budget Warning:</strong> You have reached over 80% of your allocated budget on one or more categories.
        </span>
      </div>
      <router-link
        to="/budgets"
        class="text-xs font-bold text-amber-800 underline shrink-0 hover:text-amber-950"
      >
        Review &rarr;
      </router-link>
    </div>

    <!-- Charts Row 1: Income vs Expense & Category Doughnut -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2">
        <IncomeExpenseChart :transactions="transactionStore.transactions" />
      </div>
      <div>
        <ExpenseCategoryChart :category-data="dashboardCategoryExpenses" />
      </div>
    </div>

    <!-- Charts Row 2: Spending Trend & Active Budgets -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2">
        <SpendingTrendChart :transactions="dashboardTransactions" />
      </div>

      <!-- Quick Budgets Widget -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-bold text-slate-800 text-sm sm:text-base">Monthly Budgets</h4>
            <router-link to="/budgets" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Manage
            </router-link>
          </div>
          <div v-if="budgetStore.budgetsWithProgress.length === 0" class="text-center py-6">
            <p class="text-xs text-slate-500">No monthly budgets configured yet.</p>
            <button
              @click="isBudgetModalOpen = true"
              class="mt-2 text-xs font-bold text-emerald-600 hover:underline"
            >
              + Create your first budget
            </button>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="b in budgetStore.budgetsWithProgress.slice(0, 3)"
              :key="b.id"
              class="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50"
            >
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-slate-700">{{ b.category }}</span>
                <span
                  :class="b.status === 'exceeded' ? 'text-rose-600' : b.status === 'warning' ? 'text-amber-600' : 'text-slate-800'"
                >
                  {{ formatCurrency(b.spentAmount) }} / {{ formatCurrency(b.budgetAmount) }}
                </span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :class="b.status === 'exceeded' ? 'bg-rose-500' : b.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-500'"
                  :style="{ width: `${Math.min(100, b.percentage)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Total Monthly Limit</span>
          <span class="text-slate-800 font-bold">{{ formatCurrency(budgetStore.totalMonthlyBudget) }}</span>
        </div>
      </div>
    </div>

    <!-- Recent Transactions Table Section -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900">Recent Transactions</h3>
          <p class="text-xs text-slate-500">Your latest logged financial activity</p>
        </div>
        <router-link
          to="/transactions"
          class="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
        >
          <span>View All Transactions</span>
          <ArrowRight class="w-4 h-4" />
        </router-link>
      </div>

      <TransactionTable
        :transactions="recentTransactions"
        empty-message="No transactions recorded yet. Click 'Add Income' or 'Add Expense' above to start tracking!"
        @create="openAddTransaction('expense')"
        @edit="handleEditTransaction"
        @delete="handleDeleteClick"
      />
    </div>

    <!-- Modals -->
    <TransactionModal
      :is-open="isTxModalOpen"
      :transaction="selectedTx"
      @close="isTxModalOpen = false"
      @save="handleSaveTransaction"
    />

    <BudgetModal
      :is-open="isBudgetModalOpen"
      @close="isBudgetModalOpen = false"
      @save="handleSaveBudget"
    />

    <ConfirmModal
      :is-open="isConfirmOpen"
      title="Delete Transaction"
      :message="`Are you sure you want to delete '${txToDelete?.title}' (₹${txToDelete?.amount})?`"
      warning="This record will be permanently deleted from your Firestore database."
      :is-loading="isDeleting"
      @cancel="isConfirmOpen = false"
      @confirm="confirmDeleteTransaction"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency, calculateSavingsRate } from '@/utils/currency';
import { formatMonthYear } from '@/utils/dateUtils';
import StatCard from '@/components/dashboard/StatCard.vue';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart.vue';
import ExpenseCategoryChart from '@/components/charts/ExpenseCategoryChart.vue';
import SpendingTrendChart from '@/components/charts/SpendingTrendChart.vue';
import TransactionTable from '@/components/transactions/TransactionTable.vue';
import TransactionModal from '@/components/transactions/TransactionModal.vue';
import BudgetModal from '@/components/budgets/BudgetModal.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  PlusCircle
} from 'lucide-vue-next';

const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const budgetStore = useBudgetStore();
const notificationStore = useNotificationStore();

const activeMonthLabel = computed(() => formatMonthYear(new Date()));

// Dashboard period toggle: 'current_month' (default) or 'all'
const dashboardPeriod = ref('current_month');

const dashboardPeriodLabel = computed(() => {
  return dashboardPeriod.value === 'current_month' ? 'This calendar month' : 'All-time records';
});

const dashboardTransactions = computed(() => {
  return dashboardPeriod.value === 'current_month'
    ? transactionStore.currentMonthTransactions
    : transactionStore.transactions;
});

const dashboardIncome = computed(() => {
  return dashboardPeriod.value === 'current_month'
    ? transactionStore.currentMonthIncome
    : transactionStore.allTimeIncome;
});

const dashboardExpenses = computed(() => {
  return dashboardPeriod.value === 'current_month'
    ? transactionStore.currentMonthExpenses
    : transactionStore.allTimeExpenses;
});

const dashboardNetBalance = computed(() => {
  return dashboardIncome.value - dashboardExpenses.value;
});

const dashboardSavings = computed(() => {
  return dashboardIncome.value - dashboardExpenses.value;
});

const dashboardSavingsRate = computed(() => {
  return calculateSavingsRate(dashboardSavings.value, dashboardIncome.value);
});

const dashboardCategoryExpenses = computed(() => {
  if (dashboardPeriod.value === 'current_month') {
    return transactionStore.currentMonthCategoryExpenses;
  }
  const map = {};
  transactionStore.transactions
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      const cat = tx.category || 'Other Expense';
      map[cat] = (map[cat] || 0) + (Number(tx.amount) || 0);
    });
  return map;
});

const recentTransactions = computed(() => {
  return transactionStore.transactions.slice(0, 6);
});

// Transaction Modal State
const isTxModalOpen = ref(false);
const selectedTx = ref(null);

function openNewEntry() {
  selectedTx.value = { type: 'expense' };
  isTxModalOpen.value = true;
}

function openAddTransaction(type = 'expense') {
  selectedTx.value = { type };
  isTxModalOpen.value = true;
}

function handleEditTransaction(tx) {
  selectedTx.value = { ...tx };
  isTxModalOpen.value = true;
}

function handleSaveTransaction() {
  isTxModalOpen.value = false;
}

// Budget Modal State
const isBudgetModalOpen = ref(false);

async function handleSaveBudget(data) {
  try {
    await budgetStore.addBudget(data);
    notificationStore.success(`Budget for ${data.category} created!`);
  } catch (err) {
    notificationStore.error(err.message || 'Failed to create budget');
  }
}

// Delete Confirmation
const isConfirmOpen = ref(false);
const txToDelete = ref(null);
const isDeleting = ref(false);

function handleDeleteClick(tx) {
  txToDelete.value = tx;
  isConfirmOpen.value = true;
}

async function confirmDeleteTransaction() {
  if (!txToDelete.value) return;
  isDeleting.value = true;
  try {
    await transactionStore.removeTransaction(txToDelete.value.id);
    notificationStore.success('Transaction removed successfully.');
    isConfirmOpen.value = false;
  } catch (err) {
    notificationStore.error(err.message || 'Failed to delete transaction');
  } finally {
    isDeleting.value = false;
  }
}
</script>

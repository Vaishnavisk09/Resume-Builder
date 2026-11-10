<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Financial Analytics & Reports
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Deep-dive analysis of your income, expenses, cash flow trends, and savings metrics
        </p>
      </div>

      <!-- Quick Metrics Pill -->
      <div class="flex items-center space-x-2">
        <span class="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
          Savings Rate: {{ transactionStore.filteredSavingsRate }}%
        </span>
      </div>
    </div>

    <!-- Active Analytics Filter Strip -->
    <TransactionFilter />

    <!-- Top Summary Metrics for Filtered Window -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Filtered Income"
        :amount="transactionStore.filteredIncome"
        :icon="TrendingUp"
        type="income"
        subtitle="Selected date range"
      />
      <StatCard
        title="Filtered Expenses"
        :amount="transactionStore.filteredExpenses"
        :icon="TrendingDown"
        type="expense"
        subtitle="Selected date range"
      />
      <StatCard
        title="Net Savings"
        :amount="transactionStore.filteredNetBalance"
        :icon="Wallet"
        type="balance"
        :subtitle="transactionStore.filteredNetBalance >= 0 ? 'Surplus recorded' : 'Deficit recorded'"
      />
      <StatCard
        title="Savings Efficiency"
        :amount="transactionStore.filteredSavingsRate"
        :icon="PiggyBank"
        type="savings"
        subtitle="Percentage saved"
        :badge-text="`${transactionStore.filteredSavingsRate}% Rate`"
      />
    </div>

    <!-- Grid of All 5 Required Visualizations -->
    <!-- Row 1: Income vs Expense & Category Doughnut -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2">
        <IncomeExpenseChart :transactions="transactionStore.filteredTransactions" />
      </div>
      <div>
        <ExpenseCategoryChart :category-data="transactionStore.categoryExpenses" />
      </div>
    </div>

    <!-- Row 2: Spending Trend Line Chart & Category Comparison Bar Chart -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div>
        <SpendingTrendChart :transactions="transactionStore.filteredTransactions" />
      </div>
      <div>
        <CategoryBarChart :category-data="transactionStore.categoryExpenses" />
      </div>
    </div>

    <!-- Row 3: Savings Trend Chart (Full Width) -->
    <div>
      <SavingsTrendChart :transactions="transactionStore.filteredTransactions" />
    </div>
  </div>
</template>

<script setup>
import { useTransactionStore } from '@/stores/transactionStore';
import TransactionFilter from '@/components/transactions/TransactionFilter.vue';
import StatCard from '@/components/dashboard/StatCard.vue';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart.vue';
import ExpenseCategoryChart from '@/components/charts/ExpenseCategoryChart.vue';
import SpendingTrendChart from '@/components/charts/SpendingTrendChart.vue';
import CategoryBarChart from '@/components/charts/CategoryBarChart.vue';
import SavingsTrendChart from '@/components/charts/SavingsTrendChart.vue';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank
} from 'lucide-vue-next';

const transactionStore = useTransactionStore();
</script>

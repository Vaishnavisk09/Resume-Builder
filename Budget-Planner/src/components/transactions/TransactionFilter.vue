<template>
  <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3">
    <!-- Top Row: Search & Quick Type Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          v-model="transactionStore.searchQuery"
          type="text"
          placeholder="Search by title, description, or payment method..."
          class="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
        />
        <button
          v-if="transactionStore.searchQuery"
          @click="transactionStore.searchQuery = ''"
          class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Type Switcher (All / Income / Expense) -->
      <div class="flex items-center p-1 bg-slate-100 rounded-xl shrink-0">
        <button
          v-for="t in [
            { id: 'all', label: 'All' },
            { id: 'income', label: 'Income' },
            { id: 'expense', label: 'Expenses' }
          ]"
          :key="t.id"
          @click="transactionStore.typeFilter = t.id"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          :class="transactionStore.typeFilter === t.id
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Bottom Row: Period preset, Category & Custom Date Range -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
      <!-- Period Preset -->
      <div>
        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Date Period
        </label>
        <select
          v-model="transactionStore.periodFilter"
          class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
          <option
            v-for="p in PERIOD_FILTERS"
            :key="p.id"
            :value="p.id"
          >
            {{ p.label }}
          </option>
        </select>
      </div>

      <!-- Category Filter -->
      <div>
        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Category
        </label>
        <select
          v-model="transactionStore.categoryFilter"
          class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
          <option value="all">All Categories</option>
          <optgroup label="Income Categories">
            <option
              v-for="cat in INCOME_CATEGORIES"
              :key="'inc_' + cat.id"
              :value="cat.name"
            >
              {{ cat.name }}
            </option>
          </optgroup>
          <optgroup label="Expense Categories">
            <option
              v-for="cat in EXPENSE_CATEGORIES"
              :key="'exp_' + cat.id"
              :value="cat.name"
            >
              {{ cat.name }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- Custom Date Start (if Custom Range selected) -->
      <div v-if="transactionStore.periodFilter === 'custom'">
        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          From Date
        </label>
        <input
          v-model="transactionStore.customStartDate"
          type="date"
          class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
      </div>

      <!-- Custom Date End (if Custom Range selected) -->
      <div v-if="transactionStore.periodFilter === 'custom'">
        <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          To Date
        </label>
        <input
          v-model="transactionStore.customEndDate"
          type="date"
          class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
      </div>

      <!-- Reset Filters Button -->
      <div class="flex items-end" :class="transactionStore.periodFilter === 'custom' ? 'sm:col-span-2 lg:col-span-4' : 'sm:col-span-2 lg:col-span-2'">
        <button
          v-if="hasActiveFilters"
          @click="transactionStore.resetFilters()"
          class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center space-x-1.5"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { PERIOD_FILTERS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/utils/constants';
import { Search, X, RotateCcw } from 'lucide-vue-next';

const transactionStore = useTransactionStore();

const hasActiveFilters = computed(() => {
  return (
    transactionStore.periodFilter !== 'current_month' ||
    transactionStore.typeFilter !== 'all' ||
    transactionStore.categoryFilter !== 'all' ||
    transactionStore.searchQuery !== '' ||
    transactionStore.customStartDate !== '' ||
    transactionStore.customEndDate !== ''
  );
});
</script>

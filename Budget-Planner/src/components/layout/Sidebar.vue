<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isOpen"
      @click="emit('close')"
      class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
    ></div>

    <!-- Sidebar Container -->
    <aside
      class="fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 pt-16 flex flex-col justify-between"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Navigation Links -->
      <div class="px-3 py-6 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="emit('close')"
          class="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group"
          :class="isCurrentRoute(item.path)
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
        >
          <div class="flex items-center space-x-3">
            <component
              :is="item.icon"
              class="w-5 h-5 transition-transform group-hover:scale-110"
              :class="isCurrentRoute(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'"
            />
            <span>{{ item.label }}</span>
          </div>

          <!-- Badges for alerts or counts -->
          <span
            v-if="item.badge"
            class="px-2 py-0.5 rounded-full text-[10px] font-bold"
            :class="isCurrentRoute(item.path)
              ? 'bg-white/20 text-white'
              : item.badgeColor || 'bg-slate-100 text-slate-600'"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </div>

      <!-- Bottom Card: Quick Budget Warning / Summary -->
      <div class="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs uppercase tracking-wider text-slate-400 font-semibold">Monthly Budget</span>
          <span
            class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
            :class="budgetStore.hasExceededBudgets
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : budgetStore.hasWarningBudgets
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'"
          >
            {{ budgetStore.hasExceededBudgets ? 'Exceeded' : budgetStore.hasWarningBudgets ? '80% Used' : 'On Track' }}
          </span>
        </div>
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-semibold">
            <span class="text-slate-300">{{ formatCurrency(budgetStore.totalBudgetSpent) }}</span>
            <span class="text-slate-400">/ {{ formatCurrency(budgetStore.totalMonthlyBudget) }}</span>
          </div>
          <!-- Progress bar -->
          <div class="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="budgetStore.hasExceededBudgets
                ? 'bg-rose-500'
                : budgetStore.hasWarningBudgets
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'"
              :style="{ width: `${Math.min(100, budgetStore.totalBudgetPercentage)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useBudgetStore } from '@/stores/budgetStore';
import { formatCurrency } from '@/utils/currency';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  BarChart3,
  Settings
} from 'lucide-vue-next';

defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const route = useRoute();
const budgetStore = useBudgetStore();

function isCurrentRoute(path) {
  return route.path === path;
}

const navItems = computed(() => [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  {
    path: '/budgets',
    label: 'Budgets',
    icon: PieChart,
    badge: budgetStore.hasExceededBudgets ? 'Alert' : (budgetStore.hasWarningBudgets ? '80%' : null),
    badgeColor: budgetStore.hasExceededBudgets ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
  },
  { path: '/goals', label: 'Savings Goals', icon: Target },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings }
]);
</script>

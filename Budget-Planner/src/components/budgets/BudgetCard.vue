<template>
  <div
    class="bg-white rounded-2xl p-5 border shadow-sm transition-all relative overflow-hidden"
    :class="{
      'border-rose-300 ring-1 ring-rose-300/50 bg-rose-50/20': budget.status === 'exceeded',
      'border-amber-300 ring-1 ring-amber-300/40 bg-amber-50/20': budget.status === 'warning',
      'border-slate-200/80': budget.status === 'normal'
    }"
  >
    <!-- Card Header -->
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center space-x-2">
          <span
            class="w-3 h-3 rounded-full shrink-0"
            :style="{ backgroundColor: categoryColor }"
          ></span>
          <h4 class="font-bold text-slate-800 text-base leading-snug">{{ budget.category }}</h4>
        </div>
        <p v-if="budget.notes" class="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">
          {{ budget.notes }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center space-x-1">
        <button
          @click="emit('edit', budget)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Edit Budget"
        >
          <Pencil class="w-3.5 h-3.5" />
        </button>
        <button
          @click="emit('delete', budget)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          title="Delete Budget"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Spent & Limit Numbers -->
    <div class="mt-4 flex items-baseline justify-between">
      <div>
        <span class="text-xs text-slate-500 font-medium">Spent</span>
        <p
          class="text-xl font-extrabold"
          :class="{
            'text-rose-600': budget.status === 'exceeded',
            'text-amber-600': budget.status === 'warning',
            'text-slate-800': budget.status === 'normal'
          }"
        >
          {{ formatCurrency(budget.spentAmount) }}
        </p>
      </div>

      <div class="text-right">
        <span class="text-xs text-slate-400 font-medium">Limit</span>
        <p class="text-sm font-bold text-slate-600">
          {{ formatCurrency(budget.budgetAmount) }}
        </p>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mt-3">
      <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="{
            'bg-rose-500': budget.status === 'exceeded',
            'bg-amber-400': budget.status === 'warning',
            'bg-emerald-500': budget.status === 'normal'
          }"
          :style="{ width: `${Math.min(100, budget.percentage)}%` }"
        ></div>
      </div>
    </div>

    <!-- Footer Meta: Percentage & Status Badge -->
    <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <div class="flex items-center space-x-1.5">
        <span class="font-bold" :class="percentageTextColor">
          {{ budget.percentage }}%
        </span>
        <span class="text-slate-400">used</span>
      </div>

      <!-- Warning / Exceeded / Healthy Badges -->
      <div>
        <span
          v-if="budget.status === 'exceeded'"
          class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200"
        >
          <AlertCircle class="w-3 h-3" />
          <span>Exceeded (+{{ formatCurrency(Math.abs(budget.remainingAmount)) }})</span>
        </span>
        <span
          v-else-if="budget.status === 'warning'"
          class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200"
        >
          <AlertTriangle class="w-3 h-3" />
          <span>Warning ({{ formatCurrency(budget.remainingAmount) }} left)</span>
        </span>
        <span
          v-else
          class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200"
        >
          {{ formatCurrency(budget.remainingAmount) }} remaining
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatCurrency } from '@/utils/currency';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import { Pencil, Trash2, AlertTriangle, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  budget: { type: Object, required: true }
});

const emit = defineEmits(['edit', 'delete']);

const categoryColor = computed(() => {
  const cat = EXPENSE_CATEGORIES.find(c => c.name === props.budget.category);
  return cat ? cat.color : '#10b981';
});

const percentageTextColor = computed(() => {
  if (props.budget.status === 'exceeded') return 'text-rose-600';
  if (props.budget.status === 'warning') return 'text-amber-600';
  return 'text-emerald-600';
});
</script>

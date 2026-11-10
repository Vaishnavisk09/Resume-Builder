<template>
  <div
    class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group"
  >
    <!-- Background subtle gradient tint -->
    <div
      class="absolute -right-6 -bottom-6 w-28 h-28 rounded-full opacity-10 blur-xl pointer-events-none group-hover:opacity-20 transition-opacity"
      :class="accentBgColor"
    ></div>

    <div class="flex items-start justify-between">
      <div class="space-y-1">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ title }}</p>
        <h4 class="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
          {{ formattedAmount }}
        </h4>
      </div>

      <!-- Icon Box -->
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
        :class="iconBgClass"
      >
        <component :is="icon" class="w-6 h-6" :class="iconColorClass" />
      </div>
    </div>

    <!-- Subtitle / Meta / Badge -->
    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <span class="text-slate-500 font-medium">{{ subtitle }}</span>
      <span
        v-if="badgeText"
        class="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]"
        :class="badgeClass"
      >
        {{ badgeText }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatCurrency } from '@/utils/currency';

const props = defineProps({
  title: { type: String, required: true },
  amount: { type: [Number, String], required: true },
  icon: { type: Object, required: true },
  subtitle: { type: String, default: '' },
  badgeText: { type: String, default: '' },
  type: { type: String, default: 'neutral' } // 'income', 'expense', 'balance', 'savings', 'neutral'
});

const formattedAmount = computed(() => {
  return formatCurrency(props.amount);
});

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'income': return 'bg-emerald-100 text-emerald-600';
    case 'expense': return 'bg-rose-100 text-rose-600';
    case 'balance': return 'bg-blue-100 text-blue-600';
    case 'savings': return 'bg-violet-100 text-violet-600';
    default: return 'bg-slate-100 text-slate-600';
  }
});

const iconColorClass = computed(() => {
  switch (props.type) {
    case 'income': return 'text-emerald-600';
    case 'expense': return 'text-rose-600';
    case 'balance': return 'text-blue-600';
    case 'savings': return 'text-violet-600';
    default: return 'text-slate-600';
  }
});

const accentBgColor = computed(() => {
  switch (props.type) {
    case 'income': return 'bg-emerald-500';
    case 'expense': return 'bg-rose-500';
    case 'balance': return 'bg-blue-500';
    case 'savings': return 'bg-violet-500';
    default: return 'bg-slate-500';
  }
});

const badgeClass = computed(() => {
  switch (props.type) {
    case 'income': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'expense': return 'bg-rose-50 text-rose-700 border border-rose-200';
    case 'balance': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'savings': return 'bg-violet-50 text-violet-700 border border-violet-200';
    default: return 'bg-slate-100 text-slate-600';
  }
});
</script>

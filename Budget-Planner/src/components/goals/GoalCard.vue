<template>
  <div
    class="bg-white rounded-2xl p-5 border shadow-sm transition-all relative overflow-hidden group"
    :class="goal.isCompleted ? 'border-emerald-300 ring-1 ring-emerald-300/40 bg-emerald-50/20' : 'border-slate-200/80'"
  >
    <!-- Card Header -->
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center space-x-2">
          <span
            v-if="goal.isCompleted"
            class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"
          >
            <CheckCircle2 class="w-4 h-4" />
          </span>
          <span
            v-else
            class="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0"
          >
            <Target class="w-3.5 h-3.5" />
          </span>
          <h4 class="font-bold text-slate-800 text-base leading-snug">{{ goal.title }}</h4>
        </div>
        <p v-if="goal.category" class="text-xs text-slate-400 mt-0.5 ml-8">
          {{ goal.category }}
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center space-x-1">
        <button
          @click="emit('edit', goal)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Edit Goal"
        >
          <Pencil class="w-3.5 h-3.5" />
        </button>
        <button
          @click="emit('delete', goal)"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          title="Delete Goal"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Amount Numbers -->
    <div class="mt-4 flex items-baseline justify-between">
      <div>
        <span class="text-xs text-slate-500 font-medium">Saved</span>
        <p class="text-xl font-extrabold text-slate-800">
          {{ formatCurrency(goal.currentAmount) }}
        </p>
      </div>

      <div class="text-right">
        <span class="text-xs text-slate-400 font-medium">Target</span>
        <p class="text-sm font-bold text-slate-600">
          {{ formatCurrency(goal.targetAmount) }}
        </p>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mt-3">
      <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="goal.isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'"
          :style="{ width: `${goal.progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Meta row: Progress % & Target Date / Remaining -->
    <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <div class="flex items-center space-x-1.5">
        <span
          class="font-bold"
          :class="goal.isCompleted ? 'text-emerald-600' : 'text-slate-700'"
        >
          {{ goal.progressPercentage }}%
        </span>
        <span class="text-slate-400">completed</span>
      </div>

      <div>
        <span
          v-if="goal.isCompleted"
          class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200"
        >
          Goal Achieved!
        </span>
        <span v-else class="text-slate-500 font-medium">
          {{ formatCurrency(goal.remainingAmount) }} left
        </span>
      </div>
    </div>

    <!-- Deposit Quick Action Button -->
    <div class="mt-4">
      <button
        v-if="!goal.isCompleted"
        @click="emit('deposit', goal)"
        class="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200/80 transition flex items-center justify-center space-x-1.5"
      >
        <PlusCircle class="w-3.5 h-3.5" />
        <span>Add Savings / Deposit</span>
      </button>
      <div
        v-else
        class="w-full py-2 px-3 bg-slate-50 text-emerald-700 rounded-xl text-xs font-semibold text-center border border-slate-100"
      >
        🎉 Target Reached! Congratulations!
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/currency';
import { Target, Pencil, Trash2, CheckCircle2, PlusCircle } from 'lucide-vue-next';

defineProps({
  goal: { type: Object, required: true }
});

const emit = defineEmits(['edit', 'delete', 'deposit']);
</script>

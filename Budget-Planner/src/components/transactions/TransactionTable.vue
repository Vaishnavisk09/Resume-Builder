<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
    <!-- Empty State -->
    <div
      v-if="transactions.length === 0"
      class="py-16 px-4 text-center flex flex-col items-center justify-center"
    >
      <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Receipt class="w-8 h-8" />
      </div>
      <h5 class="text-base font-bold text-slate-800">No transactions found</h5>
      <p class="text-xs text-slate-500 max-w-sm mt-1">
        {{ emptyMessage || 'No financial records match your current filter criteria or none have been added yet.' }}
      </p>
      <button
        v-if="showAddButton"
        @click="emit('create')"
        class="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Add Transaction</span>
      </button>
    </div>

    <!-- Desktop Table View -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th class="py-3 px-4 sm:px-6">Transaction</th>
            <th class="py-3 px-4">Category</th>
            <th class="py-3 px-4">Date</th>
            <th class="py-3 px-4">Payment Method</th>
            <th class="py-3 px-4 text-right">Amount</th>
            <th class="py-3 px-4 sm:px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
          <tr
            v-for="tx in transactions"
            :key="tx.id"
            class="hover:bg-slate-50/80 transition-colors group"
          >
            <!-- Title & Description -->
            <td class="py-3.5 px-4 sm:px-6">
              <div class="flex items-center space-x-3">
                <div
                  class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  :class="tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'"
                >
                  <ArrowDownLeft v-if="tx.type === 'income'" class="w-4 h-4" />
                  <ArrowUpRight v-else class="w-4 h-4" />
                </div>
                <div>
                  <p class="font-semibold text-slate-800 leading-snug">{{ tx.title }}</p>
                  <p v-if="tx.description" class="text-xs text-slate-400 truncate max-w-xs">{{ tx.description }}</p>
                </div>
              </div>
            </td>

            <!-- Category -->
            <td class="py-3.5 px-4">
              <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                {{ tx.category }}
              </span>
            </td>

            <!-- Date -->
            <td class="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
              {{ formatDisplayDate(tx.date) }}
            </td>

            <!-- Payment Method -->
            <td class="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
              {{ tx.paymentMethod || 'UPI / Cash' }}
            </td>

            <!-- Amount -->
            <td class="py-3.5 px-4 text-right whitespace-nowrap">
              <span
                class="font-bold text-sm"
                :class="tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'"
              >
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
              <div class="flex items-center justify-end space-x-1.5">
                <button
                  type="button"
                  @click="emit('edit', tx)"
                  class="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                  title="Edit Transaction"
                  aria-label="Edit transaction"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  @click="emit('delete', tx)"
                  class="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                  title="Delete Transaction"
                  aria-label="Delete transaction"
                  data-test="delete-transaction-btn"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/currency';
import { formatDisplayDate } from '@/utils/dateUtils';
import {
  Receipt,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Trash2
} from 'lucide-vue-next';

defineProps({
  transactions: { type: Array, default: () => [] },
  emptyMessage: { type: String, default: '' },
  showAddButton: { type: Boolean, default: true }
});

const emit = defineEmits(['edit', 'delete', 'create']);
</script>

<template>
  <Modal
    :is-open="isOpen"
    title="Deposit to Savings Goal"
    :subtitle="goal ? `Add funds toward '${goal.title}'` : 'Add savings'"
    max-width="sm"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div v-if="goal" class="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
        <div>
          <span class="text-slate-500 font-medium">Current Saved:</span>
          <p class="font-bold text-slate-800 text-sm">{{ formatCurrency(goal.currentAmount) }}</p>
        </div>
        <div class="text-right">
          <span class="text-slate-500 font-medium">Target:</span>
          <p class="font-bold text-emerald-700 text-sm">{{ formatCurrency(goal.targetAmount) }}</p>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Deposit Amount (₹) <span class="text-rose-500">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
          <input
            v-model="depositAmount"
            type="number"
            step="any"
            min="1"
            placeholder="e.g. 5000"
            class="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            :class="{ 'border-rose-400 ring-1 ring-rose-400': errorMsg }"
            required
            autofocus
          />
        </div>
        <p v-if="errorMsg" class="text-xs text-rose-500 mt-1">{{ errorMsg }}</p>
      </div>

      <!-- Quick amount chips -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="amt in [500, 1000, 2000, 5000, 10000]"
          :key="amt"
          type="button"
          @click="depositAmount = amt"
          class="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-xs font-medium text-slate-700 transition"
        >
          +₹{{ amt.toLocaleString('en-IN') }}
        </button>
      </div>

      <div class="pt-3 flex justify-end space-x-3">
        <button
          type="button"
          @click="handleClose"
          :disabled="isSubmitting"
          class="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition flex items-center space-x-2 disabled:opacity-50"
        >
          <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>Deposit Funds</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref } from 'vue';
import Modal from '@/components/common/Modal.vue';
import { formatCurrency } from '@/utils/currency';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  goal: { type: Object, default: null }
});

const emit = defineEmits(['close', 'deposit']);

const depositAmount = ref('');
const errorMsg = ref('');
const isSubmitting = ref(false);

function handleClose() {
  depositAmount.value = '';
  errorMsg.value = '';
  emit('close');
}

async function handleSubmit() {
  const amt = Number(depositAmount.value);
  if (isNaN(amt) || amt <= 0) {
    errorMsg.value = 'Please enter a valid deposit amount greater than zero';
    return;
  }

  isSubmitting.value = true;
  try {
    await emit('deposit', {
      goalId: props.goal.id,
      amount: amt
    });
    handleClose();
  } catch (err) {
    errorMsg.value = err.message || 'Deposit failed';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

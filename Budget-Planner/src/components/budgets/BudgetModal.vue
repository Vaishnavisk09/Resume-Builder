<template>
  <Modal
    :is-open="isOpen"
    :title="isEditing ? 'Edit Category Budget' : 'Set Category Budget'"
    :subtitle="isEditing ? 'Adjust monthly spending limit' : 'Allocate monthly budget to monitor expenses'"
    max-width="md"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Category Selection -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Expense Category <span class="text-rose-500">*</span>
        </label>
        <select
          v-model="formData.category"
          class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          :class="{ 'border-rose-400 ring-1 ring-rose-400': errors.category }"
          required
        >
          <option disabled value="">Select Expense Category</option>
          <option
            v-for="cat in EXPENSE_CATEGORIES"
            :key="cat.id"
            :value="cat.name"
          >
            {{ cat.name }}
          </option>
        </select>
        <p v-if="errors.category" class="text-xs text-rose-500 mt-1">{{ errors.category }}</p>
      </div>

      <!-- Monthly Budget Amount -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Monthly Limit (₹) <span class="text-rose-500">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
          <input
            v-model="formData.amount"
            type="number"
            step="any"
            min="1"
            placeholder="e.g. 10000"
            class="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            :class="{ 'border-rose-400 ring-1 ring-rose-400': errors.amount }"
            required
          />
        </div>
        <p v-if="errors.amount" class="text-xs text-rose-500 mt-1">{{ errors.amount }}</p>
      </div>

      <!-- Notes / Target Description -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Notes / Purpose (Optional)
        </label>
        <input
          v-model="formData.notes"
          type="text"
          placeholder="e.g. Monthly grocery cap, dining out limit"
          class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
        />
      </div>

      <div class="pt-3 flex justify-end space-x-3">
        <button
          type="button"
          @click="handleClose"
          :disabled="isSubmitting"
          class="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition flex items-center space-x-2 disabled:opacity-50"
        >
          <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isEditing ? 'Update Budget' : 'Save Budget' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Modal from '@/components/common/Modal.vue';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import { validateBudget } from '@/utils/validators';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  budget: { type: Object, default: null }
});

const emit = defineEmits(['close', 'save']);

const isSubmitting = ref(false);
const errors = ref({});

const formData = ref({
  category: EXPENSE_CATEGORIES[0]?.name || '',
  amount: '',
  period: 'monthly',
  notes: ''
});

const isEditing = computed(() => !!props.budget && !!props.budget.id);

watch(
  () => props.budget,
  (newVal) => {
    if (newVal) {
      formData.value = {
        category: newVal.category || EXPENSE_CATEGORIES[0]?.name || '',
        amount: newVal.amount !== undefined ? newVal.amount : '',
        period: newVal.period || 'monthly',
        notes: newVal.notes || ''
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  formData.value = {
    category: EXPENSE_CATEGORIES[0]?.name || '',
    amount: '',
    period: 'monthly',
    notes: ''
  };
  errors.value = {};
}

function handleClose() {
  resetForm();
  emit('close');
}

async function handleSubmit() {
  errors.value = {};
  const validation = validateBudget(formData.value);
  if (!validation.isValid) {
    errors.value = validation.errors;
    return;
  }

  isSubmitting.value = true;
  try {
    await emit('save', {
      ...formData.value,
      id: props.budget?.id
    });
    handleClose();
  } catch (err) {
    // Handled by parent
  } finally {
    isSubmitting.value = false;
  }
}
</script>

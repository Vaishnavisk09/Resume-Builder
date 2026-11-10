<template>
  <Modal
    :is-open="isOpen"
    :title="isEditing ? 'Edit Transaction' : 'Add New Transaction'"
    :subtitle="isEditing ? 'Modify financial record details' : 'Record an income or expense transaction'"
    max-width="lg"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- General Form Error Notice -->
      <div
        v-if="errors.general"
        class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2"
      >
        <span class="w-2 h-2 rounded-full bg-rose-500"></span>
        <span>{{ errors.general }}</span>
      </div>

      <!-- Type Switcher (Income vs Expense) -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Transaction Type <span class="text-rose-500">*</span>
        </label>
        <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            @click="setType('income')"
            class="py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 transition-all"
            :class="formData.type === 'income'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'"
          >
            <ArrowDownLeft class="w-4 h-4" />
            <span>Income</span>
          </button>
          <button
            type="button"
            @click="setType('expense')"
            class="py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 transition-all"
            :class="formData.type === 'expense'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'"
          >
            <ArrowUpRight class="w-4 h-4" />
            <span>Expense</span>
          </button>
        </div>
      </div>

      <!-- Title -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Title / Description <span class="text-rose-500">*</span>
        </label>
        <input
          v-model="formData.title"
          type="text"
          placeholder="e.g. Monthly Salary, Grocery Shopping"
          class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          :class="{ 'border-rose-400 ring-1 ring-rose-400': errors.title }"
          maxlength="120"
          required
        />
        <p v-if="errors.title" class="text-xs text-rose-500 mt-1">{{ errors.title }}</p>
      </div>

      <!-- Amount & Date Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Amount -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Amount (₹) <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
            <input
              v-model="formData.amount"
              type="number"
              step="any"
              min="0.01"
              placeholder="0.00"
              class="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              :class="{ 'border-rose-400 ring-1 ring-rose-400': errors.amount }"
              required
            />
          </div>
          <p v-if="errors.amount" class="text-xs text-rose-500 mt-1">{{ errors.amount }}</p>
        </div>

        <!-- Date -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Date <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="formData.date"
            type="date"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            :class="{ 'border-rose-400 ring-1 ring-rose-400': errors.date }"
            required
          />
          <p v-if="errors.date" class="text-xs text-rose-500 mt-1">{{ errors.date }}</p>
        </div>
      </div>

      <!-- Category & Payment Method Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Category -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Category <span class="text-rose-500">*</span>
          </label>
          <select
            v-model="formData.category"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            :class="{ 'border-rose-400 ring-1 ring-rose-400': errors.category }"
            required
          >
            <option disabled value="">Select Category</option>
            <option
              v-for="cat in availableCategories"
              :key="cat.id"
              :value="cat.name"
            >
              {{ cat.name }}
            </option>
          </select>
          <p v-if="errors.category" class="text-xs text-rose-500 mt-1">{{ errors.category }}</p>
        </div>

        <!-- Payment Method -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Payment Method
          </label>
          <select
            v-model="formData.paymentMethod"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            <option
              v-for="method in PAYMENT_METHODS"
              :key="method"
              :value="method"
            >
              {{ method }}
            </option>
          </select>
        </div>
      </div>

      <!-- Additional Notes / Description -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Notes / Remarks (Optional)
        </label>
        <textarea
          v-model="formData.description"
          rows="2"
          placeholder="Add tags, bill numbers, or context..."
          class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
        ></textarea>
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
          class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition flex items-center space-x-2 disabled:opacity-50 shadow-md"
          :class="formData.type === 'income'
            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
            : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'"
        >
          <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isEditing ? 'Save Changes' : 'Record Transaction' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Modal from '@/components/common/Modal.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useNotificationStore } from '@/stores/notificationStore';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS
} from '@/utils/constants';
import { toInputDateFormat } from '@/utils/dateUtils';
import { validateTransaction } from '@/utils/validators';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  transaction: { type: Object, default: null }
});

const emit = defineEmits(['close', 'save', 'saved']);

const transactionStore = useTransactionStore();
const notificationStore = useNotificationStore();

const isSubmitting = ref(false);
const errors = ref({});

const formData = ref({
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  date: toInputDateFormat(new Date()),
  paymentMethod: PAYMENT_METHODS[0],
  description: ''
});

const isEditing = computed(() => !!props.transaction && !!props.transaction.id);

const availableCategories = computed(() => {
  return formData.value.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
});

function setType(type) {
  formData.value.type = type;
  // If switching types, select first category of that type
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  formData.value.category = list[0]?.name || '';
}

watch(
  () => [props.transaction, props.isOpen],
  ([newTx, isOpen]) => {
    if (isOpen) {
      if (newTx && newTx.id) {
        // Editing existing transaction
        formData.value = {
          title: newTx.title || '',
          amount: newTx.amount !== undefined ? newTx.amount : '',
          type: newTx.type || 'expense',
          category: newTx.category || '',
          date: newTx.date ? toInputDateFormat(newTx.date) : toInputDateFormat(new Date()),
          paymentMethod: newTx.paymentMethod || PAYMENT_METHODS[0],
          description: newTx.description || ''
        };
      } else {
        // Creating new transaction
        const initialType = newTx?.type || 'expense';
        const defaultCat = initialType === 'income' ? INCOME_CATEGORIES[0]?.name : EXPENSE_CATEGORIES[0]?.name;
        formData.value = {
          title: '',
          amount: '',
          type: initialType,
          category: newTx?.category || defaultCat || '',
          date: toInputDateFormat(new Date()),
          paymentMethod: PAYMENT_METHODS[0],
          description: ''
        };
      }
      errors.value = {};
    }
  },
  { immediate: true }
);

function resetForm() {
  const initialType = props.transaction?.type || 'expense';
  const defaultCat = initialType === 'income' ? INCOME_CATEGORIES[0]?.name : EXPENSE_CATEGORIES[0]?.name;
  formData.value = {
    title: '',
    amount: '',
    type: initialType,
    category: defaultCat || '',
    date: toInputDateFormat(new Date()),
    paymentMethod: PAYMENT_METHODS[0],
    description: ''
  };
  errors.value = {};
}

function handleClose() {
  resetForm();
  emit('close');
}

async function handleSubmit() {
  errors.value = {};
  const validation = validateTransaction(formData.value);
  if (!validation.isValid) {
    errors.value = validation.errors;
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      ...formData.value,
      amount: Number(formData.value.amount),
      id: props.transaction?.id
    };

    if (props.transaction?.id) {
      await transactionStore.editTransaction(props.transaction.id, payload);
      notificationStore.success('Transaction updated successfully.');
    } else {
      await transactionStore.addTransaction(payload);
      notificationStore.success(
        `${payload.type === 'income' ? 'Income' : 'Expense'} of ₹${Number(payload.amount).toLocaleString('en-IN')} added successfully.`
      );
    }

    emit('save', payload);
    emit('saved', payload);
    handleClose();
  } catch (err) {
    errors.value.general = err.message || 'Failed to save transaction';
    notificationStore.error(err.message || 'Failed to save transaction');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Modal
    :is-open="isOpen"
    :title="isEditing ? 'Edit Savings Goal' : 'Create Savings Goal'"
    :subtitle="isEditing ? 'Update target amount or progress' : 'Set a target to build your wealth'"
    max-width="md"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Title -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Goal Title <span class="text-rose-500">*</span>
        </label>
        <input
          v-model="formData.title"
          type="text"
          placeholder="e.g. Emergency Fund, New Laptop, Vacation"
          class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          :class="{ 'border-rose-400 ring-1 ring-rose-400': errors.title }"
          required
        />
        <p v-if="errors.title" class="text-xs text-rose-500 mt-1">{{ errors.title }}</p>
      </div>

      <!-- Target Amount & Current Amount Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Target Amount -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Target Amount (₹) <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
            <input
              v-model="formData.targetAmount"
              type="number"
              step="any"
              min="1"
              placeholder="50000"
              class="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              :class="{ 'border-rose-400 ring-1 ring-rose-400': errors.targetAmount }"
              required
            />
          </div>
          <p v-if="errors.targetAmount" class="text-xs text-rose-500 mt-1">{{ errors.targetAmount }}</p>
        </div>

        <!-- Current Savings -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Initial Saved (₹)
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
            <input
              v-model="formData.currentAmount"
              type="number"
              step="any"
              min="0"
              placeholder="0"
              class="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              :class="{ 'border-rose-400 ring-1 ring-rose-400': errors.currentAmount }"
            />
          </div>
          <p v-if="errors.currentAmount" class="text-xs text-rose-500 mt-1">{{ errors.currentAmount }}</p>
        </div>
      </div>

      <!-- Target Date & Category Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Target Date -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Target Date (Optional)
          </label>
          <input
            v-model="formData.targetDate"
            type="date"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <!-- Category -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Category
          </label>
          <select
            v-model="formData.category"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          >
            <option value="Emergency Fund">Emergency Fund</option>
            <option value="Retirement">Retirement</option>
            <option value="Vehicle / Car">Vehicle / Car</option>
            <option value="Home / Real Estate">Home / Real Estate</option>
            <option value="Gadgets & Electronics">Gadgets & Electronics</option>
            <option value="Travel & Vacation">Travel & Vacation</option>
            <option value="Education">Education</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
          Notes (Optional)
        </label>
        <textarea
          v-model="formData.description"
          rows="2"
          placeholder="Why are you saving for this?"
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
          class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition flex items-center space-x-2 disabled:opacity-50"
        >
          <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isEditing ? 'Save Changes' : 'Create Goal' }}</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import Modal from '@/components/common/Modal.vue';
import { validateGoal } from '@/utils/validators';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  goal: { type: Object, default: null }
});

const emit = defineEmits(['close', 'save']);

const isSubmitting = ref(false);
const errors = ref({});

const formData = ref({
  title: '',
  targetAmount: '',
  currentAmount: 0,
  targetDate: '',
  category: 'General',
  description: ''
});

const isEditing = computed(() => !!props.goal && !!props.goal.id);

watch(
  () => props.goal,
  (newVal) => {
    if (newVal) {
      formData.value = {
        title: newVal.title || '',
        targetAmount: newVal.targetAmount !== undefined ? newVal.targetAmount : '',
        currentAmount: newVal.currentAmount !== undefined ? newVal.currentAmount : 0,
        targetDate: newVal.targetDate || '',
        category: newVal.category || 'General',
        description: newVal.description || ''
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  formData.value = {
    title: '',
    targetAmount: '',
    currentAmount: 0,
    targetDate: '',
    category: 'General',
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
  const validation = validateGoal(formData.value);
  if (!validation.isValid) {
    errors.value = validation.errors;
    return;
  }

  isSubmitting.value = true;
  try {
    await emit('save', {
      ...formData.value,
      id: props.goal?.id
    });
    handleClose();
  } catch (err) {
    // Handled by parent
  } finally {
    isSubmitting.value = false;
  }
}
</script>

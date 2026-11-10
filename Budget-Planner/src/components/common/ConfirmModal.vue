<template>
  <Modal
    :is-open="isOpen"
    :title="title"
    max-width="sm"
    @close="emit('cancel')"
  >
    <div class="flex items-start space-x-3 pt-1">
      <div class="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
        <AlertTriangle class="w-5 h-5" />
      </div>
      <div>
        <p class="text-sm text-slate-600 leading-relaxed">{{ message }}</p>
        <p v-if="warning" class="text-xs text-rose-500 font-medium mt-2">{{ warning }}</p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="emit('cancel')"
        :disabled="isLoading"
        class="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        @click="emit('confirm')"
        :disabled="isLoading"
        class="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition disabled:opacity-50 flex items-center space-x-2"
      >
        <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>{{ confirmText }}</span>
      </button>
    </template>
  </Modal>
</template>

<script setup>
import Modal from './Modal.vue';
import { AlertTriangle } from 'lucide-vue-next';

defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, default: 'Are you sure you want to perform this action? This cannot be undone.' },
  warning: { type: String, default: '' },
  confirmText: { type: String, default: 'Delete' },
  isLoading: { type: Boolean, default: false }
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

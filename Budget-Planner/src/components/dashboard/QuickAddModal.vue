<template>
  <TransactionModal
    :is-open="isOpen"
    @close="emit('close')"
    @saved="emit('close')"
  />
</template>

<script setup>
import TransactionModal from '@/components/transactions/TransactionModal.vue';

defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);
</script>

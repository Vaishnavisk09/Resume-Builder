<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
    <transition-group
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in notificationStore.notifications"
        :key="toast.id"
        class="pointer-events-auto rounded-xl p-4 shadow-xl border flex items-start space-x-3 text-sm transition-all"
        :class="{
          'bg-emerald-50 border-emerald-200 text-emerald-900': toast.type === 'success',
          'bg-rose-50 border-rose-200 text-rose-900': toast.type === 'error',
          'bg-amber-50 border-amber-200 text-amber-900': toast.type === 'warning',
          'bg-blue-50 border-blue-200 text-blue-900': toast.type === 'info'
        }"
      >
        <!-- Icon -->
        <div class="shrink-0 pt-0.5">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600" />
          <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-600" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-600" />
          <Info v-else class="w-5 h-5 text-blue-600" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-xs tracking-wide uppercase opacity-80">{{ toast.title }}</p>
          <p class="mt-0.5 text-sm font-medium leading-relaxed">{{ toast.message }}</p>
        </div>

        <!-- Close button -->
        <button
          @click="notificationStore.removeNotification(toast.id)"
          class="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notificationStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

const notificationStore = useNotificationStore();
</script>

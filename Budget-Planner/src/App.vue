<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
    <!-- Initial Full-Screen Auth Loading State -->
    <div
      v-if="!authStore.isInitialized"
      class="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center space-y-4"
    >
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg animate-pulse">
        <Wallet class="w-6 h-6" />
      </div>
      <div class="flex items-center space-x-2 text-slate-500 text-sm font-semibold">
        <span class="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
        <span>Initializing Finora...</span>
      </div>
    </div>

    <!-- Authenticated App Shell -->
    <div v-else-if="authStore.isAuthenticated" class="min-h-screen flex flex-col">
      <!-- Firebase Notice Banner if unconfigured -->
      <FirebaseNotice />

      <!-- Top Navbar -->
      <Navbar
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
        @open-quick-add="isQuickAddOpen = true"
      />

      <div class="flex-1 flex">
        <!-- Sidebar Navigation -->
        <Sidebar
          :is-open="isSidebarOpen"
          @close="isSidebarOpen = false"
        />

        <!-- Main Workspace -->
        <main class="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all">
          <div class="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
            <router-view :key="$route.fullPath" />
          </div>
        </main>
      </div>

      <!-- Quick Add Transaction Modal -->
      <QuickAddModal
        :is-open="isQuickAddOpen"
        @close="isQuickAddOpen = false"
      />
    </div>

    <!-- Guest / Public Routes (Login, Register, Forgot Password) -->
    <div v-else class="min-h-screen flex flex-col">
      <FirebaseNotice />
      <router-view />
    </div>

    <!-- Global Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useGoalStore } from '@/stores/goalStore';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import ToastContainer from '@/components/layout/ToastContainer.vue';
import FirebaseNotice from '@/components/layout/FirebaseNotice.vue';
import QuickAddModal from '@/components/dashboard/QuickAddModal.vue';
import { Wallet } from 'lucide-vue-next';

const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const budgetStore = useBudgetStore();
const goalStore = useGoalStore();

const isSidebarOpen = ref(false);
const isQuickAddOpen = ref(false);

/**
 * Load user data from Firestore whenever an authenticated user session is active
 */
async function loadUserData() {
  if (authStore.isAuthenticated && authStore.userUid) {
    try {
      await Promise.all([
        transactionStore.loadTransactions(),
        budgetStore.loadBudgets(),
        goalStore.loadGoals()
      ]);
    } catch (err) {
      console.error('Error loading user financial data:', err);
    }
  }
}

watch(
  () => authStore.userUid,
  (newUid) => {
    if (newUid) {
      loadUserData();
    } else {
      transactionStore.clearState();
      budgetStore.clearState();
      goalStore.clearState();
    }
  }
);

onMounted(async () => {
  await authStore.initAuth();
  if (authStore.isAuthenticated) {
    loadUserData();
  }
});
</script>

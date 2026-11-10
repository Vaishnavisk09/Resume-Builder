<template>
  <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left: Mobile Menu Toggle & Brand -->
        <div class="flex items-center space-x-3">
          <button
            @click="emit('toggleSidebar')"
            class="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            aria-label="Toggle Navigation"
          >
            <Menu class="w-6 h-6" />
          </button>

          <router-link to="/dashboard" class="flex items-center space-x-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet class="w-5 h-5" />
            </div>
            <div>
              <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                Finora
              </span>
              <span class="hidden sm:inline-block ml-1 text-[10px] font-semibold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                PRO
              </span>
            </div>
          </router-link>
        </div>

        <!-- Center: System Status Pill -->
        <div class="hidden md:flex items-center space-x-2 text-xs font-medium">
          <div
            class="flex items-center space-x-1.5 px-3 py-1 rounded-full border"
            :class="isFirebaseConfigured
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'"
          >
            <span
              class="w-2 h-2 rounded-full animate-pulse"
              :class="isFirebaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'"
            ></span>
            <span>{{ isFirebaseConfigured ? 'Cloud Firestore Online' : 'Local Sandbox Mode' }}</span>
          </div>
        </div>

        <!-- Right: Actions & User Dropdown -->
        <div class="flex items-center space-x-3">
          <!-- Quick Add Button -->
          <button
            id="navbar-new-entry-btn"
            @click="emit('openQuickAdd')"
            class="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/20 transition active:scale-95"
            title="Create a new income or expense transaction"
          >
            <PlusCircle class="w-4 h-4" />
            <span>New Entry</span>
          </button>

          <!-- User Profile Dropdown -->
          <div class="relative" ref="dropdownRef">
            <button
              @click="isDropdownOpen = !isDropdownOpen"
              class="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            >
              <div class="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {{ userInitials }}
              </div>
              <div class="hidden md:block text-left pr-1">
                <p class="text-xs font-semibold text-slate-800 leading-tight max-w-[120px] truncate">
                  {{ authStore.userDisplayName }}
                </p>
                <p class="text-[10px] text-slate-400 leading-tight max-w-[120px] truncate">
                  {{ authStore.userEmail }}
                </p>
              </div>
              <ChevronDown class="w-4 h-4 text-slate-400" />
            </button>

            <!-- Dropdown Menu -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="isDropdownOpen"
                class="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-100 py-1.5 z-50 divide-y divide-slate-100"
              >
                <div class="px-4 py-2.5">
                  <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Signed in as</p>
                  <p class="text-sm font-bold text-slate-800 truncate mt-0.5">{{ authStore.userDisplayName }}</p>
                  <p class="text-xs text-slate-500 truncate">{{ authStore.userEmail }}</p>
                </div>

                <div class="py-1">
                  <router-link
                    to="/settings"
                    @click="isDropdownOpen = false"
                    class="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Settings class="w-4 h-4 text-slate-400" />
                    <span>Preferences & Security</span>
                  </router-link>
                  <router-link
                    to="/analytics"
                    @click="isDropdownOpen = false"
                    class="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <BarChart3 class="w-4 h-4 text-slate-400" />
                    <span>Reports & Analytics</span>
                  </router-link>
                </div>

                <div class="py-1">
                  <button
                    @click="handleLogout"
                    class="w-full flex items-center space-x-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                  >
                    <LogOut class="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useGoalStore } from '@/stores/goalStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { isFirebaseConfigured } from '@/config/firebase';
import {
  Wallet,
  Menu,
  PlusCircle,
  ChevronDown,
  Settings,
  BarChart3,
  LogOut
} from 'lucide-vue-next';

const emit = defineEmits(['toggleSidebar', 'openQuickAdd']);

const router = useRouter();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const budgetStore = useBudgetStore();
const goalStore = useGoalStore();
const notificationStore = useNotificationStore();

const isDropdownOpen = ref(false);
const dropdownRef = ref(null);

const userInitials = computed(() => {
  const name = authStore.userDisplayName || 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

async function handleLogout() {
  isDropdownOpen.value = false;
  try {
    await authStore.logout();
    // Clear stores to prevent state leaks
    transactionStore.clearState();
    budgetStore.clearState();
    goalStore.clearState();
    notificationStore.info('You have logged out successfully.');
    router.push('/login');
  } catch (err) {
    notificationStore.error(err.message || 'Logout failed');
  }
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

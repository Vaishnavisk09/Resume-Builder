<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <!-- Finora Logo -->
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-4">
        <Wallet class="w-6 h-6" />
      </div>
      <h2 class="text-3xl font-extrabold tracking-tight text-slate-900">
        Create Finora Account
      </h2>
      <p class="mt-2 text-xs sm:text-sm text-slate-500">
        Smart Personal Finance & Budget Planner
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div class="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs sm:text-sm text-rose-800"
        >
          <AlertCircle class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span class="leading-relaxed">{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Full Name -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Full Name <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-3 text-slate-400">
                <User class="w-4 h-4" />
              </span>
              <input
                v-model="name"
                type="text"
                autocomplete="name"
                placeholder="Vaishnavi Kadam"
                class="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                :class="{ 'border-rose-400 ring-1 ring-rose-400': fieldErrors.name }"
                required
              />
            </div>
            <p v-if="fieldErrors.name" class="text-xs text-rose-500 mt-1">{{ fieldErrors.name }}</p>
          </div>

          <!-- Email Address -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Address <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-3 text-slate-400">
                <Mail class="w-4 h-4" />
              </span>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="name@example.com"
                class="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                :class="{ 'border-rose-400 ring-1 ring-rose-400': fieldErrors.email }"
                required
              />
            </div>
            <p v-if="fieldErrors.email" class="text-xs text-rose-500 mt-1">{{ fieldErrors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Password <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-3 text-slate-400">
                <Lock class="w-4 h-4" />
              </span>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="At least 6 characters"
                class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                :class="{ 'border-rose-400 ring-1 ring-rose-400': fieldErrors.password }"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="fieldErrors.password" class="text-xs text-rose-500 mt-1">{{ fieldErrors.password }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Confirm Password <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-3 text-slate-400">
                <Lock class="w-4 h-4" />
              </span>
              <input
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Re-enter your password"
                class="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                :class="{ 'border-rose-400 ring-1 ring-rose-400': fieldErrors.confirmPassword }"
                required
              />
            </div>
            <p v-if="fieldErrors.confirmPassword" class="text-xs text-rose-500 mt-1">{{ fieldErrors.confirmPassword }}</p>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isLoading ? 'Creating Account...' : 'Get Started with Finora' }}</span>
            </button>
          </div>
        </form>

        <div class="mt-6 pt-5 border-t border-slate-100 text-center">
          <p class="text-xs text-slate-500">
            Already have an account?
            <router-link to="/login" class="font-bold text-emerald-600 hover:text-emerald-700 ml-1">
              Sign in &rarr;
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { validateRegistration } from '@/utils/validators';
import { Wallet, User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const fieldErrors = ref({});

async function handleRegister() {
  errorMessage.value = '';
  fieldErrors.value = {};

  const validation = validateRegistration({
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value
  });

  if (!validation.isValid) {
    fieldErrors.value = validation.errors;
    return;
  }

  isLoading.value = true;
  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value
    });
    notificationStore.success('Account created successfully! Welcome to Finora.');
    router.push('/dashboard');
  } catch (err) {
    errorMessage.value = err.message || 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

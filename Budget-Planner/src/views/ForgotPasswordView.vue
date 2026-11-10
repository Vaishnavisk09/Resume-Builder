<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <!-- Finora Logo -->
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-4">
        <Wallet class="w-6 h-6" />
      </div>
      <h2 class="text-3xl font-extrabold tracking-tight text-slate-900">
        Reset Password
      </h2>
      <p class="mt-2 text-xs sm:text-sm text-slate-500">
        Enter your registered email and we'll send you a password reset link
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div class="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
        <!-- Success Alert -->
        <div
          v-if="isSuccess"
          class="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 space-y-2"
        >
          <div class="flex items-center space-x-2 font-bold">
            <CheckCircle2 class="w-5 h-5 text-emerald-600" />
            <span>Reset Link Sent!</span>
          </div>
          <p class="leading-relaxed">
            We have sent password reset instructions to <strong>{{ email }}</strong>. Please check your inbox (and spam folder) to set a new password.
          </p>
        </div>

        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs sm:text-sm text-rose-800"
        >
          <AlertCircle class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span class="leading-relaxed">{{ errorMessage }}</span>
        </div>

        <form v-if="!isSuccess" @submit.prevent="handleReset" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Registered Email <span class="text-rose-500">*</span>
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
                required
              />
            </div>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isLoading ? 'Sending Instructions...' : 'Send Reset Link' }}</span>
            </button>
          </div>
        </form>

        <div class="mt-6 pt-5 border-t border-slate-100 text-center">
          <router-link
            to="/login"
            class="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { validateEmail } from '@/utils/validators';
import { Wallet, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-vue-next';

const authStore = useAuthStore();

const email = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);
const errorMessage = ref('');

async function handleReset() {
  errorMessage.value = '';
  const emailErr = validateEmail(email.value);
  if (emailErr) {
    errorMessage.value = emailErr;
    return;
  }

  isLoading.value = true;
  try {
    await authStore.resetPassword(email.value);
    isSuccess.value = true;
  } catch (err) {
    errorMessage.value = err.message || 'Failed to send reset email. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

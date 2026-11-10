<template>
  <div class="space-y-6 max-w-4xl pb-12">
    <!-- Header -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Settings & Preferences
      </h1>
      <p class="text-xs sm:text-sm text-slate-500 mt-1">
        Manage your personal profile, regional preferences, and security connection
      </p>
    </div>

    <!-- User Profile Card -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
      <div class="flex items-center space-x-3 pb-3 border-b border-slate-100">
        <div class="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
          <User class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-800">Account Profile</h3>
          <p class="text-xs text-slate-400">Authenticated user details</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Display Name
          </label>
          <div class="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">
            {{ authStore.userDisplayName }}
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Email Address
          </label>
          <div class="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">
            {{ authStore.userEmail }}
          </div>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            User Unique ID (UID)
          </label>
          <div class="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono text-xs break-all">
            {{ authStore.userUid }}
          </div>
          <p class="text-[11px] text-slate-400 mt-1">
            Used by Firestore Security Rules to enforce strict document isolation (users/{uid}/*)
          </p>
        </div>
      </div>
    </div>

    <!-- Regional & Currency Preferences -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
      <div class="flex items-center space-x-3 pb-3 border-b border-slate-100">
        <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
          <Coins class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-800">Currency & Regional Settings</h3>
          <p class="text-xs text-slate-400">Formatting options for amounts and reports</p>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Default Currency
          </label>
          <div class="flex items-center space-x-3">
            <span class="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-sm">
              ₹ Indian Rupee (INR)
            </span>
            <span class="text-xs text-slate-500">
              Set as standard across all reports and charts.
            </span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Budget Warning Threshold
          </label>
          <div class="flex items-center space-x-3">
            <span class="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg font-bold text-xs">
              80% of category limit
            </span>
            <span class="text-xs text-slate-500">
              Triggers visual warning badges when spending approaches limit.
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Firebase Connection Diagnostics -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
            :class="isFirebaseConfigured ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'"
          >
            <ShieldCheck v-if="isFirebaseConfigured" class="w-5 h-5" />
            <ShieldAlert v-else class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800">Firebase Infrastructure Status</h3>
            <p class="text-xs text-slate-400">Authentication & Cloud Firestore connectivity</p>
          </div>
        </div>

        <span
          class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          :class="isFirebaseConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
        >
          {{ isFirebaseConfigured ? 'Connected' : 'Offline Sandbox' }}
        </span>
      </div>

      <div class="space-y-3 text-xs">
        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <span class="text-slate-600 font-medium">Authentication Engine</span>
          <span class="font-bold text-slate-800">
            {{ isFirebaseConfigured ? 'Firebase Auth (SDK 11)' : 'Isolated Session Sandbox' }}
          </span>
        </div>

        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <span class="text-slate-600 font-medium">Database Backend</span>
          <span class="font-bold text-slate-800">
            {{ isFirebaseConfigured ? 'Google Cloud Firestore' : 'Isolated Local Persistence (Per UID)' }}
          </span>
        </div>

        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <span class="text-slate-600 font-medium">Security Rules Enforced</span>
          <span class="font-bold text-emerald-600">firestore.rules (User-isolated)</span>
        </div>

        <div v-if="!isFirebaseConfigured" class="p-3 bg-amber-50 rounded-xl text-amber-800 border border-amber-200">
          <p class="font-semibold">Setup Notice:</p>
          <p class="mt-0.5 leading-relaxed">
            To switch to a live Firebase project, paste your Firebase web config values into <code class="font-mono bg-amber-100 px-1 rounded">.env</code>. The application automatically reloads with live Firestore.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { isFirebaseConfigured } from '@/config/firebase';
import { User, Coins, ShieldCheck, ShieldAlert } from 'lucide-vue-next';

const authStore = useAuthStore();
</script>

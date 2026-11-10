<template>
  <div v-if="!isFirebaseConfigured" class="bg-amber-500 text-white px-4 py-2.5 shadow-md">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
      <div class="flex items-center space-x-2">
        <AlertTriangle class="w-4 h-4 shrink-0 text-amber-100" />
        <span>
          <strong class="font-bold">Firebase Configuration Needed:</strong>
          Running in offline sandbox/demo mode. Connect your real Firebase project via <code class="bg-amber-600/60 px-1 py-0.5 rounded text-amber-100 font-mono">.env</code>.
        </span>
      </div>
      <div class="flex items-center space-x-2 shrink-0">
        <button
          @click="showSetupModal = true"
          class="bg-white text-amber-900 font-semibold px-3 py-1 rounded-lg hover:bg-amber-50 transition shadow-sm text-xs"
        >
          Setup Guide
        </button>
      </div>
    </div>

    <!-- Setup Guide Modal -->
    <Modal
      :is-open="showSetupModal"
      title="Connect Real Firebase Project"
      subtitle="Follow these 3 quick steps to enable Cloud Firestore & Authentication"
      max-width="lg"
      @close="showSetupModal = false"
    >
      <div class="space-y-4 text-sm text-slate-700">
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p class="font-semibold text-slate-800 text-xs uppercase tracking-wide">Step 1: Create a Firebase Project</p>
          <p class="text-xs text-slate-600 mt-1">
            Visit the <a href="https://console.firebase.google.com" target="_blank" class="text-emerald-600 underline font-semibold">Firebase Console</a>, create a project, and register a Web App.
          </p>
        </div>

        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p class="font-semibold text-slate-800 text-xs uppercase tracking-wide">Step 2: Enable Auth & Firestore</p>
          <ul class="text-xs text-slate-600 list-disc list-inside mt-1 space-y-0.5">
            <li>Go to <strong>Authentication</strong> &rarr; Enable <strong>Email/Password</strong> provider.</li>
            <li>Go to <strong>Firestore Database</strong> &rarr; Create database in production mode.</li>
            <li>Copy the rules from <code class="font-mono bg-slate-200 px-1 rounded">firestore.rules</code> to the Rules tab in Firestore.</li>
          </ul>
        </div>

        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p class="font-semibold text-slate-800 text-xs uppercase tracking-wide">Step 3: Add Credentials to .env</p>
          <p class="text-xs text-slate-600 mt-1">
            Create a <code class="font-mono bg-slate-200 px-1 rounded">.env</code> file in the project root based on <code class="font-mono bg-slate-200 px-1 rounded">.env.example</code> with your keys:
          </p>
          <pre class="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-xs font-mono mt-2 overflow-x-auto">VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef</pre>
        </div>
      </div>

      <template #footer>
        <button
          @click="showSetupModal = false"
          class="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
        >
          Got it
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { isFirebaseConfigured } from '@/config/firebase';
import { AlertTriangle } from 'lucide-vue-next';
import Modal from '../common/Modal.vue';

const showSetupModal = ref(false);
</script>

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  registerUser,
  loginUser,
  logoutUser,
  sendResetPassword,
  subscribeToAuthState,
  getAuthErrorMessage
} from '@/services/authService';
import { isFirebaseConfigured, firebaseConfigError } from '@/config/firebase';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isLoading = ref(true);
  const isInitialized = ref(false);
  const authError = ref(null);

  const isAuthenticated = computed(() => !!user.value && !!user.value.uid);
  const userDisplayName = computed(() => user.value?.displayName || user.value?.email?.split('@')[0] || 'User');
  const userEmail = computed(() => user.value?.email || '');
  const userUid = computed(() => user.value?.uid || '');

  let unsubscribeAuth = null;
  let initPromise = null;

  /**
   * Initialize auth state listener. Returns a promise that resolves once the initial auth state is known.
   */
  function initAuth() {
    if (initPromise) return initPromise;

    initPromise = new Promise((resolve) => {
      isLoading.value = true;
      unsubscribeAuth = subscribeToAuthState((profile) => {
        user.value = profile;
        isLoading.value = false;
        isInitialized.value = true;
        resolve(profile);
      });
    });

    return initPromise;
  }

  async function register({ name, email, password }) {
    authError.value = null;
    isLoading.value = true;
    try {
      const profile = await registerUser({ name, email, password });
      user.value = profile;
      return profile;
    } catch (err) {
      const message = getAuthErrorMessage(err);
      authError.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function login({ email, password }) {
    authError.value = null;
    isLoading.value = true;
    try {
      const profile = await loginUser({ email, password });
      user.value = profile;
      return profile;
    } catch (err) {
      const message = getAuthErrorMessage(err);
      authError.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    authError.value = null;
    isLoading.value = true;
    try {
      await logoutUser();
      user.value = null;
    } catch (err) {
      const message = getAuthErrorMessage(err);
      authError.value = message;
      throw new Error(message);
    } finally {
      isLoading.value = false;
    }
  }

  async function resetPassword(email) {
    authError.value = null;
    try {
      await sendResetPassword(email);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      authError.value = message;
      throw new Error(message);
    }
  }

  function clearError() {
    authError.value = null;
  }

  return {
    user,
    isLoading,
    isInitialized,
    authError,
    isAuthenticated,
    userDisplayName,
    userEmail,
    userUid,
    isFirebaseConfigured,
    firebaseConfigError,
    initAuth,
    register,
    login,
    logout,
    resetPassword,
    clearError
  };
});

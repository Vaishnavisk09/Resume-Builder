import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

export const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true, title: 'Dashboard' }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/views/TransactionsView.vue'),
    meta: { requiresAuth: true, title: 'Transactions' }
  },
  {
    path: '/budgets',
    name: 'Budgets',
    component: () => import('@/views/BudgetsView.vue'),
    meta: { requiresAuth: true, title: 'Budgets' }
  },
  {
    path: '/goals',
    name: 'Goals',
    component: () => import('@/views/GoalsView.vue'),
    meta: { requiresAuth: true, title: 'Savings Goals' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { requiresAuth: true, title: 'Analytics' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true, title: 'Settings' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true, title: 'Sign In' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guestOnly: true, title: 'Create Account' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: { guestOnly: true, title: 'Reset Password' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '404 Not Found' }
  }
];

const router = createRouter({
  history: typeof window !== 'undefined'
    ? createWebHistory(import.meta.env.BASE_URL)
    : createMemoryHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

// Modern Vue Router 4 navigation guard: returns target route or boolean
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();

  // Ensure initial Firebase auth check has completed before evaluating routes
  if (!authStore.isInitialized) {
    await authStore.initAuth();
  }

  // Update dynamic page title
  const baseTitle = 'Finora – Smart Personal Finance';
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle;

  const isAuthenticated = authStore.isAuthenticated;

  // Protected routes check
  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    };
  }

  // Guest-only routes check (prevent logged-in user from visiting /login or /register)
  if (to.meta.guestOnly && isAuthenticated) {
    return '/dashboard';
  }

  return true;
});

export default router;

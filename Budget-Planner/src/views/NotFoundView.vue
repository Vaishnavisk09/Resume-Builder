<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center space-y-4">
      <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black">
        404
      </div>
      <h2 class="text-2xl font-bold text-slate-800">Page Not Found</h2>
      <p class="text-xs sm:text-sm text-slate-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <div>
        <router-link
          to="/dashboard"
          class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
        >
          <span>Return to Dashboard</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Savings Goals
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Set ambitious targets, track your deposits, and celebrate financial milestones
        </p>
      </div>

      <button
        @click="openAddModal"
        class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition flex items-center space-x-1.5 active:scale-95 self-start sm:self-auto"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Create Goal</span>
      </button>
    </div>

    <!-- Overall Goals Summary Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Saved</span>
        <p class="text-2xl font-extrabold text-slate-900 mt-1">
          {{ formatCurrency(goalStore.totalCurrentSavings) }}
        </p>
        <p class="text-xs text-slate-500 mt-1">Accumulated across all goals</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Target Amount</span>
        <p class="text-2xl font-extrabold text-slate-900 mt-1">
          {{ formatCurrency(goalStore.totalTargetSavings) }}
        </p>
        <p class="text-xs text-slate-500 mt-1">Total goal objective</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed Goals</span>
        <p class="text-2xl font-extrabold text-emerald-600 mt-1">
          {{ goalStore.completedGoalsCount }} / {{ goalStore.goals.length }}
        </p>
        <p class="text-xs text-slate-500 mt-1">Milestones reached</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Progress</span>
        <p class="text-2xl font-extrabold text-slate-900 mt-1">
          {{ goalStore.overallGoalProgress }}%
        </p>
        <div class="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div
            class="h-full bg-emerald-500 rounded-full transition-all"
            :style="{ width: `${goalStore.overallGoalProgress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Goals Grid -->
    <div v-if="goalStore.goalsWithProgress.length === 0" class="py-16 text-center bg-white rounded-2xl border border-slate-200/80">
      <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
        <Target class="w-8 h-8" />
      </div>
      <h4 class="text-base font-bold text-slate-800">No savings goals set yet</h4>
      <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
        Saving for a new home, emergency fund, or vacation? Define your first goal and track every deposit.
      </p>
      <button
        @click="openAddModal"
        class="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition inline-flex items-center space-x-1.5"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Create First Goal</span>
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <GoalCard
        v-for="g in goalStore.goalsWithProgress"
        :key="g.id"
        :goal="g"
        @edit="handleEdit"
        @delete="handleDelete"
        @deposit="openDepositModal"
      />
    </div>

    <!-- Modals -->
    <GoalModal
      :is-open="isModalOpen"
      :goal="activeGoal"
      @close="isModalOpen = false"
      @save="handleSave"
    />

    <DepositModal
      :is-open="isDepositOpen"
      :goal="depositGoal"
      @close="isDepositOpen = false"
      @deposit="handleDeposit"
    />

    <ConfirmModal
      :is-open="isConfirmOpen"
      title="Delete Savings Goal"
      :message="`Are you sure you want to delete '${goalToDelete?.title}'?`"
      warning="This goal will be permanently removed from your account."
      :is-loading="isDeleting"
      @cancel="isConfirmOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import confetti from 'canvas-confetti';
import { useGoalStore } from '@/stores/goalStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency } from '@/utils/currency';
import GoalCard from '@/components/goals/GoalCard.vue';
import GoalModal from '@/components/goals/GoalModal.vue';
import DepositModal from '@/components/goals/DepositModal.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import { PlusCircle, Target } from 'lucide-vue-next';

const goalStore = useGoalStore();
const notificationStore = useNotificationStore();

const isModalOpen = ref(false);
const activeGoal = ref(null);

const isDepositOpen = ref(false);
const depositGoal = ref(null);

const isConfirmOpen = ref(false);
const goalToDelete = ref(null);
const isDeleting = ref(false);

function triggerConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {
    // optional confetti
  }
}

function openAddModal() {
  activeGoal.value = null;
  isModalOpen.value = true;
}

function handleEdit(g) {
  activeGoal.value = { ...g };
  isModalOpen.value = true;
}

function handleDelete(g) {
  goalToDelete.value = g;
  isConfirmOpen.value = true;
}

function openDepositModal(g) {
  depositGoal.value = g;
  isDepositOpen.value = true;
}

async function handleSave(data) {
  try {
    if (data.id) {
      await goalStore.editGoal(data.id, data);
      notificationStore.success(`Savings goal '${data.title}' updated!`);
    } else {
      await goalStore.addGoal(data);
      notificationStore.success(`Savings goal '${data.title}' created!`);
    }
  } catch (err) {
    notificationStore.error(err.message || 'Failed to save goal');
  }
}

async function handleDeposit({ goalId, amount }) {
  try {
    const updated = await goalStore.depositToGoal(goalId, amount);
    notificationStore.success(
      `Deposited ₹${amount.toLocaleString('en-IN')} towards '${updated.title}'!`
    );

    // If goal reached 100%, trigger confetti celebration!
    if (updated.currentAmount >= updated.targetAmount) {
      triggerConfetti();
      notificationStore.success(`🎉 Congratulations! You have fully achieved '${updated.title}'!`);
    }
  } catch (err) {
    notificationStore.error(err.message || 'Deposit failed');
  }
}

async function confirmDelete() {
  if (!goalToDelete.value) return;
  isDeleting.value = true;
  try {
    await goalStore.removeGoal(goalToDelete.value.id);
    notificationStore.success('Savings goal deleted successfully.');
    isConfirmOpen.value = false;
  } catch (err) {
    notificationStore.error(err.message || 'Failed to delete goal');
  } finally {
    isDeleting.value = false;
  }
}
</script>

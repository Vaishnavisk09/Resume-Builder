<template>
  <div class="space-y-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Transactions
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Review, filter, search, and manage your financial records
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center space-x-2.5">
        <button
          @click="exportCSV"
          :disabled="transactionStore.filteredTransactions.length === 0"
          class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
        >
          <Download class="w-4 h-4" />
          <span class="hidden sm:inline">Export CSV</span>
        </button>
        <button
          id="transactions-new-entry-btn"
          @click="openAddModal('expense')"
          class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition flex items-center space-x-1.5 active:scale-95"
        >
          <PlusCircle class="w-4 h-4" />
          <span>New Entry</span>
        </button>
        <button
          @click="openAddModal('income')"
          class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition flex items-center space-x-1.5 active:scale-95"
        >
          <ArrowDownLeft class="w-4 h-4" />
          <span>Add Income</span>
        </button>
        <button
          @click="openAddModal('expense')"
          class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition flex items-center space-x-1.5 active:scale-95"
        >
          <ArrowUpRight class="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>
    </div>

    <!-- Filter Summary Strip -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Filtered Income</p>
          <p class="text-xl font-extrabold text-emerald-700 mt-0.5">
            {{ formatCurrency(transactionStore.filteredIncome) }}
          </p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <ArrowDownLeft class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-rose-800 uppercase tracking-wider">Filtered Expenses</p>
          <p class="text-xl font-extrabold text-rose-700 mt-0.5">
            {{ formatCurrency(transactionStore.filteredExpenses) }}
          </p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <ArrowUpRight class="w-5 h-5" />
        </div>
      </div>

      <div class="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-blue-800 uppercase tracking-wider">Filtered Net Balance</p>
          <p class="text-xl font-extrabold text-blue-700 mt-0.5">
            {{ formatCurrency(transactionStore.filteredNetBalance) }}
          </p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
          <Wallet class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Transaction Filters -->
    <TransactionFilter />

    <!-- Transactions Table -->
    <TransactionTable
      :transactions="transactionStore.filteredTransactions"
      empty-message="No transactions match the selected filters. Try adjusting your date range, type, or search term."
      @create="openAddModal('expense')"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- Add / Edit Modal -->
    <TransactionModal
      :is-open="isModalOpen"
      :transaction="activeTransaction"
      @close="isModalOpen = false"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :is-open="isConfirmOpen"
      title="Delete Transaction"
      :message="`Are you sure you want to permanently delete '${txToDelete?.title}' (₹${txToDelete?.amount})?`"
      warning="This action cannot be undone."
      :is-loading="isDeleting"
      @cancel="isConfirmOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatCurrency } from '@/utils/currency';
import TransactionFilter from '@/components/transactions/TransactionFilter.vue';
import TransactionTable from '@/components/transactions/TransactionTable.vue';
import TransactionModal from '@/components/transactions/TransactionModal.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import {
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  PlusCircle
} from 'lucide-vue-next';

const transactionStore = useTransactionStore();
const notificationStore = useNotificationStore();

const isModalOpen = ref(false);
const activeTransaction = ref(null);

const isConfirmOpen = ref(false);
const txToDelete = ref(null);
const isDeleting = ref(false);

function openAddModal(type = 'expense') {
  activeTransaction.value = { type };
  isModalOpen.value = true;
}

function handleEdit(tx) {
  activeTransaction.value = { ...tx };
  isModalOpen.value = true;
}

function handleDelete(tx) {
  txToDelete.value = tx;
  isConfirmOpen.value = true;
}

function handleSave() {
  isModalOpen.value = false;
}

async function confirmDelete() {
  if (!txToDelete.value) return;
  isDeleting.value = true;
  try {
    await transactionStore.removeTransaction(txToDelete.value.id);
    notificationStore.success('Transaction deleted successfully.');
    isConfirmOpen.value = false;
  } catch (err) {
    notificationStore.error(err.message || 'Failed to delete transaction');
  } finally {
    isDeleting.value = false;
  }
}

function exportCSV() {
  const rows = transactionStore.filteredTransactions;
  if (rows.length === 0) return;

  const headers = ['ID', 'Title', 'Type', 'Amount (INR)', 'Category', 'Date', 'Payment Method', 'Description'];
  const csvContent = [
    headers.join(','),
    ...rows.map(r => [
      `"${r.id}"`,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${r.type}"`,
      `"${r.amount}"`,
      `"${(r.category || '').replace(/"/g, '""')}"`,
      `"${r.date}"`,
      `"${(r.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `finora_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  notificationStore.info('Transactions exported to CSV successfully.');
}
</script>

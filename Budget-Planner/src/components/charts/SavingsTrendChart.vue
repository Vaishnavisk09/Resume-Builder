<template>
  <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-full">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h4 class="font-bold text-slate-800 text-sm sm:text-base">Savings Trend</h4>
        <p class="text-xs text-slate-400 mt-0.5">Net accumulated monthly savings (Income – Expenses)</p>
      </div>
    </div>

    <!-- Chart Canvas Container -->
    <div class="relative w-full h-[280px] sm:h-[300px]">
      <div
        v-if="isEmpty"
        class="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/90 z-10"
      >
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <PiggyBank class="w-6 h-6" />
        </div>
        <p class="text-xs font-medium text-slate-500">No savings data available yet</p>
      </div>
      <canvas
        ref="canvasRef"
        :class="{ 'invisible': isEmpty }"
        class="w-full h-full block"
      ></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import ChartJS, { currencyTooltipCallback } from '@/utils/chartSetup';
import { PiggyBank } from 'lucide-vue-next';
import { format, subMonths, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';

const props = defineProps({
  transactions: { type: Array, default: () => [] }
});

const canvasRef = ref(null);
let chartInstance = null;

const savingsMonthly = computed(() => {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i);
    const label = format(m, 'MMM yyyy');
    const start = startOfMonth(m);
    const end = endOfMonth(m);
    months.push({ label, start, end, income: 0, expense: 0 });
  }

  props.transactions.forEach(tx => {
    if (!tx.date) return;
    const d = parseLocalDate(tx.date);
    if (!d || !isValid(d)) return;

    months.forEach(m => {
      if (d >= m.start && d <= m.end) {
        if (tx.type === 'income') {
          m.income += Number(tx.amount) || 0;
        } else if (tx.type === 'expense') {
          m.expense += Number(tx.amount) || 0;
        }
      }
    });
  });

  return months.map(m => ({
    label: m.label,
    netSavings: m.income - m.expense
  }));
});

const isEmpty = computed(() => {
  return savingsMonthly.value.every(m => m.netSavings === 0);
});

function renderChart() {
  if (!canvasRef.value) return;

  if (isEmpty.value) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  const labels = savingsMonthly.value.map(m => m.label);
  const data = savingsMonthly.value.map(m => m.netSavings);

  // If chart already exists, update data directly
  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
    return;
  }

  chartInstance = new ChartJS(canvasRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Net Monthly Savings',
          data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#10b981',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: currencyTooltipCallback,
          padding: 10,
          cornerRadius: 8,
          bodyFont: { family: 'Plus Jakarta Sans', weight: 'bold' }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10, family: 'Plus Jakarta Sans' }, color: '#64748b' }
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            font: { size: 10, family: 'Plus Jakarta Sans' },
            color: '#64748b',
            callback: (val) => '₹' + Number(val).toLocaleString('en-IN')
          }
        }
      }
    }
  });
}

watch(
  () => props.transactions,
  async () => {
    await nextTick();
    renderChart();
  },
  { deep: true }
);

onMounted(async () => {
  await nextTick();
  renderChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

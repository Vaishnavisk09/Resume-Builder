<template>
  <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-full">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h4 class="font-bold text-slate-800 text-sm sm:text-base">Spending Trend</h4>
        <p class="text-xs text-slate-400 mt-0.5">Timeline of expenses recorded over time</p>
      </div>
    </div>

    <!-- Chart Canvas Container -->
    <div class="relative w-full h-[280px] sm:h-[300px]">
      <div
        v-if="isEmpty"
        class="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/90 z-10"
      >
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <TrendingDown class="w-6 h-6" />
        </div>
        <p class="text-xs font-medium text-slate-500">No expense records found in this range</p>
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
import { TrendingDown } from 'lucide-vue-next';
import { format, isValid } from 'date-fns';
import { parseLocalDate } from '@/utils/dateUtils';

const props = defineProps({
  transactions: { type: Array, default: () => [] }
});

const canvasRef = ref(null);
let chartInstance = null;

const trendData = computed(() => {
  const expenseTx = props.transactions
    .filter(tx => tx.type === 'expense' && tx.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (expenseTx.length === 0) return { labels: [], data: [] };

  // Aggregate by date
  const dayMap = {};
  expenseTx.forEach(tx => {
    const d = parseLocalDate(tx.date);
    if (!d || !isValid(d)) return;
    const key = format(d, 'dd MMM');
    dayMap[key] = (dayMap[key] || 0) + (Number(tx.amount) || 0);
  });

  return {
    labels: Object.keys(dayMap),
    data: Object.values(dayMap)
  };
});

const isEmpty = computed(() => trendData.value.labels.length === 0);

function renderChart() {
  if (!canvasRef.value) return;

  if (isEmpty.value) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  // If chart already exists, update data directly
  if (chartInstance) {
    chartInstance.data.labels = trendData.value.labels;
    chartInstance.data.datasets[0].data = trendData.value.data;
    chartInstance.update();
    return;
  }

  chartInstance = new ChartJS(canvasRef.value, {
    type: 'line',
    data: {
      labels: trendData.value.labels,
      datasets: [
        {
          label: 'Daily Expenses',
          data: trendData.value.data,
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#f43f5e',
          pointRadius: 3.5,
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

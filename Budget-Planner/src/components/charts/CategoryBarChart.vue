<template>
  <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-full">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h4 class="font-bold text-slate-800 text-sm sm:text-base">Category Comparison</h4>
        <p class="text-xs text-slate-400 mt-0.5">Ranking categories by total expense amount</p>
      </div>
    </div>

    <!-- Chart Canvas Container -->
    <div class="relative w-full h-[280px] sm:h-[300px]">
      <div
        v-if="isEmpty"
        class="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/90 z-10"
      >
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <Layers class="w-6 h-6" />
        </div>
        <p class="text-xs font-medium text-slate-500">No categories to compare</p>
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
import { Layers } from 'lucide-vue-next';

const props = defineProps({
  categoryData: { type: Object, default: () => ({}) }
});

const canvasRef = ref(null);
let chartInstance = null;

const sortedPairs = computed(() => {
  const entries = Object.entries(props.categoryData);
  return entries.sort((a, b) => b[1] - a[1]);
});

const isEmpty = computed(() => sortedPairs.value.length === 0 || sortedPairs.value.every(p => p[1] === 0));

function renderChart() {
  if (!canvasRef.value) return;

  if (isEmpty.value) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  const labels = sortedPairs.value.map(p => p[0]);
  const data = sortedPairs.value.map(p => p[1]);

  // If chart already exists, update data directly
  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
    return;
  }

  chartInstance = new ChartJS(canvasRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          axis: 'y',
          label: 'Spent',
          data,
          backgroundColor: '#6366f1',
          borderRadius: 6,
          barPercentage: 0.65
        }
      ]
    },
    options: {
      indexAxis: 'y',
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
          grid: { color: '#f1f5f9' },
          ticks: {
            font: { size: 10, family: 'Plus Jakarta Sans' },
            color: '#64748b',
            callback: (val) => '₹' + Number(val).toLocaleString('en-IN')
          }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11, family: 'Plus Jakarta Sans' }, color: '#475569' }
        }
      }
    }
  });
}

watch(
  () => props.categoryData,
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

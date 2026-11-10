<template>
  <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-full">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h4 class="font-bold text-slate-800 text-sm sm:text-base">Expense by Category</h4>
        <p class="text-xs text-slate-400 mt-0.5">Distribution of spending across categories</p>
      </div>
      <span class="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
        {{ totalExpensesFormatted }}
      </span>
    </div>

    <!-- Chart Container -->
    <div class="relative w-full h-[280px] sm:h-[300px]">
      <div
        v-if="isEmpty"
        class="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/90 z-10"
      >
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <PieChart class="w-6 h-6" />
        </div>
        <p class="text-xs font-medium text-slate-500">No expense records in selected range</p>
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
import ChartJS from '@/utils/chartSetup';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import { formatCurrency } from '@/utils/currency';
import { PieChart } from 'lucide-vue-next';

const props = defineProps({
  categoryData: { type: Object, default: () => ({}) }
});

const canvasRef = ref(null);
let chartInstance = null;

const categories = computed(() => Object.keys(props.categoryData));
const amounts = computed(() => Object.values(props.categoryData));
const isEmpty = computed(() => categories.value.length === 0 || amounts.value.every(v => v === 0));

const totalExpenses = computed(() => {
  return amounts.value.reduce((sum, val) => sum + (Number(val) || 0), 0);
});

const totalExpensesFormatted = computed(() => {
  return formatCurrency(totalExpenses.value);
});

function getCategoryColor(name, index) {
  const match = EXPENSE_CATEGORIES.find(c => c.name === name);
  if (match) return match.color;
  const palette = ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#06b6d4', '#f43f5e', '#64748b'];
  return palette[index % palette.length];
}

function renderChart() {
  if (!canvasRef.value) return;

  if (isEmpty.value) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  const bgColors = categories.value.map((cat, i) => getCategoryColor(cat, i));

  // If chart already exists, update data directly
  if (chartInstance) {
    chartInstance.data.labels = categories.value;
    chartInstance.data.datasets[0].data = amounts.value;
    chartInstance.data.datasets[0].backgroundColor = bgColors;
    chartInstance.update();
    return;
  }

  chartInstance = new ChartJS(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels: categories.value,
      datasets: [
        {
          data: amounts.value,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 11, family: 'Plus Jakarta Sans' },
            padding: 12
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              const label = context.label || '';
              const val = Number(context.raw) || 0;
              const total = totalExpenses.value;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
              return ` ${label}: ₹${val.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} (${pct}%)`;
            }
          },
          padding: 10,
          cornerRadius: 8,
          bodyFont: { family: 'Plus Jakarta Sans', weight: 'bold' }
        }
      },
      cutout: '68%'
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

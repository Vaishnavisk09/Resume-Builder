import { Chart as ChartJS, registerables } from 'chart.js';

// Register all required Chart.js controllers, elements, scales, and plugins
ChartJS.register(...registerables);

// Set default global responsive and font configurations
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;
ChartJS.defaults.font.family = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
ChartJS.defaults.color = '#64748b';

/**
 * Currency tooltip formatter callback for Chart.js
 */
export const currencyTooltipCallback = {
  label(context) {
    let label = context.dataset.label || context.label || '';
    if (label) {
      label += ': ';
    }
    const val = context.parsed?.y !== undefined
      ? context.parsed.y
      : (context.parsed?.x !== undefined
        ? context.parsed.x
        : (context.parsed !== undefined ? context.parsed : context.raw));

    if (val !== null && val !== undefined) {
      label += '₹' + Number(val).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return label;
  }
};

export default ChartJS;

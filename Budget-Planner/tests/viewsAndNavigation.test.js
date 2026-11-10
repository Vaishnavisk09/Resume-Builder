import { describe, it, expect } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import DashboardView from '../src/views/DashboardView.vue';
import TransactionsView from '../src/views/TransactionsView.vue';
import BudgetsView from '../src/views/BudgetsView.vue';
import GoalsView from '../src/views/GoalsView.vue';
import AnalyticsView from '../src/views/AnalyticsView.vue';
import SettingsView from '../src/views/SettingsView.vue';

describe('Views & Page Components Isolation', () => {
  it('Verifies each view is an independent component with distinct definition', () => {
    setActivePinia(createPinia());
    expect(DashboardView).toBeDefined();
    expect(TransactionsView).toBeDefined();
    expect(BudgetsView).toBeDefined();
    expect(GoalsView).toBeDefined();
    expect(AnalyticsView).toBeDefined();
    expect(SettingsView).toBeDefined();

    expect(DashboardView).not.toBe(TransactionsView);
    expect(TransactionsView).not.toBe(BudgetsView);
    expect(BudgetsView).not.toBe(GoalsView);
    expect(GoalsView).not.toBe(AnalyticsView);
    expect(AnalyticsView).not.toBe(SettingsView);
  });
});

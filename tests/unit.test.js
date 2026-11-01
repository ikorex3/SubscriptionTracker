import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextBillingDate,
  calculateSpendEstimates,
  calculateTotalAnalytics
} from '../src/domain/calculations.js';

test('Unit Tests: Domain Calculations & Logic', async (t) => {
  await t.test('calculateNextBillingDate: monthly interval adds 30 days', () => {
    const nextDate = calculateNextBillingDate('2026-10-01', 'monthly');
    assert.strictEqual(nextDate, '2026-10-31');
  });

  await t.test('calculateNextBillingDate: annual interval adds 365 days', () => {
    const nextDate = calculateNextBillingDate('2026-10-01', 'annual');
    assert.strictEqual(nextDate, '2027-10-01');
  });

  await t.test('calculateNextBillingDate: custom days interval adds N days (SC-02 / FR-01.4)', () => {
    const nextDate = calculateNextBillingDate('2026-10-15', 'custom', 90, 'days');
    assert.strictEqual(nextDate, '2027-01-13');
  });

  await t.test('calculateNextBillingDate: custom months interval adds N*30 days', () => {
    const nextDate = calculateNextBillingDate('2026-10-01', 'custom', 3, 'months');
    assert.strictEqual(nextDate, '2026-12-30');
  });

  await t.test('calculateSpendEstimates: monthly calculation (FR-01.5 / SC-04)', () => {
    const estimates = calculateSpendEstimates(199.00, 'monthly');
    assert.strictEqual(estimates.monthlySpendEstimate, 199.00);
    // formula: (199 / 30) * 365 = 2421.17
    assert.strictEqual(estimates.annualSpendEstimate, 2421.17);
  });

  await t.test('calculateSpendEstimates: annual calculation (FR-01.5)', () => {
    const estimates = calculateSpendEstimates(1200.00, 'annual');
    assert.strictEqual(estimates.annualSpendEstimate, 1200.00);
    assert.strictEqual(estimates.monthlySpendEstimate, 100.00);
  });

  await t.test('calculateSpendEstimates: custom days calculation (FR-01.5)', () => {
    // 300 UAH every 45 days -> annual = (300 / 45) * 365 = 2433.33
    const estimates = calculateSpendEstimates(300.00, 'custom', 45, 'days');
    assert.strictEqual(estimates.annualSpendEstimate, 2433.33);
    assert.strictEqual(estimates.monthlySpendEstimate, 202.78);
  });

  await t.test('calculateTotalAnalytics: computes spend across active subscriptions only (FR-04.1, FR-04.2, FR-04.3)', () => {
    const subscriptions = [
      { status: 'active', annualSpendEstimate: 2400.00 },
      { status: 'active', annualSpendEstimate: 1200.00 },
      { status: 'cancelled', annualSpendEstimate: 3600.00 } // cancelled must be excluded
    ];
    const summary = calculateTotalAnalytics(subscriptions);
    assert.strictEqual(summary.activeSubscriptionCount, 2);
    assert.strictEqual(summary.totalAnnualSpend, 3600.00);
    assert.strictEqual(summary.totalMonthlySpend, 300.00);
    assert.strictEqual(summary.currency, 'UAH');
  });
});


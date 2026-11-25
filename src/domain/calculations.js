/**
 * @module domain/calculations
 * Pure domain calculation utilities for Subscription Tracker.
 * Uses fixed 30-day months and 365-day years per SRS formulas.
 * Traced Requirements: FR-01.4, FR-01.5, FR-04.1, FR-04.2, FR-04.3.
 */

/**
 * Calculates the next billing date by adding the billing interval to a base date.
 * Uses UTC date arithmetic with 30 days per month and 365 days per year (FR-01.4).
 *
 * @param {string} baseDateStr - ISO calendar date (`YYYY-MM-DD`) to advance from.
 * @param {'monthly' | 'annual' | 'custom'} intervalType - Recurrence interval type.
 * @param {number} [customValue=0] - Positive multiplier when `intervalType` is `'custom'`.
 * @param {'days' | 'months'} [customUnit='days'] - Unit for `'custom'` intervals.
 * @returns {string} Next billing date formatted as `YYYY-MM-DD`.
 * @throws {Error} When `baseDateStr` is invalid or interval parameters are unsupported.
 */
export function calculateNextBillingDate(baseDateStr, intervalType, customValue = 0, customUnit = 'days') {
  const date = new Date(baseDateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${baseDateStr}`);
  }

  let daysToAdd = 0;
  if (intervalType === 'monthly') {
    daysToAdd = 30;
  } else if (intervalType === 'annual') {
    daysToAdd = 365;
  } else if (intervalType === 'custom') {
    if (customUnit === 'days') {
      daysToAdd = Number(customValue);
    } else if (customUnit === 'months') {
      daysToAdd = Number(customValue) * 30;
    } else {
      throw new Error(`Unsupported customIntervalUnit: ${customUnit}`);
    }
  } else {
    throw new Error(`Unsupported billingIntervalType: ${intervalType}`);
  }

  date.setUTCDate(date.getUTCDate() + daysToAdd);
  return date.toISOString().slice(0, 10);
}

/**
 * Calculates normalized annual and monthly spend estimates in UAH for a subscription.
 * Formula (FR-01.5): `annualSpendEstimate = (cost / intervalInDays) * 365`.
 * For `'monthly'` intervals, `monthlySpendEstimate` equals `cost` directly; otherwise `annualSpendEstimate / 12`.
 *
 * @param {number} cost - Recurring subscription cost in UAH.
 * @param {'monthly' | 'annual' | 'custom'} intervalType - Recurrence interval type.
 * @param {number} [customValue=0] - Positive multiplier when `intervalType` is `'custom'`.
 * @param {'days' | 'months'} [customUnit='days'] - Unit for `'custom'` intervals.
 * @returns {{ annualSpendEstimate: number, monthlySpendEstimate: number }} Estimates rounded to 2 decimal places.
 * @throws {Error} When the resolved interval length in days is less than or equal to zero.
 */
export function calculateSpendEstimates(cost, intervalType, customValue = 0, customUnit = 'days') {
  const numericCost = Number(cost);
  let intervalInDays = 30;

  if (intervalType === 'monthly') {
    intervalInDays = 30;
  } else if (intervalType === 'annual') {
    intervalInDays = 365;
  } else if (intervalType === 'custom') {
    if (customUnit === 'days') {
      intervalInDays = Number(customValue);
    } else if (customUnit === 'months') {
      intervalInDays = Number(customValue) * 30;
    }
  }

  if (intervalInDays <= 0) {
    throw new Error('Interval in days must be greater than zero');
  }

  const annualSpendEstimate = Number(((numericCost / intervalInDays) * 365).toFixed(2));
  const monthlySpendEstimate = intervalType === 'monthly'
    ? numericCost
    : Number((annualSpendEstimate / 12).toFixed(2));

  return {
    annualSpendEstimate,
    monthlySpendEstimate
  };
}

/**
 * Aggregates total monthly and annual spend across active subscriptions only.
 * Cancelled subscriptions are excluded from totals (FR-04.1, FR-04.2, FR-04.3).
 *
 * @param {Array.<object>} [subscriptions=[]] - Subscription records to aggregate (`status`, optional `annualSpendEstimate`).
 * @returns {{
 *   totalMonthlySpend: number,
 *   totalAnnualSpend: number,
 *   currency: 'UAH',
 *   activeSubscriptionCount: number,
 *   calculatedAt: string
 * }} Spend summary in UAH with ISO-8601 calculation timestamp.
 */
export function calculateTotalAnalytics(subscriptions = []) {
  const activeSubs = subscriptions.filter((sub) => sub.status === 'active');
  const activeSubscriptionCount = activeSubs.length;

  const totalAnnualSpend = Number(
    activeSubs.reduce((acc, sub) => acc + (Number(sub.annualSpendEstimate) || 0), 0).toFixed(2)
  );

  const totalMonthlySpend = Number((totalAnnualSpend / 12).toFixed(2));

  return {
    totalMonthlySpend,
    totalAnnualSpend,
    currency: 'UAH',
    activeSubscriptionCount,
    calculatedAt: new Date().toISOString()
  };
}


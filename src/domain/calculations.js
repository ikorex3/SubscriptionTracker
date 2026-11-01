/**
 * Domain calculation utilities for Subscription Tracker.
 * Traced Requirements: FR-01.4, FR-01.5, FR-04.1, FR-04.2, FR-04.3
 */

/**
 * Calculates the next billing date based on the previous date and interval.
 * FR-01.4: Next Billing Date = Previous Date + Interval
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
 * Calculates annual and monthly spend estimates for a subscription.
 * FR-01.5: Annual Spend Estimate = (Cost ÷ Interval days) × 365
 * Total Monthly Spend = Annual Estimate ÷ 12
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
 * Aggregates spend analytics across active subscriptions only.
 * FR-04.1, FR-04.2, FR-04.3
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


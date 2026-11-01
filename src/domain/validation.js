/**
 * Request validation utilities for OpenAPI 3.0.3 compliance.
 */

export function validateSubscriptionCreate(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return ['Request body must be a JSON object'];
  }

  if (!body.serviceName || typeof body.serviceName !== 'string' || !body.serviceName.trim()) {
    errors.push("Field 'serviceName' is required.");
  }

  if (body.cost === undefined || body.cost === null || typeof body.cost !== 'number' || body.cost < 0) {
    errors.push("Field 'cost' must be a non-negative number.");
  }

  const validIntervals = ['monthly', 'annual', 'custom'];
  if (!body.billingIntervalType || !validIntervals.includes(body.billingIntervalType)) {
    errors.push(`Field 'billingIntervalType' must be one of: ${validIntervals.join(', ')}.`);
  }

  if (body.billingIntervalType === 'custom') {
    if (!body.customIntervalValue || typeof body.customIntervalValue !== 'number' || body.customIntervalValue <= 0) {
      errors.push("Field 'customIntervalValue' is required when billingIntervalType is 'custom'.");
    }
    const validUnits = ['days', 'months'];
    if (!body.customIntervalUnit || !validUnits.includes(body.customIntervalUnit)) {
      errors.push("Field 'customIntervalUnit' must be 'days' or 'months' when billingIntervalType is 'custom'.");
    }
  }

  if (!body.firstBillingDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.firstBillingDate)) {
    errors.push("Field 'firstBillingDate' must be formatted as YYYY-MM-DD.");
  }

  if (body.notificationLeadTimeDays !== undefined) {
    const val = Number(body.notificationLeadTimeDays);
    if (!Number.isInteger(val) || val < 1 || val > 30) {
      errors.push("Field 'notificationLeadTimeDays' must be an integer between 1 and 30.");
    }
  }

  return errors;
}

export function validateTrialCreate(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return ['Request body must be a JSON object'];
  }

  if (!body.serviceName || typeof body.serviceName !== 'string' || !body.serviceName.trim()) {
    errors.push("Field 'serviceName' is required.");
  }

  if (!body.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.startDate)) {
    errors.push("Field 'startDate' must be formatted as YYYY-MM-DD.");
  }

  if (!body.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.endDate)) {
    errors.push("Field 'endDate' must be formatted as YYYY-MM-DD.");
  }

  if (body.notificationLeadTimeDays !== undefined) {
    const val = Number(body.notificationLeadTimeDays);
    if (!Number.isInteger(val) || val < 1 || val > 30) {
      errors.push("Field 'notificationLeadTimeDays' must be an integer between 1 and 30.");
    }
  }

  return errors;
}

export function validateBillingEventCreate(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return ['Request body must be a JSON object'];
  }

  if (!body.subscriptionId || typeof body.subscriptionId !== 'string') {
    errors.push("Field 'subscriptionId' is required.");
  }

  const validStatuses = ['paid', 'skipped'];
  if (!body.paymentStatus || !validStatuses.includes(body.paymentStatus)) {
    errors.push("Field 'paymentStatus' must be 'paid' or 'skipped'.");
  }

  if (!body.dateConfirmed || !/^\d{4}-\d{2}-\d{2}$/.test(body.dateConfirmed)) {
    errors.push("Field 'dateConfirmed' must be formatted as YYYY-MM-DD.");
  }

  return errors;
}

export function validateSettingsUpdate(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return ['Request body must be a JSON object'];
  }

  if (body.renewalLeadTimeDays !== undefined) {
    const val = Number(body.renewalLeadTimeDays);
    if (!Number.isInteger(val) || val < 1 || val > 30) {
      errors.push("Field 'renewalLeadTimeDays' must be an integer between 1 and 30.");
    }
  }

  if (body.trialLeadTimeDays !== undefined) {
    const val = Number(body.trialLeadTimeDays);
    if (!Number.isInteger(val) || val < 1 || val > 30) {
      errors.push("Field 'trialLeadTimeDays' must be an integer between 1 and 30.");
    }
  }

  return errors;
}

export function validateImportData(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return ['Import payload must be a JSON object'];
  }

  if (body.version !== '1.0.0') {
    errors.push("Import version must be '1.0.0'. Incompatible or invalid schema.");
  }

  if (body.subscriptions && !Array.isArray(body.subscriptions)) {
    errors.push("'subscriptions' must be an array.");
  }

  if (body.trials && !Array.isArray(body.trials)) {
    errors.push("'trials' must be an array.");
  }

  if (body.billingEvents && !Array.isArray(body.billingEvents)) {
    errors.push("'billingEvents' must be an array.");
  }

  return errors;
}


/**
 * @module domain/validation
 * Request payload and query parameter validators aligned with OpenAPI 3.0.3 contracts.
 * Every validator returns an array of human-readable error strings (empty array means valid).
 */

/**
 * Validates the `POST /subscriptions` creation payload.
 * Enforces non-empty `serviceName`, non-negative `cost`, valid `billingIntervalType`
 * (plus `customIntervalValue`/`customIntervalUnit` when `'custom'`), `YYYY-MM-DD`
 * `firstBillingDate`, and optional `notificationLeadTimeDays` in `[1, 30]`.
 *
 * @param {unknown} body - Parsed JSON request body.
 * @returns {string[]} List of validation error messages; empty if valid.
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

/**
 * Allowed values for the `status` query parameter on `GET /subscriptions` (CHG-01).
 * @type {readonly string[]}
 */
export const SUBSCRIPTION_STATUS_FILTERS = ['active', 'cancelled', 'all'];

/**
 * Validates the optional `status` query parameter of `GET /subscriptions` (CHG-01).
 * `undefined` indicates the parameter was omitted and is treated as valid.
 *
 * @param {string | undefined} value - Raw query parameter value.
 * @returns {string[]} List of validation error messages; empty if valid.
 */
export function validateSubscriptionStatusFilter(value) {
  if (value === undefined) return [];
  if (!SUBSCRIPTION_STATUS_FILTERS.includes(value)) {
    return [`Query parameter 'status' must be one of: ${SUBSCRIPTION_STATUS_FILTERS.join(', ')}.`];
  }
  return [];
}

/**
 * Validates the `POST /trials` creation payload.
 * Enforces non-empty `serviceName`, `YYYY-MM-DD` `startDate`/`endDate`,
 * and optional `notificationLeadTimeDays` in `[1, 30]`.
 *
 * @param {unknown} body - Parsed JSON request body.
 * @returns {string[]} List of validation error messages; empty if valid.
 */
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

/**
 * Validates the `POST /billing-events` confirmation payload.
 * Enforces `subscriptionId`, `paymentStatus` (`'paid'` | `'skipped'`), and `YYYY-MM-DD` `dateConfirmed`.
 *
 * @param {unknown} body - Parsed JSON request body.
 * @returns {string[]} List of validation error messages; empty if valid.
 */
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

/**
 * Validates the `PUT /settings` update payload.
 * Both `renewalLeadTimeDays` and `trialLeadTimeDays` are optional, but when present
 * must be integers in `[1, 30]`.
 *
 * @param {unknown} body - Parsed JSON request body.
 * @returns {string[]} List of validation error messages; empty if valid.
 */
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

/**
 * Validates the `POST /system/import` backup snapshot payload (FR-06.3, NFR-05).
 * Requires `version === '1.0.0'` and array types for optional collection keys.
 *
 * @param {unknown} body - Parsed JSON backup snapshot.
 * @returns {string[]} List of validation error messages; empty if valid.
 */
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


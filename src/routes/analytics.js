/**
 * @module routes/analytics
 * HTTP route handlers for `/analytics` spend aggregation in UAH (FR-04.1..FR-04.3).
 */

/**
 * Registers analytics routes on the router:
 * - `GET /analytics/summary` (returns monthly/annual spend totals across active subscriptions only).
 *
 * @param {import('../utils/router.js').Router} router - Application HTTP router.
 * @param {object} context - Shared route dependencies (`store`, `sendJson`).
 * @returns {void}
 */
export function registerAnalyticsRoutes(router, { store, sendJson }) {
  // GET /analytics/summary
  router.get('/analytics/summary', (req, res) => {
    const summary = store.getAnalyticsSummary();
    return sendJson(res, 200, summary);
  });
}


export function registerAnalyticsRoutes(router, { store, sendJson }) {
  // GET /analytics/summary
  router.get('/analytics/summary', (req, res) => {
    const summary = store.getAnalyticsSummary();
    return sendJson(res, 200, summary);
  });
}


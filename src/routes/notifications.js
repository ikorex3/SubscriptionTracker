/**
 * @module routes/notifications
 * HTTP route handlers for `/notifications` retrieval and dismissal (FR-05.4..FR-05.7).
 */

/**
 * Registers notification routes on the router:
 * - `GET /notifications` (optional `?type=` and `?dismissed=true` filters)
 * - `PATCH /notifications/:id/dismiss` (returns `200`, `404`, or `409 RESOURCE_CONFLICT` if already dismissed)
 *
 * @param {import('../utils/router.js').Router} router - Application HTTP router.
 * @param {object} context - Shared route dependencies (`store`, `logger`, `sendJson`, `sendError`).
 * @returns {void}
 */
export function registerNotificationRoutes(router, { store, logger, sendJson, sendError }) {
  // GET /notifications
  router.get('/notifications', (req, res, { urlObj }) => {
    const type = urlObj.searchParams.get('type') || undefined;
    const dismissed = urlObj.searchParams.get('dismissed') === 'true';
    const list = store.listNotifications(type, dismissed);
    return sendJson(res, 200, list);
  });

  // PATCH /notifications/:id/dismiss
  router.patch('/notifications/:id/dismiss', (req, res, { params }) => {
    const result = store.dismissNotification(params.id);
    if (result.notFound) {
      return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Notification with ID ${params.id} was not found.`);
    }
    if (result.conflict) {
      return sendError(res, 409, 'RESOURCE_CONFLICT', 'Notification is already dismissed.');
    }

    logger.logAction('DISMISS_NOTIFICATION', 'Notification', { id: params.id });
    return sendJson(res, 200, result.notification);
  });
}


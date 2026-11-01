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


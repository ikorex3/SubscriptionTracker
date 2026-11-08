import { validateSubscriptionCreate, validateSubscriptionStatusFilter } from '../domain/validation.js';

export function registerSubscriptionRoutes(router, { store, logger, sendJson, sendError, parseBody }) {
  // GET /subscriptions?status=active|cancelled|all (CHG-01)
  router.get('/subscriptions', (req, res, { urlObj }) => {
    const status = urlObj.searchParams.has('status') ? urlObj.searchParams.get('status') : undefined;
    const errors = validateSubscriptionStatusFilter(status);
    if (errors.length > 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', errors[0], errors);
    }
    return sendJson(res, 200, store.listSubscriptions(status));
  });

  // POST /subscriptions
  router.post('/subscriptions', async (req, res) => {
    let body;
    try {
      body = await parseBody(req);
    } catch {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed JSON payload');
    }

    const errors = validateSubscriptionCreate(body);
    if (errors.length > 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', errors[0], errors);
    }

    const sub = store.createSubscription(body);
    logger.logAction('CREATE_SUBSCRIPTION', 'Subscription', { id: sub.id, serviceName: sub.serviceName });
    return sendJson(res, 201, sub);
  });

  // GET /subscriptions/:id/billing-events
  router.get('/subscriptions/:id/billing-events', (req, res, { params }) => {
    const sub = store.getSubscription(params.id);
    if (!sub) {
      return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Subscription with ID ${params.id} was not found.`);
    }
    const events = store.listBillingEvents(params.id);
    return sendJson(res, 200, events);
  });

  // GET /subscriptions/:id
  router.get('/subscriptions/:id', (req, res, { params }) => {
    const sub = store.getSubscription(params.id);
    if (!sub) {
      return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Subscription with ID ${params.id} was not found.`);
    }
    return sendJson(res, 200, sub);
  });

  // PUT /subscriptions/:id
  router.put('/subscriptions/:id', async (req, res, { params }) => {
    let body;
    try {
      body = await parseBody(req);
    } catch {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed JSON payload');
    }

    const updated = store.updateSubscription(params.id, body);
    if (!updated) {
      return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Subscription with ID ${params.id} was not found.`);
    }
    logger.logAction('UPDATE_SUBSCRIPTION', 'Subscription', { id: params.id, updates: body });
    return sendJson(res, 200, updated);
  });

  // DELETE /subscriptions/:id (soft delete)
  router.delete('/subscriptions/:id', (req, res, { params }) => {
    const result = store.cancelSubscription(params.id);
    if (result.notFound) {
      return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Subscription with ID ${params.id} was not found.`);
    }
    if (result.conflict) {
      return sendError(res, 409, 'RESOURCE_CONFLICT', 'Subscription is already cancelled.');
    }
    logger.logAction('CANCEL_SUBSCRIPTION', 'Subscription', { id: params.id });
    return sendJson(res, 200, result.subscription);
  });
}


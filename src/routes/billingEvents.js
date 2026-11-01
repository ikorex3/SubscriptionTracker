import { validateBillingEventCreate } from '../domain/validation.js';

export function registerBillingEventRoutes(router, { store, logger, sendJson, sendError, parseBody }) {
  // GET /billing-events
  router.get('/billing-events', (req, res, { urlObj }) => {
    const subId = urlObj.searchParams.get('subscriptionId') || undefined;
    const status = urlObj.searchParams.get('paymentStatus') || undefined;
    const sort = urlObj.searchParams.get('sort') || 'desc';
    const list = store.listBillingEvents(subId, status, sort);
    return sendJson(res, 200, list);
  });

  // POST /billing-events
  router.post('/billing-events', async (req, res) => {
    let body;
    try {
      body = await parseBody(req);
    } catch {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed JSON payload');
    }

    const errors = validateBillingEventCreate(body);
    if (errors.length > 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', errors[0], errors);
    }

    const result = store.confirmBillingEvent(body);
    if (result.notFound) {
      return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Subscription ${body.subscriptionId} was not found.`);
    }
    if (result.billingNotDue) {
      return sendError(res, 400, 'BILLING_NOT_DUE', result.message);
    }
    if (result.invalid) {
      return sendError(res, 400, 'VALIDATION_ERROR', result.message);
    }

    logger.logAction('CONFIRM_BILLING_EVENT', 'BillingEvent', {
      id: result.event.id,
      subscriptionId: body.subscriptionId,
      status: body.paymentStatus
    });
    return sendJson(res, 201, result.event);
  });

  // GET /billing-events/:id
  router.get('/billing-events/:id', (req, res, { params }) => {
    const event = store.getBillingEvent(params.id);
    if (!event) {
      return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Billing event with ID ${params.id} was not found.`);
    }
    return sendJson(res, 200, event);
  });
}


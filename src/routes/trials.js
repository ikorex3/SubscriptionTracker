import { validateTrialCreate } from '../domain/validation.js';

export function registerTrialRoutes(router, { store, logger, sendJson, sendError, parseBody }) {
  // GET /trials
  router.get('/trials', (req, res, { urlObj }) => {
    const status = urlObj.searchParams.get('status') || undefined;
    const list = store.listTrials(status);
    return sendJson(res, 200, list);
  });

  // POST /trials
  router.post('/trials', async (req, res) => {
    let body;
    try {
      body = await parseBody(req);
    } catch {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed JSON payload');
    }

    const errors = validateTrialCreate(body);
    if (errors.length > 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', errors[0], errors);
    }

    if (body.linkedSubscriptionId) {
      const linkedSub = store.getSubscription(body.linkedSubscriptionId);
      if (!linkedSub) {
        return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Linked subscription ${body.linkedSubscriptionId} not found.`);
      }
    }

    const trial = store.createTrial(body);
    logger.logAction('CREATE_TRIAL', 'Trial', { id: trial.id, serviceName: trial.serviceName });
    return sendJson(res, 201, trial);
  });

  // GET /trials/:id
  router.get('/trials/:id', (req, res, { params }) => {
    const trial = store.getTrial(params.id);
    if (!trial) {
      return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Trial with ID ${params.id} was not found.`);
    }
    return sendJson(res, 200, trial);
  });

  // PUT /trials/:id
  router.put('/trials/:id', async (req, res, { params }) => {
    let body;
    try {
      body = await parseBody(req);
    } catch {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed JSON payload');
    }

    const updated = store.updateTrial(params.id, body);
    if (!updated) {
      return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Trial with ID ${params.id} was not found.`);
    }
    logger.logAction('UPDATE_TRIAL', 'Trial', { id: params.id, updates: body });
    return sendJson(res, 200, updated);
  });

  // PATCH /trials/:id/resolve
  router.patch('/trials/:id/resolve', async (req, res, { params }) => {
    let body;
    try {
      body = await parseBody(req);
    } catch {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed JSON payload');
    }

    if (!body || !['convert', 'cancel'].includes(body.action)) {
      return sendError(res, 400, 'VALIDATION_ERROR', "Action must be 'convert' or 'cancel'.");
    }

    const result = store.resolveTrial(params.id, body.action);
    if (result.notFound) {
      return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Trial with ID ${params.id} was not found.`);
    }
    if (result.invalidStatus) {
      return sendError(res, 400, 'INVALID_STATUS_TRANSITION', "Only trials with status 'expired' can be resolved.");
    }

    logger.logAction('RESOLVE_TRIAL', 'Trial', { id: params.id, action: body.action });
    return sendJson(res, 200, result.trial);
  });
}


import { validateSettingsUpdate } from '../domain/validation.js';

export function registerSettingsRoutes(router, { store, logger, sendJson, sendError, parseBody }) {
  // GET /settings
  router.get('/settings', (req, res) => {
    return sendJson(res, 200, store.getSettings());
  });

  // PUT /settings
  router.put('/settings', async (req, res) => {
    let body;
    try {
      body = await parseBody(req);
    } catch {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Malformed JSON payload');
    }

    const errors = validateSettingsUpdate(body);
    if (errors.length > 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', errors[0], errors);
    }

    const updated = store.updateSettings(body);
    logger.logAction('UPDATE_SETTINGS', 'Settings', body);
    return sendJson(res, 200, updated);
  });
}


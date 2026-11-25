/**
 * @module routes/settings
 * HTTP route handlers for `/settings` global notification lead-time configuration (FR-05.1, FR-05.2).
 */
import { validateSettingsUpdate } from '../domain/validation.js';

/**
 * Registers settings routes on the router:
 * - `GET /settings` (`200`)
 * - `PUT /settings` (validates integer lead times in `[1, 30]`; returns `200` or `400 VALIDATION_ERROR`)
 *
 * @param {import('../utils/router.js').Router} router - Application HTTP router.
 * @param {object} context - Shared route dependencies (`store`, `logger`, `sendJson`, `sendError`, `parseBody`).
 * @returns {void}
 */
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


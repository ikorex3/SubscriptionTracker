/**
 * @module routes/system
 * HTTP route handlers for `/system` startup evaluation and JSON backup export/import (FR-06.2..FR-06.4, NFR-05, NFR-06).
 */
import { validateImportData } from '../domain/validation.js';

/**
 * Registers system-level operation routes on the router:
 * - `POST /system/startup-check` (`200` — detects expired trials, overdue subscriptions, and generates alerts)
 * - `GET /system/export` (`200` — returns full `'1.0.0'` JSON snapshot)
 * - `POST /system/import` (`200` or `400 INVALID_IMPORT_SCHEMA` — destructively replaces store state)
 *
 * @param {Router} router - Application HTTP router.
 * @param {object} context - Shared route dependencies (`store`, `logger`, `sendJson`, `sendError`, `parseBody`).
 * @returns {void}
 */
export function registerSystemRoutes(router, { store, logger, sendJson, sendError, parseBody }) {
  // POST /system/startup-check
  router.post('/system/startup-check', (req, res) => {
    const result = store.runStartupCheck();
    logger.logAction('SYSTEM_STARTUP_CHECK', 'System', {
      expiredTrials: result.newlyExpiredTrials.length,
      overdueSubs: result.overdueSubscriptions.length
    });
    return sendJson(res, 200, result);
  });

  // GET /system/export
  router.get('/system/export', (req, res) => {
    const snapshot = store.exportData();
    logger.logAction('EXPORT_DATA', 'System', { version: snapshot.version });
    return sendJson(res, 200, snapshot);
  });

  // POST /system/import
  router.post('/system/import', async (req, res) => {
    let body;
    try {
      body = await parseBody(req);
    } catch {
      return sendError(res, 400, 'INVALID_IMPORT_SCHEMA', 'Malformed JSON payload');
    }

    const errors = validateImportData(body);
    if (errors.length > 0) {
      return sendError(res, 400, 'INVALID_IMPORT_SCHEMA', errors[0], errors);
    }

    const result = store.importData(body);
    logger.logAction('IMPORT_DATA', 'System', { version: body.version });
    return sendJson(res, 200, result);
  });
}


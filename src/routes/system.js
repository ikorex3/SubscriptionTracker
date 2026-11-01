import { validateImportData } from '../domain/validation.js';

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


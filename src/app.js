/**
 * Subscription Tracker REST API HTTP Application.
 * Modular architecture with OpenAPI 3.0.3 compliance and request/action logging.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store } from './domain/store.js';
import { Logger } from './utils/logger.js';
import { Router } from './utils/router.js';
import { registerSubscriptionRoutes } from './routes/subscriptions.js';
import { registerTrialRoutes } from './routes/trials.js';
import { registerBillingEventRoutes } from './routes/billingEvents.js';
import { registerAnalyticsRoutes } from './routes/analytics.js';
import { registerNotificationRoutes } from './routes/notifications.js';
import { registerSettingsRoutes } from './routes/settings.js';
import { registerSystemRoutes } from './routes/system.js';

export function createApp(options = {}) {
  const store = options.store || new Store();
  const logger = options.logger || new Logger({ inMemory: options.inMemory ?? false });
  const enableLogging = options.enableLogging ?? true;

  function sendJson(res, statusCode, payload) {
    const json = JSON.stringify(payload);
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(json)
    });
    res.end(json);
  }

  function sendError(res, statusCode, code, message, details = []) {
    const errorBody = {
      code,
      message,
      timestamp: new Date().toISOString()
    };
    if (details.length > 0) {
      errorBody.details = details;
    }
    sendJson(res, statusCode, errorBody);
  }

  async function parseBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        if (!body.trim()) {
          resolve({});
          return;
        }
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch {
          reject(new Error('Invalid JSON format'));
        }
      });
      req.on('error', reject);
    });
  }

  // Configure modular router
  const router = new Router();
  const routeContext = { store, logger, sendJson, sendError, parseBody };

  registerSubscriptionRoutes(router, routeContext);
  registerTrialRoutes(router, routeContext);
  registerBillingEventRoutes(router, routeContext);
  registerAnalyticsRoutes(router, routeContext);
  registerNotificationRoutes(router, routeContext);
  registerSettingsRoutes(router, routeContext);
  registerSystemRoutes(router, routeContext);

  const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
  const staticAssets = new Map([
    ['/', { file: 'index.html', contentType: 'text/html; charset=utf-8' }],
    ['/index.html', { file: 'index.html', contentType: 'text/html; charset=utf-8' }],
    ['/styles.css', { file: 'styles.css', contentType: 'text/css; charset=utf-8' }],
    ['/app.js', { file: 'app.js', contentType: 'text/javascript; charset=utf-8' }]
  ]);

  const server = http.createServer(async (req, res) => {
    const startTime = performance.now();
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = urlObj.pathname;
    const method = req.method.toUpperCase();

    res.on('finish', () => {
      if (enableLogging) {
        const durationMs = performance.now() - startTime;
        logger.logRequest({
          method,
          url: pathname,
          statusCode: res.statusCode,
          durationMs
        });
      }
    });

    try {
      if (method === 'GET' && staticAssets.has(pathname)) {
        const asset = staticAssets.get(pathname);
        const filePath = path.join(publicDir, asset.file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath);
          res.writeHead(200, {
            'Content-Type': asset.contentType,
            'Content-Length': content.length
          });
          res.end(content);
          return;
        }
      }

      const match = router.match(method, pathname);
      if (match) {
        return await match.handler(req, res, { params: match.params, urlObj });
      }

      return sendError(res, 404, 'RESOURCE_NOT_FOUND', `Route ${method} ${pathname} not found.`);
    } catch (err) {
      return sendError(res, 500, 'INTERNAL_ERROR', err.message || 'Internal Server Error');
    }
  });

  return server;
}

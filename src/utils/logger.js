/**
 * Request and Business Action Logger for Subscription Tracker REST API.
 */
import fs from 'node:fs';
import path from 'node:path';

export class Logger {
  constructor(options = {}) {
    this.inMemory = options.inMemory ?? false;
    this.logDir = options.logDir || path.resolve(process.cwd(), 'logs');
    this.requestLogFile = path.join(this.logDir, 'api_requests.log');
    this.actionLogFile = path.join(this.logDir, 'api_actions.log');

    this.requestLogs = [];
    this.actionLogs = [];

    if (!this.inMemory) {
      try {
        if (!fs.existsSync(this.logDir)) {
          fs.mkdirSync(this.logDir, { recursive: true });
        }
      } catch {
        // Fallback to in-memory if file system is inaccessible
        this.inMemory = true;
      }
    }
  }

  logRequest({ method, url, statusCode, durationMs, ip = '127.0.0.1' }) {
    const entry = {
      timestamp: new Date().toISOString(),
      method: method.toUpperCase(),
      url,
      statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip
    };

    this.requestLogs.push(entry);

    if (!this.inMemory) {
      try {
        fs.appendFileSync(this.requestLogFile, JSON.stringify(entry) + '\n', 'utf-8');
      } catch {
        // Silently keep in-memory
      }
    }
    return entry;
  }

  logAction(action, entity, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      entity,
      details
    };

    this.actionLogs.push(entry);

    if (!this.inMemory) {
      try {
        fs.appendFileSync(this.actionLogFile, JSON.stringify(entry) + '\n', 'utf-8');
      } catch {
        // Silently keep in-memory
      }
    }
    return entry;
  }

  getRequestLogs() {
    return [...this.requestLogs];
  }

  getActionLogs() {
    return [...this.actionLogs];
  }

  clear() {
    this.requestLogs = [];
    this.actionLogs = [];
  }
}

export const defaultLogger = new Logger();


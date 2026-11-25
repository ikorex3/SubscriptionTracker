/**
 * @module utils/logger
 * Structured JSON-lines logger for HTTP requests and domain business actions.
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * Records HTTP request metrics and domain action audit entries.
 * Persists entries to NDJSON files under `logDir` unless `inMemory` is enabled
 * or the filesystem is inaccessible (automatic in-memory fallback).
 */
export class Logger {
  /**
   * @param {object} [options={}] - Logger configuration.
   * @param {boolean} [options.inMemory=false] - When `true`, skips disk writes (recommended for tests).
   * @param {string} [options.logDir] - Directory for `api_requests.log` and `api_actions.log`.
   */
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

  /**
   * Logs a completed HTTP request with method, path, status code, and latency.
   * Side effect: appends JSON line to `api_requests.log` when file logging is active.
   *
   * @param {object} data - Request telemetry.
   * @param {string} data.method - HTTP verb (normalized to uppercase).
   * @param {string} data.url - Request pathname.
   * @param {number} data.statusCode - HTTP response status code.
   * @param {number} data.durationMs - Elapsed request duration in milliseconds.
   * @param {string} [data.ip='127.0.0.1'] - Client IP address.
   * @returns {object} Recorded request log entry.
   */
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

  /**
   * Logs a domain-level business action for auditability.
   * Side effect: appends JSON line to `api_actions.log` when file logging is active.
   *
   * @param {string} action - `UPPER_SNAKE_CASE` action identifier (e.g., `'CREATE_SUBSCRIPTION'`).
   * @param {string} entity - Domain entity name (e.g., `'Subscription'`, `'Trial'`).
   * @param {object} [details={}] - Contextual metadata (IDs, updated fields, etc.).
   * @returns {object} Recorded action log entry.
   */
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

  /**
   * Returns a shallow copy of all recorded HTTP request log entries.
   * @returns {object[]}
   */
  getRequestLogs() {
    return [...this.requestLogs];
  }

  /**
   * Returns a shallow copy of all recorded domain action log entries.
   * @returns {object[]}
   */
  getActionLogs() {
    return [...this.actionLogs];
  }

  /**
   * Clears in-memory request and action log buffers (does not truncate log files on disk).
   * @returns {void}
   */
  clear() {
    this.requestLogs = [];
    this.actionLogs = [];
  }
}

/**
 * Shared default logger instance writing to `<cwd>/logs`.
 * @type {Logger}
 */
export const defaultLogger = new Logger();


/**
 * @module utils/router
 * Lightweight zero-dependency HTTP pattern-matching router.
 * Supports exact paths and `:param` segments matching `[a-zA-Z0-9-]+`.
 */

/**
 * Stores route definitions and resolves incoming HTTP `(method, pathname)` pairs.
 * Routes are evaluated in registration order; first match wins.
 */
export class Router {
  constructor() {
    this.routes = [];
  }

  /**
   * Registers a route handler for the given HTTP method and path pattern.
   *
   * @param {string} method - HTTP verb (case-insensitive, stored uppercase).
   * @param {string} pattern - Path pattern (e.g., `'/subscriptions/:id'`).
   * @param {Function} handler - Async or sync route handler `(req, res, context) => void`.
   * @returns {void}
   */
  add(method, pattern, handler) {
    const paramNames = [];
    const regexPattern = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return '([a-zA-Z0-9-]+)';
    });
    const regex = new RegExp(`^${regexPattern}$`);
    this.routes.push({
      method: method.toUpperCase(),
      regex,
      paramNames,
      handler
    });
  }

  /** @param {string} pattern @param {Function} handler @returns {void} */
  get(pattern, handler) {
    this.add('GET', pattern, handler);
  }

  /** @param {string} pattern @param {Function} handler @returns {void} */
  post(pattern, handler) {
    this.add('POST', pattern, handler);
  }

  /** @param {string} pattern @param {Function} handler @returns {void} */
  put(pattern, handler) {
    this.add('PUT', pattern, handler);
  }

  /** @param {string} pattern @param {Function} handler @returns {void} */
  patch(pattern, handler) {
    this.add('PATCH', pattern, handler);
  }

  /** @param {string} pattern @param {Function} handler @returns {void} */
  delete(pattern, handler) {
    this.add('DELETE', pattern, handler);
  }

  /**
   * Finds the first registered route matching `method` and `pathname`.
   *
   * @param {string} method - HTTP request method.
   * @param {string} pathname - URL pathname without query string.
   * @returns {{ handler: Function, params: Record<string, string> } | null} Match result or `null`.
   */
  match(method, pathname) {
    const upperMethod = method.toUpperCase();
    for (const route of this.routes) {
      if (route.method === upperMethod) {
        const match = pathname.match(route.regex);
        if (match) {
          const params = {};
          route.paramNames.forEach((name, idx) => {
            params[name] = match[idx + 1];
          });
          return { handler: route.handler, params };
        }
      }
    }
    return null;
  }
}


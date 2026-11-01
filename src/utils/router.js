/**
 * Lightweight HTTP Pattern-matching Router.
 * Supports exact paths and parameterized segments (e.g., :id).
 */

export class Router {
  constructor() {
    this.routes = [];
  }

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

  get(pattern, handler) {
    this.add('GET', pattern, handler);
  }

  post(pattern, handler) {
    this.add('POST', pattern, handler);
  }

  put(pattern, handler) {
    this.add('PUT', pattern, handler);
  }

  patch(pattern, handler) {
    this.add('PATCH', pattern, handler);
  }

  delete(pattern, handler) {
    this.add('DELETE', pattern, handler);
  }

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


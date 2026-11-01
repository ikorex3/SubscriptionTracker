/**
 * Entry point for Subscription Tracker REST API server.
 */
import { createApp } from './app.js';

const PORT = process.env.PORT || 4010;
const app = createApp({ inMemory: false, enableLogging: true });

app.listen(PORT, () => {
  console.log(`[Subscription Tracker API] Server listening on http://localhost:${PORT}`);
  console.log(`[Subscription Tracker API] OpenAPI specification loaded from openapi.yaml`);
});


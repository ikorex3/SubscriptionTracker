import test from 'node:test';
import assert from 'node:assert/strict';
import { Logger } from '../src/utils/logger.js';

test('Unit Tests: Action and Request Logger', async (t) => {
  await t.test('Logger logs incoming HTTP requests with method, path, and status', () => {
    const logger = new Logger({ inMemory: true });
    logger.logRequest({
      method: 'GET',
      url: '/subscriptions',
      statusCode: 200,
      durationMs: 4.2
    });

    const logs = logger.getRequestLogs();
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].method, 'GET');
    assert.strictEqual(logs[0].url, '/subscriptions');
    assert.strictEqual(logs[0].statusCode, 200);
    assert.ok(logs[0].timestamp);
  });

  await t.test('Logger logs domain business actions with action name, entity, and payload metadata', () => {
    const logger = new Logger({ inMemory: true });
    logger.logAction('CREATE_SUBSCRIPTION', 'Subscription', {
      id: 'sub-123',
      serviceName: 'Netflix',
      cost: 199.00
    });

    const actions = logger.getActionLogs();
    assert.strictEqual(actions.length, 1);
    assert.strictEqual(actions[0].action, 'CREATE_SUBSCRIPTION');
    assert.strictEqual(actions[0].entity, 'Subscription');
    assert.strictEqual(actions[0].details.id, 'sub-123');
    assert.ok(actions[0].timestamp);
  });
});


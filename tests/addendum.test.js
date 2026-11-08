import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { Store } from '../src/domain/store.js';
import * as validation from '../src/domain/validation.js';

// Namespace import keeps each test failing individually (instead of one link-time
// SyntaxError) while the validator does not exist yet.
const validateSubscriptionStatusFilter = (value) => validation.validateSubscriptionStatusFilter(value);

// CHG-01: optional status filter (active | cancelled | all) for GET /subscriptions
// See spec/SPEC_ADDENDUM.md (AC-01 .. AC-07)

const sampleSub = (name) => ({
  serviceName: name,
  cost: 100,
  billingIntervalType: 'monthly',
  firstBillingDate: '2026-10-01'
});

test('CHG-01 Unit: validateSubscriptionStatusFilter', async (t) => {
  await t.test('accepts undefined (parameter omitted)', () => {
    assert.deepStrictEqual(validateSubscriptionStatusFilter(undefined), []);
  });

  for (const value of ['active', 'cancelled', 'all']) {
    await t.test(`accepts "${value}"`, () => {
      assert.deepStrictEqual(validateSubscriptionStatusFilter(value), []);
    });
  }

  for (const value of ['paused', 'Active', 'ALL', '']) {
    await t.test(`rejects "${value}"`, () => {
      const errors = validateSubscriptionStatusFilter(value);
      assert.strictEqual(errors.length, 1);
      assert.match(errors[0], /status/);
    });
  }
});

test('CHG-01 Unit: Store.listSubscriptions status filter', async (t) => {
  const store = new Store();
  const a = store.createSubscription(sampleSub('A'));
  store.createSubscription(sampleSub('B'));
  store.cancelSubscription(a.id);

  await t.test('"all" returns every subscription', () => {
    assert.strictEqual(store.listSubscriptions('all').length, 2);
  });

  await t.test('undefined returns every subscription', () => {
    assert.strictEqual(store.listSubscriptions(undefined).length, 2);
  });

  await t.test('"active" returns only active', () => {
    const list = store.listSubscriptions('active');
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].serviceName, 'B');
  });

  await t.test('"cancelled" returns only cancelled', () => {
    const list = store.listSubscriptions('cancelled');
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].serviceName, 'A');
  });
});

test('CHG-01 Contract: GET /subscriptions?status=', async (t) => {
  const server = createApp({ inMemory: true, enableLogging: false });
  server.listen(0);
  await new Promise((resolve) => server.on('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const post = async (body) => {
    const res = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  };
  const list = async (query = '') => {
    const res = await fetch(`${baseUrl}/subscriptions${query}`);
    return { status: res.status, body: await res.json() };
  };

  // AC-06 first: empty store, filters yield [] (not 404)
  await t.test('AC-06: no match returns 200 and empty array', async () => {
    for (const q of ['?status=active', '?status=cancelled', '?status=all', '']) {
      const { status, body } = await list(q);
      assert.strictEqual(status, 200);
      assert.deepStrictEqual(body, []);
    }
  });

  const s1 = await post(sampleSub('Netflix'));
  await post(sampleSub('Spotify'));
  const s3 = await post(sampleSub('Adobe'));
  await fetch(`${baseUrl}/subscriptions/${s1.id}`, { method: 'DELETE' });
  await fetch(`${baseUrl}/subscriptions/${s3.id}`, { method: 'DELETE' });

  await t.test('AC-01: status=active returns only active', async () => {
    const { status, body } = await list('?status=active');
    assert.strictEqual(status, 200);
    assert.strictEqual(body.length, 1);
    assert.ok(body.every((s) => s.status === 'active'));
  });

  await t.test('AC-02: status=cancelled returns only cancelled', async () => {
    const { status, body } = await list('?status=cancelled');
    assert.strictEqual(status, 200);
    assert.strictEqual(body.length, 2);
    assert.ok(body.every((s) => s.status === 'cancelled'));
    assert.ok(body.some((s) => s.id === s1.id));
  });

  await t.test('AC-03: status=all returns active and cancelled', async () => {
    const { status, body } = await list('?status=all');
    assert.strictEqual(status, 200);
    assert.strictEqual(body.length, 3);
    assert.ok(body.some((s) => s.status === 'active'));
    assert.ok(body.some((s) => s.status === 'cancelled'));
  });

  await t.test('AC-04: omitted status equals status=all', async () => {
    const withAll = await list('?status=all');
    const without = await list('');
    assert.strictEqual(without.status, 200);
    assert.deepStrictEqual(without.body, withAll.body);
  });

  for (const q of ['?status=paused', '?status=Active', '?status=']) {
    await t.test(`AC-05: ${q} returns 400 VALIDATION_ERROR`, async () => {
      const { status, body } = await list(q);
      assert.strictEqual(status, 400);
      assert.strictEqual(body.code, 'VALIDATION_ERROR');
      assert.ok(body.message);
      assert.ok(body.timestamp);
    });
  }

  await t.test('AC-07: filtering is read-only (idempotent)', async () => {
    const first = await list('?status=cancelled');
    const second = await list('?status=cancelled');
    assert.deepStrictEqual(second.body, first.body);
    const all = await list('?status=all');
    assert.strictEqual(all.body.length, 3);
  });
});

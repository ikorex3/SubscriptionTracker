import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('Contract Tests: REST API Endpoints (OpenAPI 3.0.3 Verification)', async (t) => {
  let server;
  let baseUrl;
  let app;

  t.before(async () => {
    app = createApp({ inMemory: true, enableLogging: false });
    server = app.listen(0);
    await new Promise((resolve) => server.on('listening', resolve));
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  t.after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  let createdSubscriptionId;
  let createdTrialId;
  let createdBillingEventId;
  let createdNotificationId;

  // ────────────────────────────────────────────────────────────────────────────
  // POSITIVE CONTRACT TESTS (P-01 - P-13)
  // ────────────────────────────────────────────────────────────────────────────

  await t.test('P-01: POST /subscriptions -> 201 Created (FR-01.1, FR-01.4, FR-01.5)', async () => {
    const res = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceName: 'Netflix',
        cost: 199.00,
        billingIntervalType: 'monthly',
        firstBillingDate: '2026-10-01',
        notificationLeadTimeDays: 5
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.ok(body.id, 'Expected subscription ID');
    assert.strictEqual(body.serviceName, 'Netflix');
    assert.strictEqual(body.cost, 199.00);
    assert.strictEqual(body.currency, 'UAH');
    assert.strictEqual(body.status, 'active');
    assert.strictEqual(body.nextBillingDate, '2026-10-31');
    assert.strictEqual(body.monthlySpendEstimate, 199.00);
    assert.strictEqual(body.annualSpendEstimate, 2421.17);
    createdSubscriptionId = body.id;
  });

  await t.test('P-02: POST /subscriptions with custom interval -> 201 Created (FR-01.1, FR-01.4, FR-01.5)', async () => {
    const res = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceName: 'Spotify Promo',
        cost: 300.00,
        billingIntervalType: 'custom',
        customIntervalValue: 90,
        customIntervalUnit: 'days',
        firstBillingDate: '2026-10-15'
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.billingIntervalType, 'custom');
    assert.strictEqual(body.customIntervalValue, 90);
    assert.strictEqual(body.customIntervalUnit, 'days');
    assert.strictEqual(body.nextBillingDate, '2027-01-13');
  });

  await t.test('P-03: GET /subscriptions -> 200 OK (with filter) (FR-01.1, FR-01.3, FR-04.3)', async () => {
    const resAll = await fetch(`${baseUrl}/subscriptions`);
    assert.strictEqual(resAll.status, 200);
    const all = await resAll.json();
    assert.ok(Array.isArray(all));
    assert.ok(all.length >= 2);

    const resActive = await fetch(`${baseUrl}/subscriptions?status=active`);
    assert.strictEqual(resActive.status, 200);
    const active = await resActive.json();
    assert.ok(active.every((s) => s.status === 'active'));
  });

  await t.test('P-04: PUT /subscriptions/{id} -> 200 OK (FR-01.2, FR-01.4, FR-01.5)', async () => {
    const res = await fetch(`${baseUrl}/subscriptions/${createdSubscriptionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceName: 'Netflix Premium',
        cost: 249.00
      })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.id, createdSubscriptionId);
    assert.strictEqual(body.serviceName, 'Netflix Premium');
    assert.strictEqual(body.cost, 249.00);
    assert.strictEqual(body.monthlySpendEstimate, 249.00);
  });

  await t.test('P-05: DELETE /subscriptions/{id} -> 200 OK soft delete (FR-01.3)', async () => {
    const res = await fetch(`${baseUrl}/subscriptions/${createdSubscriptionId}`, {
      method: 'DELETE'
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.id, createdSubscriptionId);
    assert.strictEqual(body.status, 'cancelled');

    // Verify it still exists in list but marked cancelled
    const getRes = await fetch(`${baseUrl}/subscriptions/${createdSubscriptionId}`);
    assert.strictEqual(getRes.status, 200);
    const getBody = await getRes.json();
    assert.strictEqual(getBody.status, 'cancelled');
  });

  await t.test('P-06: POST /trials -> 201 Created (FR-02.1, FR-02.2, FR-02.3)', async () => {
    const res = await fetch(`${baseUrl}/trials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceName: 'Adobe CC',
        startDate: '2026-10-15',
        endDate: '2027-01-15',
        notificationLeadTimeDays: 7
      })
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.ok(body.id);
    assert.strictEqual(body.serviceName, 'Adobe CC');
    assert.strictEqual(body.status, 'active');
    assert.strictEqual(body.assumedCost, 0.00);
    assert.strictEqual(body.linkedSubscriptionId, null);
    createdTrialId = body.id;

    // GET /trials/{id}
    const getRes = await fetch(`${baseUrl}/trials/${createdTrialId}`);
    assert.strictEqual(getRes.status, 200);
    const getBody = await getRes.json();
    assert.strictEqual(getBody.id, createdTrialId);
  });

  await t.test('P-07: PATCH /trials/{id}/resolve -> 200 OK (FR-02.5)', async () => {
    // Create an expired trial to resolve
    const trialRes = await fetch(`${baseUrl}/trials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceName: 'GitHub Copilot Trial',
        startDate: '2026-08-01',
        endDate: '2026-09-01'
      })
    });
    const trial = await trialRes.json();

    // Trigger startup check or manually set to expired
    await fetch(`${baseUrl}/system/startup-check`, { method: 'POST' });

    const resolveRes = await fetch(`${baseUrl}/trials/${trial.id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'convert' })
    });

    assert.strictEqual(resolveRes.status, 200);
    const resolvedBody = await resolveRes.json();
    assert.strictEqual(resolvedBody.status, 'converted');
  });

  await t.test('P-08: POST /billing-events -> 201 Created (FR-03.1, FR-03.2, FR-03.4, FR-01.4)', async () => {
    // Create an active subscription where nextBillingDate lands on today
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 30);
    const thirtyDaysAgo = d.toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    const subRes = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceName: 'YouTube Premium',
        cost: 99.00,
        billingIntervalType: 'monthly',
        firstBillingDate: thirtyDaysAgo
      })
    });
    const sub = await subRes.json();

    const billRes = await fetch(`${baseUrl}/billing-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriptionId: sub.id,
        paymentStatus: 'paid',
        dateConfirmed: today
      })
    });

    assert.strictEqual(billRes.status, 201);
    const billBody = await billRes.json();
    assert.ok(billBody.id);
    assert.strictEqual(billBody.subscriptionId, sub.id);
    assert.strictEqual(billBody.paymentStatus, 'paid');
    assert.strictEqual(billBody.amount, 99.00);
    assert.strictEqual(billBody.currency, 'UAH');
    createdBillingEventId = billBody.id;

    // Check GET /billing-events/{id} (NFR-03, FR-03.4)
    const getBill = await fetch(`${baseUrl}/billing-events/${createdBillingEventId}`);
    assert.strictEqual(getBill.status, 200);

    // Check GET /subscriptions/{id}/billing-events
    const getSubBill = await fetch(`${baseUrl}/subscriptions/${sub.id}/billing-events`);
    assert.strictEqual(getSubBill.status, 200);
    const subBills = await getSubBill.json();
    assert.strictEqual(subBills.length, 1);
  });

  await t.test('P-09: GET /analytics/summary -> 200 OK (FR-04.1, FR-04.2, FR-04.3, FR-01.5)', async () => {
    const res = await fetch(`${baseUrl}/analytics/summary`);
    assert.strictEqual(res.status, 200);
    const summary = await res.json();
    assert.strictEqual(summary.currency, 'UAH');
    assert.ok(typeof summary.totalMonthlySpend === 'number');
    assert.ok(typeof summary.totalAnnualSpend === 'number');
    assert.ok(typeof summary.activeSubscriptionCount === 'number');
    assert.ok(summary.calculatedAt);
  });

  await t.test('P-10: PATCH /notifications/{id}/dismiss -> 200 OK (FR-05.5)', async () => {
    // Run startup check to generate notifications if any
    await fetch(`${baseUrl}/system/startup-check`, { method: 'POST' });
    const listRes = await fetch(`${baseUrl}/notifications`);
    assert.strictEqual(listRes.status, 200);
    const notifs = await listRes.json();

    if (notifs.length > 0) {
      createdNotificationId = notifs[0].id;
      const dismissRes = await fetch(`${baseUrl}/notifications/${createdNotificationId}/dismiss`, {
        method: 'PATCH'
      });
      assert.strictEqual(dismissRes.status, 200);
      const dismissed = await dismissRes.json();
      assert.strictEqual(dismissed.isDismissed, true);
      assert.ok(dismissed.dismissedAt);
    }
  });

  await t.test('P-11: GET & PUT /settings -> 200 OK (FR-05.1, FR-05.2, FR-05.3)', async () => {
    const getRes = await fetch(`${baseUrl}/settings`);
    assert.strictEqual(getRes.status, 200);
    const settings = await getRes.json();
    assert.strictEqual(settings.currency, 'UAH');

    const putRes = await fetch(`${baseUrl}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        renewalLeadTimeDays: 5,
        trialLeadTimeDays: 7
      })
    });
    assert.strictEqual(putRes.status, 200);
    const updated = await putRes.json();
    assert.strictEqual(updated.renewalLeadTimeDays, 5);
    assert.strictEqual(updated.trialLeadTimeDays, 7);
  });

  await t.test('P-12: POST /system/startup-check -> 200 OK (FR-02.4, FR-03.3, FR-05.6, FR-05.7)', async () => {
    const res = await fetch(`${baseUrl}/system/startup-check`, { method: 'POST' });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.newlyExpiredTrials));
    assert.ok(Array.isArray(body.overdueSubscriptions));
    assert.ok(typeof body.notificationsGenerated === 'number');
    assert.ok(body.checkedAt);
  });

  await t.test('P-13: GET /system/export & POST /system/import -> 200 OK (FR-06.2, FR-06.3, FR-06.4, NFR-06)', async () => {
    const exportRes = await fetch(`${baseUrl}/system/export`);
    assert.strictEqual(exportRes.status, 200);
    const snapshot = await exportRes.json();
    assert.strictEqual(snapshot.version, '1.0.0');
    assert.ok(Array.isArray(snapshot.subscriptions));
    assert.ok(Array.isArray(snapshot.trials));
    assert.ok(Array.isArray(snapshot.billingEvents));
    assert.ok(Array.isArray(snapshot.notifications));
    assert.ok(snapshot.settings);

    const importRes = await fetch(`${baseUrl}/system/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot)
    });
    assert.strictEqual(importRes.status, 200);
    const importBody = await importRes.json();
    assert.ok(importBody.message);
    assert.ok(importBody.importedAt);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // NEGATIVE CONTRACT TESTS (N-01 - N-08)
  // ────────────────────────────────────────────────────────────────────────────

  await t.test('N-01: POST /subscriptions missing required field -> 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cost: 199.00,
        billingIntervalType: 'monthly'
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.code, 'VALIDATION_ERROR');
    assert.ok(body.message);
    assert.ok(body.timestamp);
  });

  await t.test('N-02: GET /subscriptions/{id} not found -> 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/subscriptions/00000000-0000-0000-0000-000000000000`);
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.code, 'RESOURCE_NOT_FOUND');
    assert.ok(body.message);
  });

  await t.test('N-03: POST /subscriptions invalid enum value -> 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceName: 'Test',
        cost: 100,
        billingIntervalType: 'weekly', // Invalid enum
        firstBillingDate: '2026-10-01'
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.code, 'VALIDATION_ERROR');
  });

  await t.test('N-04: PATCH /trials/{id}/resolve when trial is active -> 400 Bad Request', async () => {
    const activeTrialRes = await fetch(`${baseUrl}/trials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceName: 'Figma Pro Trial',
        startDate: '2026-10-01',
        endDate: '2027-10-01'
      })
    });
    const activeTrial = await activeTrialRes.json();

    const res = await fetch(`${baseUrl}/trials/${activeTrial.id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'convert' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.code, 'INVALID_STATUS_TRANSITION');
  });

  await t.test('N-05: DELETE /subscriptions/{id} already cancelled -> 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/subscriptions/${createdSubscriptionId}`, {
      method: 'DELETE'
    });
    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.strictEqual(body.code, 'RESOURCE_CONFLICT');
  });

  await t.test('N-06: PATCH /notifications/{id}/dismiss already dismissed -> 409 Conflict', async () => {
    if (createdNotificationId) {
      const res = await fetch(`${baseUrl}/notifications/${createdNotificationId}/dismiss`, {
        method: 'PATCH'
      });
      assert.strictEqual(res.status, 409);
      const body = await res.json();
      assert.strictEqual(body.code, 'RESOURCE_CONFLICT');
    }
  });

  await t.test('N-07: POST /billing-events when not due -> 400 Bad Request', async () => {
    // Create a subscription with billing far in the future
    const subRes = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceName: 'Future Cloud',
        cost: 500.00,
        billingIntervalType: 'annual',
        firstBillingDate: '2027-12-01'
      })
    });
    const sub = await subRes.json();

    const res = await fetch(`${baseUrl}/billing-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriptionId: sub.id,
        paymentStatus: 'paid',
        dateConfirmed: '2026-10-28'
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.code, 'BILLING_NOT_DUE');
  });

  await t.test('N-08: POST /system/import with invalid JSON schema -> 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/system/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: '999.0.0', // Incompatible version / invalid schema
        invalidPayload: true
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.code, 'INVALID_IMPORT_SCHEMA');
  });
});

# API Verification Guide — Subscription Tracker REST API
### Lab Work | Architecture Transition: Mock Server & Contract Tests
### Version 1.0 | October 2026

**Source spec:** [`openapi.yaml`](../openapi.yaml) (OpenAPI 3.0.3)  
**SRS baseline:** [`spec/SRS.md`](../spec/SRS.md) v1.0 (GATE-1 Approved)

---

## Part 1 — Running the Mock API Server

### Option A: Prism CLI via npx (Recommended — zero install)

Prism is a standards-compliant OpenAPI mock server by Stoplight.
It reads `openapi.yaml` and serves realistic example responses.

```bash
# From the project root directory (where openapi.yaml lives)
npx @stoplight/prism-cli@4 mock openapi.yaml --port 4010
```

Expected output:
```
[CLI] ...  INFO  Prism is listening on http://127.0.0.1:4010
```

### Verify the server is up

```bash
curl -s http://localhost:4010/subscriptions | head -c 200
```

Expected: JSON array `[]` or a mocked `Subscription` object (Prism returns spec examples).

---

## Part 2 — cURL Contract Test Scenarios

> **Base URL:** `http://localhost:4010` (Prism mock server)  
> **Headers:** All requests use `Content-Type: application/json` and `Accept: application/json`  
> **Note (Windows PowerShell):** Replace `\` line continuations with `` ` `` and wrap JSON bodies in single quotes `'{ ... }'`

---

### ✅ Positive Scenarios (Happy Path)

---

#### P-01 — Create a subscription
**Tests:** FR-01.1 · POST /subscriptions → 201 Created

```bash
curl -s -X POST http://localhost:4010/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "Netflix",
    "cost": 199.00,
    "billingIntervalType": "monthly",
    "firstBillingDate": "2026-10-01",
    "notificationLeadTimeDays": 5
  }'
```

**Expected:** `201 Created` with a `Subscription` object containing:
- `id` (UUID)
- `status: "active"`
- `nextBillingDate` computed server-side
- `annualSpendEstimate: 2388.00`
- `monthlySpendEstimate: 199.00`

---

#### P-02 — Create subscription with custom interval
**Tests:** FR-01.1, FR-01.4, FR-01.5 · POST /subscriptions → 201

```bash
curl -s -X POST http://localhost:4010/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "Spotify (Promo)",
    "cost": 0.00,
    "billingIntervalType": "custom",
    "customIntervalValue": 90,
    "customIntervalUnit": "days",
    "firstBillingDate": "2026-10-15"
  }'
```

**Expected:** `201 Created` · `billingIntervalType: "custom"` · `customIntervalValue: 90`

---

#### P-03 — List all subscriptions (with status filter)
**Tests:** FR-01.3, FR-04.3 · GET /subscriptions → 200

```bash
# List all
curl -s http://localhost:4010/subscriptions

# Filter by active only
curl -s "http://localhost:4010/subscriptions?status=active"
```

**Expected:** `200 OK` with JSON array of `Subscription` objects.

---

#### P-04 — Update a subscription
**Tests:** FR-01.2 · PUT /subscriptions/{id} → 200

```bash
curl -s -X PUT http://localhost:4010/subscriptions/3fa85f64-5717-4562-b3fc-2c963f66afa6 \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "Netflix Premium",
    "cost": 249.00
  }'
```

**Expected:** `200 OK` with updated `Subscription` object.

---

#### P-05 — Cancel a subscription (soft delete)
**Tests:** FR-01.3 · DELETE /subscriptions/{id} → 200

```bash
curl -s -X DELETE http://localhost:4010/subscriptions/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Expected:** `200 OK` · `status: "cancelled"` · record retained with badge.  
**NOT expected:** `204 No Content` (record is preserved, not removed).

---

#### P-06 — Create a free trial (standalone)
**Tests:** FR-02.1, FR-02.2 · POST /trials → 201

```bash
curl -s -X POST http://localhost:4010/trials \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "Adobe CC",
    "startDate": "2026-10-15",
    "endDate": "2027-01-15",
    "notificationLeadTimeDays": 7
  }'
```

**Expected:** `201 Created` · `linkedSubscriptionId: null` · `status: "active"`

---

#### P-07 — Resolve an expired trial (convert)
**Tests:** FR-02.5 · PATCH /trials/{id}/resolve → 200

```bash
curl -s -X PATCH http://localhost:4010/trials/7ab12c34-5678-4def-9012-ab34cd56ef78/resolve \
  -H "Content-Type: application/json" \
  -d '{ "action": "convert" }'
```

**Expected:** `200 OK` · `status: "converted"` · linked subscription status → `"active"`

---

#### P-08 — Confirm a billing event as paid
**Tests:** FR-03.1, FR-03.2, FR-03.4 · POST /billing-events → 201

```bash
curl -s -X POST http://localhost:4010/billing-events \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "paymentStatus": "paid",
    "dateConfirmed": "2026-10-28"
  }'
```

**Expected:** `201 Created` with `BillingEvent` object. Subscription's `nextBillingDate` is recalculated.

---

#### P-09 — Get spend analytics summary
**Tests:** FR-04.1, FR-04.2, FR-04.3 · GET /analytics/summary → 200

```bash
curl -s http://localhost:4010/analytics/summary
```

**Expected:** `200 OK`:
```json
{
  "totalMonthlySpend": 1098.00,
  "totalAnnualSpend": 13176.00,
  "currency": "UAH",
  "activeSubscriptionCount": 3
}
```

---

#### P-10 — Dismiss a notification
**Tests:** FR-05.5 · PATCH /notifications/{id}/dismiss → 200

```bash
curl -s -X PATCH http://localhost:4010/notifications/f1a2b3c4-d5e6-7890-abcd-ef1234567890/dismiss
```

**Expected:** `200 OK` · `isDismissed: true` · `dismissedAt` timestamp populated.

---

#### P-11 — Update global notification settings
**Tests:** FR-05.1, FR-05.2 · PUT /settings → 200

```bash
curl -s -X PUT http://localhost:4010/settings \
  -H "Content-Type: application/json" \
  -d '{
    "renewalLeadTimeDays": 5,
    "trialLeadTimeDays": 7
  }'
```

**Expected:** `200 OK` with updated `Settings` object.

---

#### P-12 — Run startup check
**Tests:** FR-02.4, FR-03.3, FR-05.6 · POST /system/startup-check → 200

```bash
curl -s -X POST http://localhost:4010/system/startup-check
```

**Expected:** `200 OK` with `StartupCheckResult`:
```json
{
  "newlyExpiredTrials": [...],
  "overdueSubscriptions": [...],
  "notificationsGenerated": 2,
  "checkedAt": "2026-10-28T19:00:00Z"
}
```

---

#### P-13 — Export all data
**Tests:** FR-06.2, NFR-06 · GET /system/export → 200

```bash
# Export and save to file
curl -s http://localhost:4010/system/export -o backup.json

# Inspect structure
curl -s http://localhost:4010/system/export | python -m json.tool
```

**Expected:** `200 OK` with `DataExport` object containing all collections + `version` field.

---

### ❌ Negative Scenarios (Error Path)

---

#### N-01 — Create subscription: missing required field
**Tests:** FR-01.1 validation · POST /subscriptions → **400**

```bash
curl -s -X POST http://localhost:4010/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "cost": 199.00,
    "billingIntervalType": "monthly"
  }'
```

**Expected:** `400 Bad Request`
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Required field 'serviceName' is missing.",
  "details": ["Field 'serviceName' is required."],
  "timestamp": "..."
}
```

---

#### N-02 — Get subscription: not found
**Tests:** FR-01.2 · GET /subscriptions/{id} → **404**

```bash
curl -s http://localhost:4010/subscriptions/00000000-0000-0000-0000-000000000000
```

**Expected:** `404 Not Found`
```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "Subscription with ID 00000000-0000-0000-0000-000000000000 was not found.",
  "timestamp": "..."
}
```

---

#### N-03 — Create subscription: invalid enum value
**Tests:** FR-01.1 validation · POST /subscriptions → **400**

```bash
curl -s -X POST http://localhost:4010/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "Test",
    "cost": 100,
    "billingIntervalType": "weekly",
    "firstBillingDate": "2026-10-01"
  }'
```

**Expected:** `400 Bad Request` · `code: "VALIDATION_ERROR"` · detail mentions `billingIntervalType` enum constraint.

---

#### N-04 — Resolve trial: not in expired status
**Tests:** FR-02.5 business rule · PATCH /trials/{id}/resolve → **400**

```bash
curl -s -X PATCH http://localhost:4010/trials/7ab12c34-5678-4def-9012-ab34cd56ef78/resolve \
  -H "Content-Type: application/json" \
  -d '{ "action": "convert" }'
```
*(when trial has status `active`, not `expired`)*

**Expected:** `400 Bad Request`
```json
{
  "code": "INVALID_STATUS_TRANSITION",
  "message": "Only trials with status 'expired' can be resolved.",
  "timestamp": "..."
}
```

---

#### N-05 — Cancel subscription: already cancelled
**Tests:** FR-01.3 business rule · DELETE /subscriptions/{id} → **409**

```bash
curl -s -X DELETE http://localhost:4010/subscriptions/3fa85f64-5717-4562-b3fc-2c963f66afa6
# (called a second time on an already-cancelled subscription)
```

**Expected:** `409 Conflict`
```json
{
  "code": "RESOURCE_CONFLICT",
  "message": "Subscription is already cancelled.",
  "timestamp": "..."
}
```

---

#### N-06 — Dismiss notification: already dismissed
**Tests:** FR-05.5 · PATCH /notifications/{id}/dismiss → **409**

```bash
curl -s -X PATCH http://localhost:4010/notifications/f1a2b3c4-d5e6-7890-abcd-ef1234567890/dismiss
# (called a second time)
```

**Expected:** `409 Conflict` · `code: "RESOURCE_CONFLICT"`

---

#### N-07 — Confirm billing: subscription not due
**Tests:** FR-03.1, FR-03.2 · POST /billing-events → **400**

```bash
curl -s -X POST http://localhost:4010/billing-events \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "paymentStatus": "paid",
    "dateConfirmed": "2026-10-28"
  }'
# (when nextBillingDate is in the future — no billing event is due)
```

**Expected:** `400 Bad Request`
```json
{
  "code": "BILLING_NOT_DUE",
  "message": "No billing event is currently due for this subscription.",
  "timestamp": "..."
}
```

---

#### N-08 — Import: invalid schema
**Tests:** FR-06.3, NFR-05 · POST /system/import → **400**

```bash
curl -s -X POST http://localhost:4010/system/import \
  -H "Content-Type: application/json" \
  -d '{
    "invalid": "structure",
    "missing": "required fields"
  }'
```

**Expected:** `400 Bad Request`
```json
{
  "code": "INVALID_IMPORT_SCHEMA",
  "message": "Import file is invalid. Required fields 'version', 'subscriptions', 'trials' are missing.",
  "details": [
    "Field 'version' is required.",
    "Field 'subscriptions' is required."
  ],
  "timestamp": "..."
}
```
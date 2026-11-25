# Subscription Tracker — Technical API Reference

**Version:** 1.0.0 · **Specification:** [`openapi.yaml`](../openapi.yaml) (OpenAPI 3.0.3) · **SRS:** [`spec/SRS.md`](../spec/SRS.md)  
**Base URL:** `http://localhost:4010` · **Content-Type:** `application/json; charset=utf-8` · **Currency:** `UAH` (fixed)

---

## 1. Conventions & Error Model

All request and response bodies use JSON. Dates use ISO calendar format (`YYYY-MM-DD`); timestamps use ISO-8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).

### Unified Error Response (`4xx` / `5xx`)

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Human-readable description of the error.",
  "details": ["Optional list of field-level validation errors"],
  "timestamp": "2026-11-25T22:00:00.000Z"
}
```

| Error Code | Typical HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | `400` | Malformed JSON, missing/invalid fields, or invalid query filter |
| `INVALID_STATUS_TRANSITION` | `400` | Attempted an illegal lifecycle transition (e.g. resolving a non-`expired` trial) |
| `BILLING_NOT_DUE` | `400` | Attempted to confirm billing when no payment is currently due |
| `INVALID_IMPORT_SCHEMA` | `400` | Import payload is not valid JSON or lacks `version: "1.0.0"` / valid arrays |
| `RESOURCE_NOT_FOUND` | `404` | Target entity UUID or route does not exist |
| `RESOURCE_CONFLICT` | `409` | Action already applied (cancelling a cancelled subscription, dismissing a dismissed notification) |
| `INTERNAL_ERROR` | `500` | Unexpected server error |

---

## 2. Endpoints by Resource

### 2.1 Subscriptions (`/subscriptions`)

| Method | Path | Purpose | Status Codes | SRS / Addendum |
|---|---|---|---|---|
| `GET` | `/subscriptions` | List subscriptions; optional `?status=active\|cancelled\|all` (omitted = `all`) | `200`, `400`, `500` | FR-01.1, FR-01.3, FR-04.3, CHG-01 |
| `POST` | `/subscriptions` | Create active subscription; computes `nextBillingDate` & spend estimates | `201`, `400`, `500` | FR-01.1, FR-01.4, FR-01.5 |
| `GET` | `/subscriptions/{id}` | Retrieve a subscription by UUID | `200`, `404`, `500` | FR-01.1, FR-01.2 |
| `PUT` | `/subscriptions/{id}` | Partial update; recalculates estimates & `nextBillingDate` if cost/interval changed | `200`, `400`, `404`, `500` | FR-01.2, FR-01.4, FR-01.5 |
| `DELETE` | `/subscriptions/{id}` | **Soft delete**: sets `status: "cancelled"` and retains record | `200`, `404`, `409`, `500` | FR-01.3 |
| `GET` | `/subscriptions/{id}/billing-events` | List immutable billing events for a subscription (`dateConfirmed` desc) | `200`, `404`, `500` | FR-03.4, FR-03.5, NFR-03 |

**Subscription Create Payload (`SubscriptionCreate`):**
- `serviceName` *(string, required, non-empty)*
- `cost` *(number, required, `>= 0`, UAH)*
- `billingIntervalType` *(enum, required: `monthly` | `annual` | `custom`)*
- `customIntervalValue` *(number `> 0`, required when `custom`)*
- `customIntervalUnit` *(enum: `days` | `months`, required when `custom`)*
- `firstBillingDate` *(string `YYYY-MM-DD`, required)*
- `notificationLeadTimeDays` *(integer `1..30`, optional; defaults to global `settings.renewalLeadTimeDays`)*
- Optional runtime fields supported by store: `paymentMethod`, `category`

**Domain Rules:**
- `PUT /subscriptions/{id}` performs partial field merging and validates JSON syntax (`400 VALIDATION_ERROR` on malformed JSON), recalculating `annualSpendEstimate`, `monthlySpendEstimate`, and `nextBillingDate` when cost or interval fields change.
- Monthly = `30` days, Annual = `365` days, Custom = `N` days or `N * 30` days (`FR-01.4`).
- `annualSpendEstimate = round((cost / intervalInDays) * 365, 2)`; `monthlySpendEstimate` = `cost` for `monthly`, otherwise `round(annualSpendEstimate / 12, 2)` (`FR-01.5`).
- `GET /subscriptions?status=` rejects any value outside `active`, `cancelled`, `all` with `400 VALIDATION_ERROR`; empty matches return `200 []` (`CHG-01`).

---

### 2.2 Free Trials (`/trials`)

| Method | Path | Purpose | Status Codes | SRS |
|---|---|---|---|---|
| `GET` | `/trials` | List free trials; optional `?status=` filter | `200`, `500` | FR-02.1, FR-02.2 |
| `POST` | `/trials` | Create active free trial (`assumedCost: 0.00`); verifies `linkedSubscriptionId` if set | `201`, `400`, `404`, `500` | FR-02.1, FR-02.2, FR-02.3 |
| `GET` | `/trials/{id}` | Retrieve a trial by UUID | `200`, `404`, `500` | FR-02.1 |
| `PUT` | `/trials/{id}` | Update mutable trial fields (`status` in body is ignored) | `200`, `400`, `404`, `500` | FR-02.1, FR-02.2 |
| `PATCH` | `/trials/{id}/resolve` | Resolve an `expired` trial via `{ "action": "convert" \| "cancel" }` | `200`, `400`, `404`, `500` | FR-02.5 |

**Trial Lifecycle Rules:**
- New trials start as `active` with `assumedCost: 0.00` (`FR-02.3`).
- `POST /system/startup-check` transitions `active` trials with `today > endDate` to `expired` (`FR-02.4`).
- `PATCH /trials/{id}/resolve` only accepts trials in `expired` status (returns `400 INVALID_STATUS_TRANSITION` otherwise). If `linkedSubscriptionId` is present, `convert` sets the linked subscription to `active` and `cancel` sets it to `cancelled` (`FR-02.5`).

---

### 2.3 Billing Events (`/billing-events`)

| Method | Path | Purpose | Status Codes | SRS |
|---|---|---|---|---|
| `GET` | `/billing-events` | List billing history (`?subscriptionId=`, `?paymentStatus=paid\|skipped`, `?sort=asc\|desc`) | `200`, `500` | FR-03.4, FR-03.5 |
| `POST` | `/billing-events` | Confirm a due/overdue payment (`paid` or `skipped`) | `201`, `400`, `404`, `500` | FR-03.1..FR-03.4, FR-01.4 |
| `GET` | `/billing-events/{id}` | Retrieve a single billing event by UUID | `200`, `404`, `500` | FR-03.5, NFR-03 |

**Immutability & Confirmation Rules:**
- Billing history is **append-only / immutable** (`NFR-03`): no `PUT`, `PATCH`, or `DELETE` routes exist.
- `POST /billing-events` requires `subscription.status === 'active'`, `dateConfirmed <= today`, and `billingDue || overdue || dateConfirmed >= nextBillingDate` (otherwise `400 BILLING_NOT_DUE`).
- Upon confirmation, `subscription.nextBillingDate` advances from `dateConfirmed` and `billingDue` / `overdue` flags are cleared.

---

### 2.4 Analytics (`/analytics`)

| Method | Path | Purpose | Status Codes | SRS |
|---|---|---|---|---|
| `GET` | `/analytics/summary` | Compute `totalMonthlySpend`, `totalAnnualSpend`, `currency: "UAH"`, `activeSubscriptionCount`, `calculatedAt` | `200`, `500` | FR-04.1..FR-04.3 |

- Aggregates **active** subscriptions only (`cancelled` subscriptions and `free trials` are excluded).

---

### 2.5 Notifications (`/notifications`)

| Method | Path | Purpose | Status Codes | SRS |
|---|---|---|---|---|
| `GET` | `/notifications` | List notifications (`?type=`, `?dismissed=true` to include dismissed); sorted by priority then `createdAt` desc | `200`, `500` | FR-05.4, FR-05.6, FR-05.7 |
| `PATCH` | `/notifications/{id}/dismiss` | Mark notification dismissed with `dismissedAt` timestamp | `200`, `404`, `409`, `500` | FR-05.5 |

- Priority sort order: `TRIAL_EXPIRY` (1) → `STARTUP_SUMMARY` (2) → `RENEWAL` (3).
- By default (`dismissed` omitted or not `'true'`), only active (`isDismissed === false`) notifications are returned; pass `?dismissed=true` to include dismissed notifications.

---

### 2.6 Settings (`/settings`)

| Method | Path | Purpose | Status Codes | SRS |
|---|---|---|---|---|
| `GET` | `/settings` | Retrieve global lead-time settings (`renewalLeadTimeDays`, `trialLeadTimeDays`, `currency: "UAH"`) | `200`, `500` | FR-05.1, FR-05.2 |
| `PUT` | `/settings` | Update `renewalLeadTimeDays` and/or `trialLeadTimeDays` (integers `1..30`) | `200`, `400`, `500` | FR-05.1, FR-05.2 |

---

### 2.7 System Operations (`/system`)

| Method | Path | Purpose | Status Codes | SRS |
|---|---|---|---|---|
| `POST` | `/system/startup-check` | Evaluate expired trials, due/overdue subscriptions, and generate notifications | `200`, `500` | FR-02.4, FR-03.3, FR-05.6 |
| `GET` | `/system/export` | Export full state snapshot (`version: "1.0.0"`) | `200`, `500` | FR-06.2, NFR-06 |
| `POST` | `/system/import` | Validate `version: "1.0.0"` snapshot and **replace** all in-memory store state | `200`, `400`, `500` | FR-06.3, FR-06.4, NFR-05 |

### 2.8 Static Web UI Assets (`src/app.js`)

| Method | Path | Content-Type | Purpose |
|---|---|---|---|
| `GET` | `/` or `/index.html` | `text/html; charset=utf-8` | Serves the single-page Web UI (`public/index.html`) |
| `GET` | `/styles.css` | `text/css; charset=utf-8` | Serves Web UI stylesheet (`public/styles.css`) |
| `GET` | `/app.js` | `text/javascript; charset=utf-8` | Serves Web UI ES6+ client script (`public/app.js`) |

---

## 3. Runtime Store vs. OpenAPI Schema Notes

The Node.js runtime store (`src/domain/store.js`) preserves a few additional fields asserted by existing tests or used by the UI alongside the core OpenAPI schema fields:
- `Subscription`: includes `currency: "UAH"`, `paymentMethod`, `category`, `billingDue`, `overdue` (OpenAPI documents `isBillingDue`, `isOverdue`).
- `Trial`: includes `assumedCost: 0.00`.
- `BillingEvent`: includes `serviceName`, `currency: "UAH"`, `billingDate` (OpenAPI documents `subscriptionName`).
- `Notification`: includes `title`, `targetResourceId`, `targetResourceType`, and `priority: "normal" | "high"`.

# Documentation Verification Report

**Project:** Subscription Tracker (Node.js v25 ESM + Web UI)  
**Date:** 2026-11-25  
**Scope:** Verification of `README.md`, `docs/API_Reference.md`, and `docs/User_Guide.md` against `src/` and `public/`.

---

## 1. API Documentation Audit (`docs/API_Reference.md` vs. `src/`)

Audited all modules in `src/domain/`, `src/routes/`, `src/utils/`, and `src/app.js`:

| Area | Verified Item | Finding & Resolution |
|---|---|---|
| **Static Web UI Routes** | `src/app.js` (`GET /`, `/index.html`, `/styles.css`, `/app.js`) | Added Section 2.8 to `docs/API_Reference.md` documenting static asset routes and `Content-Type` headers. |
| **Subscriptions** | `src/routes/subscriptions.js`, `src/domain/store.js`, `src/domain/validation.js` | Verified `CHG-01` `?status=active\|cancelled\|all` validation (`400 VALIDATION_ERROR`), soft delete (`200` / `404` / `409`), and `PUT` partial-update behavior (`400` on malformed JSON only). Clarified `PUT` validation in `docs/API_Reference.md`. |
| **Trials** | `src/routes/trials.js`, `src/domain/store.js` | Verified `assumedCost: 0.00`, `linkedSubscriptionId` existence check (`404`), `PUT` ignoring `status`, and `PATCH /trials/:id/resolve` requiring `status === 'expired'` (`400 INVALID_STATUS_TRANSITION`). |
| **Billing Events** | `src/routes/billingEvents.js`, `src/domain/store.js` | Verified append-only immutability (no `PUT`/`PATCH`/`DELETE`), `400 BILLING_NOT_DUE`, future-date rejection, and `nextBillingDate` advancement from `dateConfirmed`. |
| **Analytics** | `src/routes/analytics.js`, `src/domain/calculations.js` | Verified active-only UAH aggregation (`totalMonthlySpend`, `totalAnnualSpend`, `currency: 'UAH'`, `activeSubscriptionCount`, `calculatedAt`). |
| **Notifications** | `src/routes/notifications.js`, `src/domain/store.js` | Verified priority order (`TRIAL_EXPIRY`, `STARTUP_SUMMARY`, `RENEWAL`), `?dismissed=true` strict string check, and `409 RESOURCE_CONFLICT` on repeat dismiss. Clarified `?dismissed=true` in `docs/API_Reference.md`. |
| **Settings & System** | `src/routes/settings.js`, `src/routes/system.js` | Verified `1..30` lead-time bounds, `POST /system/startup-check`, `GET /system/export` (`version: '1.0.0'`), and destructive `POST /system/import` (`400 INVALID_IMPORT_SCHEMA`). |

---

## 2. User Guide Cross-Check (`docs/User_Guide.md` vs. `public/`)

Cross-checked `docs/User_Guide.md` against `public/index.html` and `public/app.js`:

- **Analytics & Header:** Matches `Run Startup Check` button, `Analytics Summary (UAH)` heading, and `Monthly Spend`, `Annual Spend`, `Active Subscriptions` cards.
- **Subscriptions:** Matches form fields (`Service Name`, `Cost (UAH)`, `Billing Interval` with conditional `Custom Value` / `Custom Unit`, `First Billing Date`, `Lead Time (days)`), `All`/`Active`/`Cancelled` filter buttons, and item actions (`Mark Paid`, `Mark Skipped`, `Cancel`). `README.md` and `docs/User_Guide.md` both state clearly that costs are tracked directly in `UAH` (no currency conversion), that the Web UI covers creating, filtering, confirming billing, and soft-cancelling subscriptions, that editing existing subscription fields is available via `PUT /subscriptions/{id}`, and that server error messages for due/validation checks are surfaced in the top status banner.
- **Free Trials:** Matches `Service Name`, `Start Date`, `End Date`, `Linked Subscription` (`Standalone (none)`), `Lead Time (days)`, `Add Trial`, and `Convert` / `Cancel` buttons for `expired` trials.
- **Notifications & Billing History:** Matches `Active Notifications` (`Dismiss` button) and `Billing History (Immutable)` read-only list.
- **Settings & Backup:** Matches `Renewal Lead Time (1–30 days)`, `Trial Lead Time (1–30 days)`, `Save Settings`, `Export JSON`, and `Import Snapshot` with confirmation warning.

---

## 3. Reviewer Verification Checklist

### A. Terminal Commands
```powershell
# 1. Run full automated test suite (Windows PowerShell uses npm.cmd if npm.ps1 is restricted)
npm.cmd test
# Or directly:
node --test tests/unit.test.js tests/logger.test.js tests/contract.test.js tests/addendum.test.js

# 2. Start the server on default port 4010
node src/server.js
```

### B. Smoke Checks (in a second terminal while server is running)
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:4010/" -UseBasicParsing | Select-Object StatusCode
Invoke-WebRequest -Uri "http://127.0.0.1:4010/analytics/summary" -UseBasicParsing | Select-Object StatusCode, Content
Invoke-WebRequest -Uri "http://127.0.0.1:4010/subscriptions?status=active" -UseBasicParsing | Select-Object StatusCode, Content
```

### C. Browser UI Flows (`http://localhost:4010`)
1. **Create Subscription:** Add a subscription (`Monthly` or `Custom`) and verify **Analytics Summary (UAH)** updates.
2. **Filter Subscriptions:** Click `Active`, `Cancelled`, and `All` buttons.
3. **Confirm Billing:** Create a subscription with a past `First Billing Date` so it is due, then click `Mark Paid` or `Mark Skipped` and verify an entry appears in **Billing History (Immutable)**.
4. **Cancel Subscription:** Click `Cancel` on an active subscription; verify it remains visible with `cancelled` badge and is excluded from **Analytics Summary**.
5. **Trials & Startup Check:** Create a trial with a past `End Date`, click **Run Startup Check**, verify it becomes `expired` and a notification appears, then resolve it via `Convert` or `Cancel` and `Dismiss` the notification.
6. **Settings & Backup:** Update lead-time settings (`Save Settings`), click `Export JSON`, and test `Import Snapshot` with the confirmation prompt.

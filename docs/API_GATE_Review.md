## Part 3 — API-GATE Checkpoint

> **Decision date:** 2026-10-28  
> **Predecessor gate:** TSK-05 PLAN-GATE (approved 2026-10-15)

| # | Criterion | Evidence | Status |
|---|-----------|----------|--------|
| **G1** | OpenAPI 3.0.3 specification generated | `openapi.yaml` (1468 lines, 50 KB) | ✅ PASS |
| **G2** | All FR-01.x requirements have mapped endpoints | FR-01.1→POST /subscriptions; FR-01.2→PUT; FR-01.3→DELETE; FR-01.4/01.5→server-computed fields | ✅ PASS |
| **G3** | All FR-02.x requirements have mapped endpoints | FR-02.1/02.2/02.3→POST /trials; FR-02.4/02.5→PATCH /resolve + startup-check; FR-02.6→notifications | ✅ PASS |
| **G4** | All FR-03.x requirements have mapped endpoints | FR-03.1/03.2/03.3/03.4→POST /billing-events; FR-03.5→GET /billing-events | ✅ PASS |
| **G5** | All FR-04.x requirements have mapped endpoints | FR-04.1/04.2/04.3→GET /analytics/summary | ✅ PASS |
| **G6** | All FR-05.x requirements have mapped endpoints | FR-05.1/05.2→/settings; FR-05.3→per-item field; FR-05.4/05.5/05.6/05.7→/notifications + startup-check | ✅ PASS |
| **G7** | All FR-06.x requirements have mapped endpoints | FR-06.1→all persistence; FR-06.2→GET /system/export; FR-06.3/06.4→POST /system/import | ✅ PASS |
| **G8** | All NFRs addressed in spec | NFR-03→BillingEvent immutability (no PUT/DELETE); NFR-05→import validation; NFR-06→DataExport versioned schema | ✅ PASS |
| **G9** | All domain schemas defined with required fields | 14 schemas: Subscription, SubscriptionCreate/Update, Trial, TrialCreate/Update/Resolution, BillingEvent, BillingEventCreate, Notification, Settings, SettingsUpdate, AnalyticsSummary, StartupCheckResult, DataExport | ✅ PASS |
| **G10** | Unified error model defined | `Error` schema with 7 typed codes: VALIDATION_ERROR, RESOURCE_NOT_FOUND, RESOURCE_CONFLICT, INVALID_STATUS_TRANSITION, INVALID_IMPORT_SCHEMA, BILLING_NOT_DUE, INTERNAL_ERROR | ✅ PASS |
| **G11** | HTTP status codes correct and complete | 200, 201, 400, 404, 409, 500 — all mapped with descriptions | ✅ PASS |
| **G12** | Every endpoint linked to SRS requirement IDs | `x-requirements` extension on all 21 operations | ✅ PASS |
| **G13** | Mock server runnable from spec | Prism CLI: `npx @stoplight/prism-cli@4 mock openapi.yaml --port 4010` | ✅ PASS |
| **G14** | Positive contract tests defined | P-01 through P-13 (13 scenarios across all 7 resource groups) | ✅ PASS |
| **G15** | Negative contract tests defined | N-01 through N-08 (8 error scenarios: 400, 404, 409) | ✅ PASS |
| **G16** | Soft-delete semantics correct | DELETE /subscriptions returns 200 + body (not 204); status=cancelled; record retained per FR-01.3 | ✅ PASS |
| **G17** | Billing history immutability enforced | No PUT or DELETE on /billing-events or /billing-events/{id} | ✅ PASS |
| **G18** | UAH currency constraint respected | `AnalyticsSummary.currency` is enum `[UAH]` only | ✅ PASS |

---

### API-GATE Decision

| Field | Value |
|-------|-------|
| **Gate ID** | API-GATE |
| **Date** | 2026-10-28 |
| **Criteria passed** | 18 / 18 |
| **Blocking issues** | None |
| **Decision** | ✅ **GO** |
| **Next phase** | Backend implementation (SDD Phase 2) |

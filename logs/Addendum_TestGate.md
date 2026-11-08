# ADDENDUM TEST-GATE — CHG-01 (status filter for `GET /subscriptions`)

**Date:** 2026-11-08
**Spec:** [`spec/SPEC_ADDENDUM.md`](../spec/SPEC_ADDENDUM.md) (SPEC-ADDENDUM-GATE: GO)
**Test file:** `tests/addendum.test.js` (24 tests: validator unit, store unit, contract AC-01..AC-07)
**Runner:** `node --test` (Node.js v25.0.0)

---

## 1. Red State (tests written before any application code change)

Command: `node --test tests/addendum.test.js`

| Metric | Value |
|--------|-------|
| tests | 24 |
| pass | 6 |
| fail | **18** |

Failures and why they are the expected ones:

| Failing tests | Observed error | Meaning |
|---------------|----------------|---------|
| 8 × `validateSubscriptionStatusFilter` (accepts/rejects) | `TypeError: validation.validateSubscriptionStatusFilter is not a function` | Validator not implemented yet |
| Store: `"all" returns every subscription` | `0 !== 2` | `"all"` treated as a literal status, matches nothing |
| AC-03 `status=all` | `0 !== 3` | Same cause, at HTTP level |
| AC-04 omitted equals `all` | `deepStrictEqual` mismatch | `all` returned `[]` while omitted returned data |
| AC-05 × 3 (`paused`, `Active`, empty) | `200 !== 400` | Invalid values not rejected (also `?status=` was ignored as falsy) |
| AC-07 read-only/idempotent | assertion on `all` length | Depends on `status=all` |

Tests that already passed in Red (6) cover unchanged behaviour: store `undefined`/`active`/`cancelled`, AC-06, AC-01, AC-02. They act as regression guards.

Verdict: **Red confirmed for the expected reason** (feature absent, not a test or environment error).

---

## 2. Green State

Changes:
- `src/domain/validation.js` — added `SUBSCRIPTION_STATUS_FILTERS` and `validateSubscriptionStatusFilter()`.
- `src/domain/store.js` — `listSubscriptions()` treats `all` (and omitted) as no filter.
- `src/routes/subscriptions.js` — `GET /subscriptions` validates the query (using `searchParams.has`, so `?status=` is rejected) and returns `400 VALIDATION_ERROR` for invalid values.
- `openapi.yaml` — enum `[active, cancelled, all]`, default `all`, new `400` response.

Command: `node --test tests/unit.test.js tests/logger.test.js tests/contract.test.js tests/addendum.test.js`

| Metric | Value |
|--------|-------|
| tests | 58 (34 pre-existing + 24 new) |
| pass | **58** |
| fail | 0 |

Regression check (AC-08): all 34 pre-existing tests pass unchanged.

---

## 3. Refactor

The modified modules were reviewed after Green. Each change is a few lines, the validation logic is isolated in `validation.js`, the route only orchestrates, and the store only filters; no further restructuring was needed, so no behaviour-preserving edits were required. A final full run via `npm test` (glob `tests/**/*.test.js`) gave 58/58 pass.

---

## 4. Gate Decision

| Criterion | Status |
|-----------|--------|
| Tests authored before implementation | ✅ |
| Red failed for expected reason | ✅ |
| Green: all new tests pass | ✅ |
| Zero regressions (34/34 previous) | ✅ |
| `openapi.yaml` updated | ✅ |
| Traceability matrix updated | ✅ |

**Decision: ✅ GO**


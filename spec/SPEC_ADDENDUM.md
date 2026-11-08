# SPEC ADDENDUM — Feature Change Ticket
### Subscription Tracker | Addendum #1 (Status Filter for `GET /subscriptions`)

**Baseline:** [`SRS.md`](SRS.md) v1.0 · [`SRS_Addendum.md`](SRS_Addendum.md) · [`openapi.yaml`](../openapi.yaml) v1.0.0
**Date:** 2026-11-08
**Predecessor gates:** SPEC-GATE, PLAN-GATE, API-GATE, TEST-GATE (all GO)

---

## 1. Change Ticket

| Field | Value |
|-------|-------|
| **Ticket ID** | CHG-01 |
| **Type** | Feature change (backward-compatible, non-breaking) |
| **Title** | Optional query filtering by status on `GET /subscriptions` |
| **Priority** | MEDIUM |
| **Related requirements** | FR-01.3 (cancelled subscriptions retained), FR-04.3 (active-only analytics scope) |
| **Affected endpoint** | `GET /subscriptions` |

### 1.1 Requirement (CHG-01)

The `GET /subscriptions` operation SHALL accept an optional query parameter `status` with allowed values:

| Value | Behaviour |
|-------|-----------|
| `active` | Return only subscriptions whose `status` is `active` |
| `cancelled` | Return only subscriptions whose `status` is `cancelled` |
| `all` | Return every subscription regardless of status |

Rules:
1. When `status` is omitted, the behaviour SHALL be identical to `status=all` (no change for existing clients).
2. Any other value (including different letter case, e.g. `Active`, or an empty value) SHALL be rejected with `400 Bad Request` and error code `VALIDATION_ERROR`; no data is returned.
3. The response body schema is unchanged: a JSON array of `Subscription` objects (possibly empty).
4. The filter is read-only: it SHALL NOT modify any record. Cancelled records remain retained (FR-01.3).
5. Each handled request is recorded by the existing request logger; no new log format is introduced.

### 1.2 Acceptance Criteria

| ID | Given / When / Then |
|----|---------------------|
| **AC-01** | Given active and cancelled subscriptions exist, when `GET /subscriptions?status=active`, then `200` and every item has `status = active`. |
| **AC-02** | Given the same data, when `GET /subscriptions?status=cancelled`, then `200` and every item has `status = cancelled`, and the cancelled item created earlier is present. |
| **AC-03** | When `GET /subscriptions?status=all`, then `200` and the result contains both active and cancelled items; its length equals active + cancelled counts. |
| **AC-04** | When `GET /subscriptions` without `status`, then the result equals the `status=all` result (backward compatibility). |
| **AC-05** | When `GET /subscriptions?status=paused` (or `Active`, or empty), then `400` with `code = VALIDATION_ERROR`, a `message` and a `timestamp`. |
| **AC-06** | When no subscription matches the filter, then `200` and an empty array `[]` (not 404). |
| **AC-07** | Calling the filtered endpoint does not change the stored records (a second call returns the same data). |
| **AC-08** | All 34 pre-existing tests continue to pass (zero regressions). |

---

## 2. Impact Analysis

| Artifact | Impact | Action |
|----------|--------|--------|
| `openapi.yaml` | `status` enum extended with `all`, default `all`; `400` response added to `GET /subscriptions`; `x-requirements` unchanged | **Update** |
| `src/domain/store.js` (`listSubscriptions`) | Treat `all` / undefined as "no filter" | **Update** |
| `src/domain/validation.js` | New validator for the status query value | **Update** (additive) |
| `src/routes/subscriptions.js` | Validate query, return 400 on invalid value | **Update** |
| `tests/` | New unit tests (validator, store) and contract tests (AC-01..AC-07) | **Add** |
| `docs/Traceability_Matrix.md` | Add CHG-01 mapping for `GET /subscriptions` and gate record | **Update** |
| `docs/API_Verification_Guide.md` | Contract scenario for filter | No change (P-03 remains valid) |
| `spec/SRS.md` (v1.0, frozen) | No functional change; extension documented here only | No change |
| Other endpoints / schemas | None | No change |

**Risk:** LOW. The change is additive; previously valid requests (`status=active|cancelled`, no parameter) keep their behaviour. The only newly rejected input is a previously undefined, invalid `status` value, which before returned an empty list and now returns `400`.

---

## 3. SPEC-ADDENDUM-GATE

| # | Criterion | Evidence | Status |
|---|-----------|----------|--------|
| A1 | Requirement is unambiguous and testable | §1.1 | ✅ PASS |
| A2 | Acceptance criteria defined | §1.2 (AC-01..AC-08) | ✅ PASS |
| A3 | Impact on existing artifacts analysed | §2 | ✅ PASS |
| A4 | Backward compatible with API v1.0.0 | Omitted parameter = `all` | ✅ PASS |
| A5 | No change to frozen SRS v1.0 scope | Extension recorded only in this addendum | ✅ PASS |
| A6 | Tests to be written before implementation | Required by TDD workflow (see `logs/Addendum_TestGate.md`) | ✅ PASS |

| Field | Value |
|-------|-------|
| **Gate ID** | SPEC-ADDENDUM-GATE |
| **Date** | 2026-11-08 |
| **Criteria passed** | 6 / 6 |
| **Blocking issues** | None |
| **Decision** | ✅ **GO** |
| **Next phase** | TDD implementation of CHG-01 (Red → Green → Refactor) |


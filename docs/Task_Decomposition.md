# Task Decomposition — Subscription Tracker
### Lab Work #3 | Lifecycle Organization, Planning & Risk Management
### Version 1.0 | October 2026

**Source specification:** [`spec/SRS.md`](../spec/SRS.md) v1.0 (GATE-1 Approved, 2026-09-21)  
**BDD scenarios:** [`docs/BDD_Scenarios.md`](BDD_Scenarios.md)  
**Traceability matrix:** [`docs/Traceability_Matrix.md`](Traceability_Matrix.md)

> All ticket IDs, requirement traces, and scope boundaries are derived exclusively from the approved SRS.
> No functionality not present in the specification has been added.

---

## Ticket Type Legend

| Type | Description |
|------|-------------|
| **Specification** | Reading, confirming, or annotating the approved SRS as a precondition |
| **Addendum** | A clarification or correction to an existing spec artifact (not new scope) |
| **Feature** | Implementation of a functional or non-functional requirement from the SRS |
| **Test** | Writing or executing BDD/unit test code tied to a specific scenario |
| **Verification** | Internal agent check that an implementation satisfies its traced requirement |
| **Validation** | Human review confirming that implemented behavior matches user intent |
| **Documentation** | Producing or updating a project document, log, or README |
| **Gate** | A blocking checkpoint; no subsequent tickets may begin until this passes |

---

## Assignee / Role Legend

| Role | Description |
|------|-------------|
| **Coding Agent** | Automated implementation, test generation, and verification work |
| **Human** | Review, approval, acceptance validation, and gate sign-off |
| **Collaborative** | Requires both agent output and human decision/approval to complete |

---

## Duration Estimate Key

- **Agent:** Estimated autonomous coding/execution time (continuous)
- **Human:** Estimated human review, reading, or validation time (non-blocking)

---

## Phase 0 — Planning & Gate

| Ticket ID | Title / Description | Type | Traced Req / BDD | Assignee | Dependencies | Agent Est. | Human Est. |
|-----------|---------------------|------|------------------|----------|--------------|------------|------------|
| **TSK-01** | Read and confirm approved SRS v1.0 as planning baseline | Specification | SRS §1–§6 (all) | Coding Agent | — | 10 min | — |
| **TSK-02** | Read BDD_Scenarios.md and Traceability_Matrix.md to internalize test scope | Specification | SC-01–SC-23 | Coding Agent | TSK-01 | 10 min | — |
| **TSK-03** | Produce this Task Decomposition document (docs/Task_Decomposition.md) | Documentation | SRS §4–§5 | Coding Agent | TSK-01, TSK-02 | 30 min | 20 min |
| **TSK-04** | Human reviews and approves Task Decomposition; identifies any missing scope | Validation | All FRs / NFRs | Human | TSK-03 | — | 30 min |
| **TSK-05** | **PLAN-GATE:** Task decomposition approved; implementation phase authorized | Gate | All | Collaborative | TSK-04 | — | 10 min |

---

## Phase 1 — Project Scaffolding & Architecture

| Ticket ID | Title / Description | Type | Traced Req / BDD | Assignee | Dependencies | Agent Est. | Human Est. |
|-----------|---------------------|------|------------------|----------|--------------|------------|------------|
| **TSK-06** | Initialize project file structure: `src/index.html`, `src/style.css`, `src/app.js` | Feature | NFR-04, NFR-02 | Coding Agent | TSK-05 | 15 min | 5 min |
| **TSK-07** | Implement localStorage service module: `read()`, `write()`, `clear()`, `initialize()` with empty-state fallback | Feature | FR-06.1, NFR-05 | Coding Agent | TSK-06 | 20 min | 10 min |
| **TSK-08** | Define data schema for `subscriptions`, `trials`, `billingHistory`, `settings` in localStorage | Feature | FR-06.1, FR-06.2, FR-06.3 | Coding Agent | TSK-07 | 20 min | 10 min |
| **TSK-09** | Implement date utility module: interval arithmetic, next-date calculation, days-until helper | Feature | FR-01.4, FR-01.5, FR-02.4 | Coding Agent | TSK-06 | 25 min | 10 min |
| **TSK-10** | Implement spend calculation module: annual estimate formula, monthly estimate, aggregate totals | Feature | FR-01.5, FR-04.1, FR-04.2, FR-04.3 | Coding Agent | TSK-09 | 20 min | 10 min |
| **TSK-11** | Implement app startup orchestrator: triggers date checks, notification evaluation, summary banner logic on load | Feature | FR-02.4, FR-03.1, FR-03.3, FR-05.6 | Coding Agent | TSK-07, TSK-09 | 25 min | 10 min |
| **TSK-12** | Human reviews scaffolding, schema design, and utility modules for structural correctness | Validation | FR-06.1, NFR-03, NFR-04 | Human | TSK-07–TSK-11 | — | 20 min |

---

## Phase 2 — Subscription Management (FR-01)

| Ticket ID | Title / Description | Type | Traced Req / BDD | Assignee | Dependencies | Agent Est. | Human Est. |
|-----------|---------------------|------|------------------|----------|--------------|------------|------------|
| **TSK-13** | Implement Add Subscription form UI and data persistence (service name, cost, interval type, first billing date) | Feature | FR-01.1 / SC-01 | Coding Agent | TSK-12 | 35 min | 10 min |
| **TSK-14** | Implement Edit Subscription: pre-populate form with existing data and save changes | Feature | FR-01.2 | Coding Agent | TSK-13 | 20 min | 10 min |
| **TSK-15** | Implement Cancel Subscription: status → `cancelled`, retain card with "Cancelled" badge | Feature | FR-01.3 / SC-03 | Coding Agent | TSK-13 | 15 min | 5 min |
| **TSK-16** | Implement Next Billing Date calculation for all interval types (monthly, annual, custom days/months) | Feature | FR-01.4 / SC-02 | Coding Agent | TSK-09, TSK-13 | 20 min | 10 min |
| **TSK-17** | Implement Annual Spend Estimate per subscription with normalization rules | Feature | FR-01.5 / SC-04 | Coding Agent | TSK-10, TSK-13 | 15 min | 5 min |
| **TSK-18** | Write BDD test: SC-01 (add subscription) | Test | FR-01.1 / SC-01 | Coding Agent | TSK-13 | 15 min | 10 min |
| **TSK-19** | Write BDD test: SC-02 (next billing date for custom interval) | Test | FR-01.4 / SC-02 | Coding Agent | TSK-16 | 15 min | 10 min |
| **TSK-20** | Write BDD test: SC-03 (cancel subscription) | Test | FR-01.3 / SC-03 | Coding Agent | TSK-15 | 10 min | 5 min |
| **TSK-21** | Write BDD test: SC-04 (annual spend calculation) | Test | FR-01.5, FR-04.1, FR-04.2 / SC-04 | Coding Agent | TSK-17 | 15 min | 10 min |
| **TSK-22** | Verify FR-01.1–FR-01.5 implementation against SRS; confirm all interval types produce correct dates and estimates | Verification | FR-01.1–FR-01.5 | Coding Agent | TSK-18–TSK-21 | 15 min | — |
| **TSK-23** | Human validates subscription management UI/UX and calculation accuracy | Validation | FR-01.1–FR-01.5 / SC-01–SC-04 | Human | TSK-22 | — | 20 min |

---

## Phase 3 — Free Trial Management (FR-02)

| Ticket ID | Title / Description | Type | Traced Req / BDD | Assignee | Dependencies | Agent Est. | Human Est. |
|-----------|---------------------|------|------------------|----------|--------------|------------|------------|
| **TSK-24** | Implement Add Free Trial form: service name, start date, end date, optional linked subscription reference | Feature | FR-02.1, FR-02.2 / SC-05, SC-06 | Coding Agent | TSK-12 | 30 min | 10 min |
| **TSK-25** | Implement trial expiry detection on app load: evaluate all `active` trials, mark `expired` if past end date | Feature | FR-02.4 / SC-07 | Coding Agent | TSK-11, TSK-24 | 20 min | 5 min |
| **TSK-26** | Implement trial expiry resolution prompt: "Convert" and "Cancel" choices with cascading status updates | Feature | FR-02.5 / SC-08, SC-09, SC-10 | Coding Agent | TSK-25 | 25 min | 10 min |
| **TSK-27** | Write BDD test: SC-05 (add trial with linked subscription) | Test | FR-02.1 / SC-05 | Coding Agent | TSK-24 | 15 min | 5 min |
| **TSK-28** | Write BDD test: SC-06 (add standalone trial) | Test | FR-02.2 / SC-06 | Coding Agent | TSK-24 | 10 min | 5 min |
| **TSK-29** | Write BDD test: SC-07 (expiry detection on load) | Test | FR-02.4 / SC-07 | Coding Agent | TSK-25 | 15 min | 5 min |
| **TSK-30** | Write BDD tests: SC-08, SC-09, SC-10 (convert, cancel with/without linked subscription) | Test | FR-02.5 / SC-08–SC-10 | Coding Agent | TSK-26 | 20 min | 10 min |
| **TSK-31** | Verify FR-02.1–FR-02.6 implementation: expiry detection accuracy, status cascade correctness, standalone trial handling | Verification | FR-02.1–FR-02.6 | Coding Agent | TSK-27–TSK-30 | 15 min | — |
| **TSK-32** | Human validates trial lifecycle: expiry prompt behaviour, conversion cascade, cancel cascade | Validation | FR-02.1–FR-02.6 / SC-05–SC-10 | Human | TSK-31 | — | 20 min |

---

## Phase 4 — Billing History & Confirmation (FR-03)

| Ticket ID | Title / Description | Type | Traced Req / BDD | Assignee | Dependencies | Agent Est. | Human Est. |
|-----------|---------------------|------|------------------|----------|--------------|------------|------------|
| **TSK-33** | Implement billing due flag: display confirmation badge on subscription card when `Current Date ≥ Next Billing Date` | Feature | FR-03.1 / SC-11, SC-13 | Coding Agent | TSK-16, TSK-23 | 20 min | 5 min |
| **TSK-34** | Implement billing confirmation UI: "Mark as Paid" / "Mark as Skipped" actions; recalculate next date; remove badge | Feature | FR-03.2 / SC-11, SC-12 | Coding Agent | TSK-33 | 25 min | 10 min |
| **TSK-35** | Implement overdue event detection and visual distinction (overdue vs. standard due) | Feature | FR-03.3 / SC-13 | Coding Agent | TSK-33 | 15 min | 5 min |
| **TSK-36** | Implement billing history log: append immutable entry on confirmation with all required fields | Feature | FR-03.4 / SC-11, SC-12 | Coding Agent | TSK-34 | 20 min | 5 min |
| **TSK-37** | Implement Billing History view: dedicated list, sorted by date descending, read-only | Feature | FR-03.5 / SC-14 | Coding Agent | TSK-36 | 20 min | 10 min |
| **TSK-38** | Write BDD tests: SC-11 (mark paid), SC-12 (mark skipped) | Test | FR-03.2, FR-03.4 / SC-11–SC-12 | Coding Agent | TSK-34, TSK-36 | 20 min | 10 min |
| **TSK-39** | Write BDD test: SC-13 (overdue event flagged and held) | Test | FR-03.1, FR-03.3 / SC-13 | Coding Agent | TSK-35 | 15 min | 5 min |
| **TSK-40** | Write BDD test: SC-14 (view billing history, read-only, sorted) | Test | FR-03.5 / SC-14 | Coding Agent | TSK-37 | 10 min | 5 min |
| **TSK-41** | Verify FR-03.1–FR-03.5: billing badge logic, immutability of history entries, overdue persistence | Verification | FR-03.1–FR-03.5 | Coding Agent | TSK-38–TSK-40 | 15 min | — |
| **TSK-42** | Human validates billing confirmation flow and history view | Validation | FR-03.1–FR-03.5 / SC-11–SC-14 | Human | TSK-41 | — | 20 min |

---

## Phase 5 — Analytics (FR-04)

| Ticket ID | Title / Description | Type | Traced Req / BDD | Assignee | Dependencies | Agent Est. | Human Est. |
|-----------|---------------------|------|------------------|----------|--------------|------------|------------|
| **TSK-43** | Implement analytics dashboard section: Total Monthly Spend and Total Annual Spend displays (active subscriptions only) | Feature | FR-04.1, FR-04.2, FR-04.3 / SC-04 | Coding Agent | TSK-10, TSK-23 | 20 min | 10 min |
| **TSK-44** | Verify FR-04.1–FR-04.3: cancelled subscriptions excluded; free trials contribute 0; formulas match SRS | Verification | FR-04.1–FR-04.3 / SC-04 | Coding Agent | TSK-43 | 10 min | — |
| **TSK-45** | Human validates analytics accuracy across mixed subscription states | Validation | FR-04.1–FR-04.3 / SC-04 | Human | TSK-44 | — | 10 min |

---

## Phase 6 — Notifications (FR-05)

| Ticket ID | Title / Description | Type | Traced Req / BDD | Assignee | Dependencies | Agent Est. | Human Est. |
|-----------|---------------------|------|------------------|----------|--------------|------------|------------|
| **TSK-46** | Implement global settings store: renewal lead-time (default 3d) and trial lead-time (default 3d); user-editable | Feature | FR-05.1, FR-05.2 / SC-15, SC-16 | Coding Agent | TSK-08 | 20 min | 5 min |
| **TSK-47** | Implement per-item lead-time override field on subscription and trial forms | Feature | FR-05.3 / SC-17 | Coding Agent | TSK-13, TSK-24, TSK-46 | 15 min | 5 min |
| **TSK-48** | Implement notification engine: evaluate all items on load; generate `RENEWAL` and `TRIAL_EXPIRY` banners per lead-time rules | Feature | FR-05.4, FR-05.5, FR-05.7 / SC-15, SC-16, SC-17 | Coding Agent | TSK-11, TSK-46, TSK-47 | 30 min | 10 min |
| **TSK-49** | Implement notification dismiss logic: banner removed on × click; dismissed state persisted | Feature | FR-05.5 / SC-18 | Coding Agent | TSK-48 | 15 min | 5 min |
| **TSK-50** | Implement startup summary banner: detect missed events since last load; display persistent summary | Feature | FR-05.6 / SC-19 | Coding Agent | TSK-11, TSK-48 | 25 min | 10 min |
| **TSK-51** | Write BDD tests: SC-15 (renewal notification), SC-16 (trial expiry high-priority), SC-17 (per-item override), SC-18 (dismiss), SC-19 (startup banner) | Test | FR-05.1–FR-05.7 / SC-15–SC-19 | Coding Agent | TSK-46–TSK-50 | 30 min | 15 min |
| **TSK-52** | Verify FR-05.1–FR-05.7: correct lead-time resolution order (per-item > global), visual priority distinction, dismiss persistence | Verification | FR-05.1–FR-05.7 | Coding Agent | TSK-51 | 15 min | — |
| **TSK-53** | Human validates notification banners: priority styling, dismiss behaviour, startup summary accuracy | Validation | FR-05.1–FR-05.7 / SC-15–SC-19 | Human | TSK-52 | — | 20 min |

---

## Phase 7 — Data Management (FR-06)

| Ticket ID | Title / Description | Type | Traced Req / BDD | Assignee | Dependencies | Agent Est. | Human Est. |
|-----------|---------------------|------|------------------|----------|--------------|------------|------------|
| **TSK-54** | Implement JSON export: serialize all localStorage data to a downloadable `.json` file | Feature | FR-06.2 / SC-20 | Coding Agent | TSK-08 | 20 min | 5 min |
| **TSK-55** | Implement JSON import: file picker, JSON structure validation, localStorage replacement on confirmation | Feature | FR-06.3, FR-06.4 / SC-21, SC-22, SC-23 | Coding Agent | TSK-54 | 25 min | 10 min |
| **TSK-56** | Write BDD tests: SC-20 (export), SC-21 (import clean), SC-22 (import with confirmation warning), SC-23 (invalid file rejected) | Test | FR-06.2–FR-06.4 / SC-20–SC-23 | Coding Agent | TSK-54, TSK-55 | 25 min | 10 min |
| **TSK-57** | Verify FR-06.1–FR-06.4: exported JSON completeness, import overwrite safety, invalid file handling | Verification | FR-06.1–FR-06.4 | Coding Agent | TSK-56 | 10 min | — |
| **TSK-58** | Human validates export/import round-trip: export → clear → import → data fully restored | Validation | FR-06.1–FR-06.4 / SC-20–SC-23 | Human | TSK-57 | — | 15 min |

---

## Phase 8 — Non-Functional Requirements

| Ticket ID | Title / Description | Type | Traced Req / BDD | Assignee | Dependencies | Agent Est. | Human Est. |
|-----------|---------------------|------|------------------|----------|--------------|------------|------------|
| **TSK-59** | Verify NFR-01: measure dashboard load time with 500 records in localStorage; confirm < 2 seconds | Verification | NFR-01 | Coding Agent | TSK-43, TSK-50 | 15 min | 5 min |
| **TSK-60** | Verify NFR-02: audit all primary actions for 2-click reachability from main dashboard | Verification | NFR-02 | Coding Agent | TSK-58 | 15 min | — |
| **TSK-61** | Verify NFR-03: confirm all date calculations use `Date.now()` / system clock only; confirm history immutability | Verification | NFR-03 | Coding Agent | TSK-41 | 10 min | — |
| **TSK-62** | Verify NFR-04: run smoke test of all primary flows on Chrome, Firefox, and Edge | Verification | NFR-04 | Coding Agent | TSK-58 | 20 min | — |
| **TSK-63** | Verify NFR-05: clear localStorage manually; confirm app reinitializes gracefully with empty-state message | Verification | NFR-05 | Coding Agent | TSK-07 | 10 min | — |
| **TSK-64** | Verify NFR-06: export JSON on one browser, import on another; confirm zero data loss | Verification | NFR-06 | Coding Agent | TSK-57 | 10 min | 10 min |
| **TSK-65** | Human validates NFR compliance: usability (2-click rule), cross-browser appearance, graceful degradation UX | Validation | NFR-01–NFR-06 | Human | TSK-59–TSK-64 | — | 25 min |

---

## Phase 9 — Final Release Gate

| Ticket ID | Title / Description | Type | Traced Req / BDD | Assignee | Dependencies | Agent Est. | Human Est. |
|-----------|---------------------|------|------------------|----------|--------------|------------|------------|
| **TSK-66** | Produce final verification report: all FRs implemented, all BDD scenarios passing, all NFRs verified | Documentation | All FRs / NFRs | Coding Agent | TSK-23, TSK-32, TSK-42, TSK-45, TSK-53, TSK-58, TSK-65 | 20 min | — |
| **TSK-67** | Update README.md with Getting Started instructions and feature status table | Documentation | SRS §1.2 | Coding Agent | TSK-66 | 15 min | 10 min |
| **TSK-68** | Human performs final acceptance review: runs full BDD scenario suite manually against delivered application | Validation | SC-01–SC-23 (all) | Human | TSK-66 | — | 45 min |
| **TSK-69** | **RELEASE-GATE:** Full implementation verified and accepted; `src/` baseline locked for submission | Gate | All | Collaborative | TSK-68 | — | 10 min |

---

## Summary Table

| Phase | Tickets | Focus Area | Total Agent Est. | Total Human Est. |
|-------|---------|-----------|-----------------|-----------------|
| 0 — Planning & Gate | TSK-01–05 | Task decomposition, PLAN-GATE | 50 min | 60 min |
| 1 — Scaffolding | TSK-06–12 | Architecture, utilities, schema | 2h 5min | 1h 5min |
| 2 — Subscriptions | TSK-13–23 | FR-01 (5 reqs) | 2h 25min | 1h 35min |
| 3 — Free Trials | TSK-24–32 | FR-02 (6 reqs) | 2h 30min | 1h 10min |
| 4 — Billing History | TSK-33–42 | FR-03 (5 reqs) | 2h 25min | 1h 10min |
| 5 — Analytics | TSK-43–45 | FR-04 (3 reqs) | 30 min | 20 min |
| 6 — Notifications | TSK-46–53 | FR-05 (7 reqs) | 2h 30min | 1h 10min |
| 7 — Data Management | TSK-54–58 | FR-06 (4 reqs) | 1h 20min | 40 min |
| 8 — NFRs | TSK-59–65 | NFR-01–NFR-06 | 1h 20min | 40 min |
| 9 — Release Gate | TSK-66–69 | Final validation, RELEASE-GATE | 35 min | 1h 5min |
| **TOTAL** | **69 tickets** | **30 FRs + 6 NFRs + 23 BDD** | **~16h** | **~8h 15min** |

---

## Blocking Gate Dependency Chain

```
TSK-04 (Human Review)
    └── TSK-05 [PLAN-GATE] ──────────────────────────────────────────────────────┐
            └── TSK-06 (Scaffolding)                                             │
                    ├── Phase 2 (FR-01) → TSK-23 (Human Validation)             │
                    ├── Phase 3 (FR-02) → TSK-32 (Human Validation)             │
                    ├── Phase 4 (FR-03) → TSK-42 (Human Validation)             │
                    ├── Phase 5 (FR-04) → TSK-45 (Human Validation)             │
                    ├── Phase 6 (FR-05) → TSK-53 (Human Validation)             │
                    └── Phase 7 (FR-06) → TSK-58 (Human Validation)             │
                                                    └── Phase 8 (NFRs) → TSK-65 ┘
                                                                └── TSK-68 (Final Acceptance)
                                                                        └── TSK-69 [RELEASE-GATE]
```

---

*Produced by Coding Agent (Antigravity IDE) | Approved by Human after TSK-04.*  
*Gate TSK-05 must be signed before any Phase 1+ ticket is started.*

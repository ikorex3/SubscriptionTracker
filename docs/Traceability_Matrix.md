# Requirements Traceability Matrix — Subscription Tracker
### Version 2.0 | October 2026

> **v2.0 change:** Added **Ticket ID** column to Parts 1 and 2, mapping every requirement to its
> implementation ticket(s) from [`docs/Task_Decomposition.md`](Task_Decomposition.md).
> PLAN-GATE (TSK-05) approved 2026-10-15. Implementation phase authorized.

This matrix provides full bidirectional traceability between:
- **Elicitation source** → the SKED clarifying question round that produced the requirement
- **Requirement** → defined in `spec/SRS.md`
- **BDD Scenario(s)** → defined in `docs/BDD_Scenarios.md`
- **Ticket(s)** → defined in `docs/Task_Decomposition.md`

---

## Part 1 — Functional Requirements Traceability

| Req ID | Description | Priority | Elicitation Source | BDD Scenario(s) | Ticket(s) | Status |
|--------|-------------|----------|--------------------|-----------------|-----------|--------|
| **FR-01.1** | Add new subscription with mandatory fields | HIGH | Round 1: Q2.2 | SC-01 | TSK-13, TSK-18 | ☐ Not Implemented |
| **FR-01.2** | Edit any field of an existing subscription | HIGH | Round 1: Q2.2 | — | TSK-14 | ☐ Not Implemented |
| **FR-01.3** | Cancel subscription; keep with "Cancelled" badge | HIGH | Round 2: QD.2 | SC-03 | TSK-15, TSK-20 | ☐ Not Implemented |
| **FR-01.4** | Calculate Next Billing Date = Previous Date + Interval | HIGH | Round 1: QB.1 / Round 2: QB.1 | SC-02, SC-11 | TSK-16, TSK-19 | ☐ Not Implemented |
| **FR-01.5** | Annual Spend Estimate = (Cost ÷ Interval days) × 365 | HIGH | Round 1: QB.2 | SC-04 | TSK-17, TSK-21 | ☐ Not Implemented |
| **FR-02.1** | Add free trial with optional linked subscription | HIGH | Round 2: QA.1 | SC-05, SC-06 | TSK-24, TSK-27, TSK-28 | ☐ Not Implemented |
| **FR-02.2** | Trial may exist without a linked subscription | MEDIUM | Round 2: QA.3 | SC-06, SC-10 | TSK-24, TSK-28 | ☐ Not Implemented |
| **FR-02.3** | Subscription may exist without a prior trial | MEDIUM | Round 2: QA.3 | SC-01 | TSK-13 | ☐ Not Implemented |
| **FR-02.4** | Detect expired trials on app load; status → `expired` | HIGH | Round 3: QF.2 | SC-07 | TSK-25, TSK-29 | ☐ Not Implemented |
| **FR-02.5** | Expiry resolution prompt: Convert or Cancel | HIGH | Round 3: QF.2 | SC-08, SC-09, SC-10 | TSK-26, TSK-30 | ☐ Not Implemented |
| **FR-02.6** | TRIAL_EXPIRY notification when within lead-time | HIGH | Round 1: Q4.3 | SC-16 | TSK-48, TSK-51 | ☐ Not Implemented |
| **FR-03.1** | Display billing due badge on subscription card | HIGH | Round 3: QG.1 | SC-11, SC-13 | TSK-33, TSK-38, TSK-39 | ☐ Not Implemented |
| **FR-03.2** | Confirm billing event as paid or skipped; recalculate next date | HIGH | Round 2: QD.3 | SC-11, SC-12 | TSK-34, TSK-38 | ☐ Not Implemented |
| **FR-03.3** | Flag overdue events; hold pending until user resolves | HIGH | Round 3: QG.2 | SC-13, SC-19 | TSK-35, TSK-39 | ☐ Not Implemented |
| **FR-03.4** | Billing history entry records name, amount, date, status | MEDIUM | Round 3: QG.3 | SC-11, SC-12, SC-14 | TSK-36, TSK-38, TSK-40 | ☐ Not Implemented |
| **FR-03.5** | View billing history; sorted by date descending | MEDIUM | Round 1: Q5.2 | SC-14 | TSK-37, TSK-40 | ☐ Not Implemented |
| **FR-04.1** | Total Monthly Spend = Σ (Annual Estimate ÷ 12) | HIGH | Round 1: Q5.1 | SC-04 | TSK-43, TSK-44 | ☐ Not Implemented |
| **FR-04.2** | Total Annual Spend = Σ Annual Estimates | HIGH | Round 1: Q5.1 | SC-04 | TSK-43, TSK-44 | ☐ Not Implemented |
| **FR-04.3** | Analytics includes active subscriptions only | MEDIUM | Round 1: Q5.1 | SC-03, SC-04 | TSK-43, TSK-44 | ☐ Not Implemented |
| **FR-05.1** | Global renewal lead-time setting (default: 3 days) | HIGH | Round 1: Q4.1 | SC-15, SC-17 | TSK-46, TSK-51 | ☐ Not Implemented |
| **FR-05.2** | Global trial lead-time setting (default: 3 days) | HIGH | Round 1: Q4.1 | SC-16 | TSK-46, TSK-51 | ☐ Not Implemented |
| **FR-05.3** | Per-item lead-time override | MEDIUM | Round 1: Q4.1 | SC-17 | TSK-47, TSK-51 | ☐ Not Implemented |
| **FR-05.4** | Inline banner notifications on main dashboard | HIGH | Round 1: Q4.2 / Round 3: QH.1 | SC-15, SC-16, SC-19 | TSK-48, TSK-51 | ☐ Not Implemented |
| **FR-05.5** | Notifications persist until explicitly dismissed | HIGH | Round 3: QH.2 | SC-18 | TSK-49, TSK-51 | ☐ Not Implemented |
| **FR-05.6** | Startup check; summary banner for missed events | HIGH | Round 3: QH.3 | SC-19 | TSK-50, TSK-51 | ☐ Not Implemented |
| **FR-05.7** | Two notification types with distinct styling | HIGH | Round 1: Q4.3 | SC-15, SC-16 | TSK-48, TSK-51 | ☐ Not Implemented |
| **FR-06.1** | Persist all data in browser localStorage | HIGH | Round 3: QI.1 | — | TSK-07, TSK-08 | ☐ Not Implemented |
| **FR-06.2** | JSON export of all data | HIGH | Round 3: QI.2 | SC-20 | TSK-54, TSK-56 | ☐ Not Implemented |
| **FR-06.3** | JSON import with structure validation | HIGH | Round 3: QI.2 | SC-21, SC-23 | TSK-55, TSK-56 | ☐ Not Implemented |
| **FR-06.4** | Confirmation warning before overwrite on import | MEDIUM | Round 3: QI.2 | SC-22 | TSK-55, TSK-56 | ☐ Not Implemented |

---

## Part 2 — Non-Functional Requirements Traceability

| Req ID | Description | Priority | Elicitation Source | BDD Scenario(s) | Ticket(s) | Status |
|--------|-------------|----------|--------------------|-----------------|-----------|--------|
| **NFR-01** | Dashboard loads in < 2 seconds with ≤ 500 records | MEDIUM | Architecture constraint | — | TSK-59 | ☐ Not Verified |
| **NFR-02** | All primary actions reachable within 2 clicks | HIGH | Round 1: Q1.1 (single-user, simple) | — | TSK-60 | ☐ Not Verified |
| **NFR-03** | Date calculations use browser clock; history is immutable | HIGH | Architecture constraint | SC-14 | TSK-61 | ☐ Not Verified |
| **NFR-04** | Runs on latest Chrome, Firefox, Edge | MEDIUM | Round 2: QE.1 (web app) | — | TSK-62 | ☐ Not Verified |
| **NFR-05** | Gracefully handles empty/corrupted localStorage | LOW | Round 3: QI.1 | SC-23 (partial) | TSK-63 | ☐ Not Verified |
| **NFR-06** | Exported JSON is portable and fully re-importable | MEDIUM | Round 3: QI.2 | SC-20, SC-21 | TSK-64 | ☐ Not Verified |

---

## Part 3 — Scenario-to-Requirement Reverse Mapping

| Scenario | Title | Requirements Covered |
|----------|-------|---------------------|
| SC-01 | Add a new subscription | FR-01.1, FR-02.3 |
| SC-02 | Calculate next billing date (custom interval) | FR-01.4 |
| SC-03 | Cancel a subscription | FR-01.3, FR-04.3 |
| SC-04 | Annual spend estimate calculation | FR-01.5, FR-04.1, FR-04.2 |
| SC-05 | Add trial with linked subscription | FR-02.1 |
| SC-06 | Add standalone trial | FR-02.1, FR-02.2 |
| SC-07 | Trial expiry detection on app load | FR-02.4 |
| SC-08 | Convert expired trial | FR-02.5 |
| SC-09 | Cancel expired trial (linked subscription auto-cancelled) | FR-02.5 |
| SC-10 | Cancel standalone expired trial | FR-02.2, FR-02.5 |
| SC-11 | Confirm billing event as paid | FR-03.1, FR-03.2, FR-03.4 |
| SC-12 | Mark billing event as skipped | FR-03.2, FR-03.4 |
| SC-13 | Overdue billing event flagged and held | FR-03.1, FR-03.3 |
| SC-14 | View billing history | FR-03.4, FR-03.5, NFR-03 |
| SC-15 | Renewal notification (global lead-time) | FR-05.1, FR-05.4, FR-05.7 |
| SC-16 | Trial expiry notification (high-priority) | FR-02.6, FR-05.2, FR-05.4, FR-05.7 |
| SC-17 | Per-item lead-time override | FR-05.1, FR-05.3 |
| SC-18 | Dismiss a notification | FR-05.5 |
| SC-19 | Startup summary banner for missed events | FR-03.3, FR-05.4, FR-05.6 |
| SC-20 | Export all data as JSON | FR-06.2, NFR-06 |
| SC-21 | Import data from JSON backup | FR-06.3, NFR-06 |
| SC-22 | Import confirmation warning | FR-06.4 |
| SC-23 | Import rejects invalid JSON | FR-06.3, NFR-05 |

---

## Part 4 — Requirements Coverage Summary

| Category | Total Requirements | HIGH | MEDIUM | LOW |
|----------|--------------------|------|--------|-----|
| Functional (FR) | 30 | 22 | 8 | 0 |
| Non-Functional (NFR) | 6 | 1 | 4 | 1 |
| **Total** | **36** | **23** | **12** | **1** |

| BDD Scenarios | Total | Directly traceable to FRs |
|--------------|-------|-----------------------------|
| | 23 | 23 (100%) |

| Implementation Tickets | Total | Linked to ≥ 1 FR or NFR |
|------------------------|-------|--------------------------|
| | 69 | 69 (100%) |

---

## Part 5 — Elicitation Round Summary

| Round | Key Decisions Resolved |
|-------|----------------------|
| **Round 1** (Q1.1–Q5.3) | Single-user, no auth, web app; subscription fields; billing cycles; currency = UAH; notification lead-time = Option C (global + override); in-app only; analytics scope |
| **Round 2** (QA–QE) | Trial as separate entity; trial fields and statuses; Option B lifecycle; irregular cycle formula; no paused status; cancelled badge; manual billing confirmation; localStorage; no auth |
| **Round 3** (QF–QI) | Optional linked subscription; semi-automatic conversion; auto-cancel on trial cancel; badge on card; overdue = pending; history fields; inline banners; persistent; startup banner; localStorage; JSON export/import |

---

## Part 6 — Planning Gate Record

| Gate | Event | Date | Decision | Authorized By |
|------|-------|------|----------|---------------|
| **GATE-1 (SPEC-GATE)** | SRS v1.0 approved; specification frozen | 2026-09-21 | ✅ APPROVED | Human |
| **TSK-05 (PLAN-GATE)** | Task Decomposition v1.0 reviewed; implementation authorized | 2026-10-15 | ✅ GO | Human |
| **TSK-69 (RELEASE-GATE)** | Final acceptance pending implementation | TBD | ⏳ Pending | Human |

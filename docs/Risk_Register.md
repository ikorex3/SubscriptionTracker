# Risk Register — Subscription Tracker
### Lab Work #3 | Lifecycle Organization, Planning & Risk Management
### Version 1.0 | October 2026

**Project:** Subscription Tracker  
**Specification baseline:** `spec/SRS.md` v1.0 (GATE-1 Approved 2026-09-21)  
**Planning baseline:** `docs/Task_Decomposition.md` v1.0 (TSK-05 PLAN-GATE Approved 2026-10-15)

---

## Scoring Key

| Probability | Score | Impact | Score | Severity = P × I |
|-------------|-------|--------|-------|-----------------|
| Low (< 20%) | 1 | Low (cosmetic / minor delay) | 1 | **1–2** → Low |
| Medium (20–50%) | 2 | Medium (feature degraded / rework needed) | 2 | **3–4** → Medium |
| High (> 50%) | 3 | High (requirement unmet / gate blocked) | 3 | **6–9** → High |

---

## Category 1 — Traditional Project Risks

| Risk ID | Description | Probability | Impact | Severity | Mitigation Strategy | Owning Gate / Ticket |
|---------|-------------|-------------|--------|----------|--------------------|--------------------|
| **TR-01** | **Scope creep**: New features requested during implementation that are not in SRS v1.0, expanding scope beyond the approved baseline | Medium (2) | High (3) | **6 — High** | Strict change control: any new feature must be logged as an Addendum ticket and approved before work begins. SRS is frozen at GATE-1. | TSK-05 (PLAN-GATE) |
| **TR-02** | **Underestimated effort**: Agent or human time estimates in the Task Decomposition prove too low for complex tickets (e.g., notification engine TSK-48, trial lifecycle TSK-26) | High (3) | Medium (2) | **6 — High** | Build in a 20% buffer per phase; reprioritize MEDIUM tickets if HIGH tickets overrun. Human reviews each phase gate before proceeding. | TSK-23, TSK-32, TSK-53 |
| **TR-03** | **Requirement ambiguity discovered post-gate**: An edge case in the SRS is found during implementation that the SKED elicitation did not resolve | Medium (2) | Medium (2) | **4 — Medium** | Raise an Addendum ticket immediately; pause affected Feature tickets; resolve with a targeted human decision before resuming. Traceability matrix is the detection tool. | TSK-04, Any phase gate |
| **TR-04** | **Missing test coverage**: BDD test tickets (TSK-18–21, TSK-27–30, etc.) are skipped or partially implemented under time pressure | Medium (2) | High (3) | **6 — High** | Test tickets are mandatory prerequisites for their corresponding Verification ticket. No Verification may begin without all linked Test tickets complete. | TSK-22, TSK-31, TSK-41 |
| **TR-05** | **Documentation drift**: Code diverges from SRS over implementation iterations; final delivery does not reflect the approved specification | Medium (2) | High (3) | **6 — High** | Final Verification report (TSK-66) must cross-reference every FR/NFR against the implementation. Human final acceptance (TSK-68) is a mandatory gate before TSK-69. | TSK-66, TSK-69 (RELEASE-GATE) |

---

## Category 2 — Technical / Implementation Risks

| Risk ID | Description | Probability | Impact | Severity | Mitigation Strategy | Owning Gate / Ticket |
|---------|-------------|-------------|--------|----------|--------------------|--------------------|
| **TI-01** | **localStorage capacity exceeded**: Large billing history or many subscriptions push the ~5 MB localStorage limit, causing silent write failures | Low (1) | High (3) | **3 — Medium** | NFR-01 load test (TSK-59) includes 500-record stress test. Display a user-facing warning if storage usage exceeds 80% of estimated capacity. | TSK-07, TSK-59 |
| **TI-02** | **Date arithmetic edge cases**: Next billing date calculation (FR-01.4) produces incorrect results for month-boundary cases (e.g., Jan 31 + 1 month) or leap years | Medium (2) | High (3) | **6 — High** | Date utility module (TSK-09) must use `Date` API month arithmetic (not fixed 30-day addition). BDD test SC-02 must cover boundary cases explicitly. | TSK-09, TSK-19 |
| **TI-03** | **Browser compatibility breakage**: A CSS or JS feature used behaves differently on Firefox or Edge, breaking key UI flows | Medium (2) | Medium (2) | **4 — Medium** | NFR-04 smoke test (TSK-62) runs all primary flows on Chrome, Firefox, and Edge before RELEASE-GATE. Use only ES6+ features with wide baseline support; avoid vendor-specific APIs. | TSK-62, TSK-65 |
| **TI-04** | **localStorage cleared by user or browser policy**: User loses all data because browser privacy settings auto-clear site data | High (3) | High (3) | **9 — High** | FR-06.2/FR-06.3 (JSON export/import, TSK-54–55) directly mitigates this. Startup message prominently reminds user to export regularly. Validated in TSK-58 and TSK-64. | TSK-54, TSK-55, TSK-58 |

---

## Category 3 — AI-Specific Risks

> This category addresses risks that arise specifically from using an AI coding agent as the primary implementer. These risks are distinct from traditional software risks and require targeted mitigation strategies.

| Risk ID | Description | Probability | Impact | Severity | Mitigation Strategy | Owning Gate / Ticket |
|---------|-------------|-------------|--------|----------|--------------------|--------------------|
| **AI-01** | **Hallucinated requirements**: The coding agent generates code for features, fields, or behaviors not present in SRS v1.0 (e.g., adds currency conversion, user auth, or budget alerts that were explicitly excluded) | Medium (2) | High (3) | **6 — High** | Every Feature ticket must cite its exact FR-XX.Y requirement ID. Human validation tickets (TSK-23, TSK-32, etc.) explicitly check for out-of-scope code. The Traceability Matrix is the detection mechanism — any code path without a traced requirement is flagged for removal. | All Validation tickets; TSK-66 |
| **AI-02** | **Context window degradation**: In long implementation sessions, the agent loses awareness of earlier decisions (e.g., forgetting that billing confirmation is manual, not automatic; or that trials are separate entities), producing inconsistent behavior | High (3) | High (3) | **9 — High** | Agent re-reads `spec/SRS.md` §6 (Design Decisions) and `logs/SKED_Summary.md` at the start of each new phase. Each ticket explicitly references its requirement ID. Phase-gate human reviews (TSK-23, TSK-32, etc.) serve as re-alignment checkpoints. | Every phase transition; TSK-12, TSK-23, TSK-32 |
| **AI-03** | **Test-code error correlation**: The agent writes both the implementation and the test for the same feature in the same session. If the agent misunderstands a requirement, both the code and the test will contain the same error, causing the test to pass despite incorrect behavior | High (3) | High (3) | **9 — High** | Human validation tickets are mandatory after each Feature + Test + Verification cluster (TSK-23, TSK-32, TSK-42, TSK-45, TSK-53, TSK-58). Human runs BDD scenarios manually against the UI rather than relying solely on agent-generated test results. Final acceptance (TSK-68) is a fully human-executed end-to-end walkthrough. | TSK-23, TSK-32, TSK-42, TSK-53, TSK-68 |
| **AI-04** | **Cognitive anchoring / confirmation bias**: The agent over-relies on the first interpretation of a requirement and dismisses edge cases — e.g., always treating the first billing date as "today" rather than a user-specified date, or assuming trials always have linked subscriptions | Medium (2) | Medium (2) | **4 — Medium** | BDD scenarios explicitly cover edge cases (SC-06 standalone trial, SC-10 cancel without linked sub, SC-02 custom interval). Verification tickets (TSK-22, TSK-31, etc.) require explicit enumeration of all edge cases from the SRS. | TSK-22, TSK-31, TSK-41 |
| **AI-05** | **Specification drift via agent addenda**: The agent quietly extends the specification by adding "helpful" comments or field defaults in code that contradict the SRS (e.g., defaulting currency to USD, or adding a "notes" field not in the spec) | Medium (2) | Medium (2) | **4 — Medium** | Code review is part of every human Validation ticket. TSK-66 (final verification report) requires the agent to explicitly list every data field implemented and trace it back to its FR. Any un-traced field is flagged as unauthorized scope. | TSK-12, TSK-66, TSK-69 |
| **AI-06** | **Stale training knowledge**: The agent may produce code patterns based on outdated browser API knowledge (e.g., deprecated localStorage methods, old JS date handling patterns) that cause subtle failures in the target browsers | Low (1) | Medium (2) | **2 — Low** | NFR-04 browser smoke test (TSK-62) detects runtime failures. Agent is instructed to use only documented ES6+ standard APIs. Human review of TSK-07 (localStorage service) inspects API usage for correctness. | TSK-07, TSK-62 |

---

## Category 4 — Data & Storage Risks

| Risk ID | Description | Probability | Impact | Severity | Mitigation Strategy | Owning Gate / Ticket |
|---------|-------------|-------------|--------|----------|--------------------|--------------------|
| **DS-01** | **Corrupted import file breaks app state**: A malformed or tampered JSON import partially overwrites localStorage, leaving the app in an inconsistent state | Low (1) | High (3) | **3 — Medium** | FR-06.3 requires JSON structure validation before import is applied. SC-23 (TSK-56) tests invalid file rejection. NFR-05 (TSK-63) verifies graceful recovery from corrupted localStorage. | TSK-55, TSK-56, TSK-63 |
| **DS-02** | **Billing history mutability**: A bug allows the agent to implement history entry editing/deletion, violating NFR-03 (immutability requirement) | Low (1) | High (3) | **3 — Medium** | FR-03.5 explicitly states "entries shall not be editable or deletable." SC-14 (TSK-40) verifies the view is read-only. Verification TSK-41 specifically checks for absence of edit/delete controls. | TSK-37, TSK-40, TSK-41 |
| **DS-03** | **Data schema mismatch between export and import**: A schema change during implementation causes an older export file to be unreadable by a newer version of the app | Medium (2) | Medium (2) | **4 — Medium** | TSK-08 finalizes and locks the data schema before any feature implementation begins. Any schema change after TSK-12 (scaffolding human review) requires an explicit Addendum ticket. NFR-06 round-trip test (TSK-64) validates export/import compatibility. | TSK-08, TSK-12, TSK-64 |

---

## Category 5 — Release & Validation Risks

| Risk ID | Description | Probability | Impact | Severity | Mitigation Strategy | Owning Gate / Ticket |
|---------|-------------|-------------|--------|----------|--------------------|--------------------|
| **RV-01** | **RELEASE-GATE blocked by late-discovered NFR failure**: A non-functional requirement (e.g., NFR-01 load time, NFR-04 browser compatibility) fails verification only at Phase 8, too late for comfortable remediation | Medium (2) | High (3) | **6 — High** | NFR smoke-testing is performed incrementally — NFR-03 (immutability) is verified at TSK-41 during Phase 4, not deferred to Phase 8. NFR-01 load test runs with realistic data volume from Phase 5 onward. Phase 8 is a final confirmation, not first discovery. | TSK-59–TSK-65 |
| **RV-02** | **Human acceptance fatigue**: The final acceptance review (TSK-68) requires manually running all 23 BDD scenarios, and reduced attention causes acceptance of partially correct behavior | Low (1) | High (3) | **3 — Medium** | TSK-68 uses `docs/BDD_Scenarios.md` as a structured checklist. Each scenario has explicit Given-When-Then steps. Human validation tickets per phase (TSK-23, TSK-32, etc.) front-load the acceptance burden so TSK-68 is a confirmation, not a discovery. | TSK-68, TSK-69 |

---

## Risk Summary Dashboard

| Category | Risks | High Severity | Medium Severity | Low Severity |
|----------|-------|---------------|-----------------|--------------|
| Traditional Project | 5 | TR-01, TR-02, TR-04, TR-05 | TR-03 | — |
| Technical / Implementation | 4 | TI-02, TI-04 | TI-01, TI-03 | — |
| **AI-Specific** | **6** | **AI-01, AI-02, AI-03** | **AI-04, AI-05** | **AI-06** |
| Data & Storage | 3 | — | DS-01, DS-02, DS-03 | — |
| Release & Validation | 2 | RV-01 | RV-02 | — |
| **TOTAL** | **20** | **9 High** | **9 Medium** | **2 Low** |

---

## Top 5 Critical Risks (Severity 9)

| Rank | Risk ID | Description | Key Mitigation |
|------|---------|-------------|----------------|
| 1 | **TI-04** | localStorage auto-cleared by browser | JSON export/import (FR-06.2/06.3); user reminder on startup |
| 2 | **AI-02** | Context window degradation across long sessions | Re-read SRS §6 + SKED_Summary.md at each phase start; phase gates as re-alignment checkpoints |
| 3 | **AI-03** | Test-code error correlation (agent tests its own code) | Mandatory human validation per phase; TSK-68 fully human end-to-end walkthrough |
| 4 | **TR-01** | Scope creep during implementation | SRS frozen at GATE-1; Addendum ticket required for any change |
| 5 | **RV-01** | Late NFR failure blocks RELEASE-GATE | Incremental NFR verification; NFR-03 at Phase 4, not deferred to Phase 8 |

---

*Produced by Coding Agent (Antigravity IDE) | Lab Work #3 — Risk Management*  
*To be reviewed by Human as part of Lab 3 deliverable assessment.*

# SKED Dialogue Summary — Subscription Tracker
### Requirements Elicitation Log | September 2026

This document summarises the structured SKED requirements elicitation dialogue conducted prior to writing the Software Requirements Specification (`spec/SRS.md`). It records all initial uncertainties, questions raised across three dialogue rounds, decisions made by the human, and model assumptions that were explicitly corrected or rejected.

---

## 1. Initial Uncertainties from Lab 1

Two unresolved questions were carried forward from the initial Lab 1 project concept:

| # | Uncertainty | Description |
|---|-------------|-------------|
| U-1 | **Base currency handling** | Should the system support a configurable base currency (e.g., UAH) as a global parameter, or should each subscription store its own currency with optional conversion? |
| U-2 | **Notification lead-time scope** | Should the advance notification period (e.g., 3 days before expiry) be a single global system setting, or should it be configurable per individual subscription and trial? |

Both uncertainties were fully resolved during the elicitation dialogue (see §3).

---

## 2. Questions Raised During the Dialogue

The elicitation was conducted across **three structured rounds**, each surfacing new ambiguities from the answers provided in the previous round.

### Round 1 — System Scope, Data Model, Currency, Notifications, Analytics

| Question | Topic |
|----------|-------|
| Single-user tool or multi-tenant? | System scope |
| User roles (admin vs. regular)? | Access model |
| Sharing or export of data? | Collaboration |
| Types of billing cycles supported (fixed, irregular, one-time)? | Data model |
| Minimum required fields per subscription? | Data model |
| Are free trials a state of a subscription or a separate entity? | Domain model |
| Global base currency with conversion, per-subscription currency, or single fixed currency? | Currency |
| Source of exchange rates if needed (live API, manual, fixed at entry)? | Currency |
| Global-only, per-item-only, or global-with-override for notification lead-time? | Notifications |
| Notification delivery channels (in-app, email, push, SMS)? | Notifications |
| Same or separate triggers for trial expirations vs. regular renewals? | Notifications |
| Which aggregate analytics views are required? | Analytics |
| Current state only or full billing history? | Analytics |
| Budget limit alerts needed? | Analytics |

### Round 2 — Trial Lifecycle, Billing Cycles, Currency Follow-up, Subscription States

| Question | Topic |
|----------|-------|
| Is the linked paid subscription mandatory or optional in a trial? | Trial model |
| What is the auto-conversion trigger — date-based or user-confirmed? | Trial lifecycle |
| What happens to the linked subscription when a trial is cancelled? | Trial lifecycle |
| How is an "irregular" billing cycle defined by the user? | Billing cycle |
| How does the system estimate annual spend for irregular cycles? | Analytics |
| Does Option A (global base currency) mean all costs are entered in UAH directly? | Currency |
| Is currency conversion needed at all? | Currency |
| Is a "paused" subscription status required? | Domain lifecycle |
| Where does a cancelled subscription appear in the UI? | UI behaviour |
| What triggers an entry in the billing history log? | Billing history |
| What platform is the target? (web, desktop, mobile) | Architecture |
| Is authentication required? | Architecture |
| Where is data stored? (localStorage, IndexedDB, cloud) | Architecture |

### Round 3 — Trial Edge Cases, Billing Confirmation Details, Notification UI, Storage

| Question | Topic |
|----------|-------|
| Is the linked subscription in Option B mandatory or optional? | Trial model |
| Exact trigger and mechanism for trial auto-conversion | Trial lifecycle |
| What happens to the linked subscription when trial is cancelled? | Trial lifecycle |
| How does the UI surface a pending billing confirmation? | UI/UX |
| What happens if a billing date passes without user confirmation? | Billing behaviour |
| What data fields are stored per billing history entry? | Data model |
| Where and how are in-app alerts displayed? | Notification UI |
| Are notifications persistent or ephemeral? | Notification behaviour |
| Are notifications checked in background, or only on app open? | Architecture |
| localStorage vs. IndexedDB vs. local file for storage? | Architecture |
| Is a data backup/restore feature required? | Data management |

---

## 3. Decisions Made by the Human

### 3.1 Currency — Strictly UAH, No Conversion

**Decision:** All subscription costs are entered directly in **UAH (Ukrainian Hryvnia)**. No multi-currency support. No currency conversion logic. No exchange rate APIs.

- Every cost field accepts and stores a single decimal value in UAH.
- The annual and monthly spend estimates are computed purely in UAH.
- This eliminates an entire class of complexity (FX rates, rounding, stale data) and keeps the data model flat.

*Resolved uncertainty: U-1*

---

### 3.2 Notification Lead-Time — Hybrid (Global Default + Per-Item Override)

**Decision:** The system uses **Option C**: a global default notification lead-time (default: **3 days**) that applies to all subscriptions and trials, but each individual item may define its own override value.

- Two separate global settings exist: one for **regular renewal** notifications, one for **trial expiry** notifications.
- Per-item overrides are optional; if absent, the global default is used.
- Trial expiry notifications are treated as higher priority than renewal notifications.

*Resolved uncertainty: U-2*

---

### 3.3 Architecture — Single-User, Client-Only, localStorage, No Auth

**Decision:** The system is a **lightweight browser-based web application** with no backend, no authentication, and no cloud storage.

- Data is persisted exclusively in **browser `localStorage`**.
- No login screen or user account system is needed.
- A **JSON export/import** feature is provided to allow the user to back up and restore data, guarding against localStorage being cleared.

---

### 3.4 Trial Period — Separate Entity, Explicit Human Confirmation on Expiry

**Decision:** Free trials are modelled as a **distinct entity** separate from subscriptions, with their own lifecycle and status.

- Trial statuses: `active` → `expired` → `converted` / `cancelled`
- On app load, the system detects if any active trial's end date has passed and marks it `expired`.
- The system then **prompts the user** to choose: **Convert** (trial → `converted`, linked subscription → `active`) or **Cancel** (trial → `cancelled`, linked subscription → `cancelled` if present).
- Conversion is **semi-automatic**: the system detects expiry automatically, but the final transition requires explicit human confirmation — preventing unwanted charges.
- A trial may optionally link to a future paid subscription. If no link exists, only the trial record is updated.
- A subscription may exist independently of any trial (direct subscriptions).

---

### 3.5 Billing Confirmations — Manual, with Paid/Skipped Status

**Decision:** Billing events are **not recorded automatically**. The user explicitly confirms each billing event.

- When a billing date arrives (or passes), a confirmation badge appears on the subscription card.
- The user marks the event as **`paid`** or **`skipped`**.
- If the date passes without confirmation, the event becomes **overdue** and remains pending until manually resolved — it is never silently skipped or auto-advanced.
- Upon confirmation, the next billing date is recalculated: `Previous Date + Billing Interval`.
- Each confirmed event is logged immutably in the billing history.

---

## 4. Corrected / Rejected Model Assumptions

The following approaches were considered by the agent during elicitation but were **explicitly rejected** by the human.

### 4.1 ❌ Rejected: Live Exchange Rate APIs and Multi-Currency Complexity

- **Considered:** Fetching live exchange rates from an external API (e.g., NBU API) to convert subscription costs to a base currency.
- **Reason for rejection:** Unnecessary complexity for a personal tool. The user is willing to enter all costs in UAH directly, eliminating the need for any conversion logic.
- **Resolution:** Single fixed currency (UAH). No API calls. No FX fields in the data model.

---

### 4.2 ❌ Rejected: Remote / Background Push Notifications and Email Alerts

- **Considered:** Push notifications (browser or mobile), email reminders, or background scheduled checks that fire even when the app is closed.
- **Reason for rejection:** Requires a backend server, service worker infrastructure, or a notification API key — all out of scope for a client-only tool.
- **Resolution:** All notifications are **in-app inline banners** on the main dashboard. They are triggered on app load only. A **startup summary banner** compensates for the lack of background delivery by listing all events missed since the last visit.

---

### 4.3 ❌ Rejected: Intermediate Subscription States (e.g., "Paused")

- **Considered:** A `paused` status for subscriptions temporarily suspended by the user or the service provider.
- **Reason for rejection:** Adds lifecycle complexity without a clear use case in the stated scope. The user explicitly chose to keep the domain lifecycle predictable and minimal.
- **Resolution:** Subscription statuses are strictly `active` and `cancelled` only. Trial statuses are `active`, `expired`, `converted`, and `cancelled`.

---

## 5. Elicitation Round Outcome Summary

| Round | Questions Asked | Key Outcomes |
|-------|----------------|--------------|
| **Round 1** | 14 | Defined scope (single-user, web), data model fields, billing cycles, currency = UAH, notifications = Option C, analytics = monthly + annual + history |
| **Round 2** | 13 | Trial = separate entity + Option B lifecycle; irregular cycles = fixed N-day interval; no paused state; cancelled badge; manual billing confirmation; localStorage; no auth |
| **Round 3** | 11 | Linked subscription = optional; semi-auto conversion via prompt; auto-cancel linked sub; billing badge on card; overdue = pending; history fields; inline banners; persistent; startup summary; localStorage; JSON backup |
| **Total** | **38** | All ambiguities resolved; SRS written with 30 FRs + 6 NFRs |

---

*This log was produced by the AI coding agent (Antigravity / Claude Sonnet 4.6 Thinking) operating in the Antigravity IDE as part of the ПІС Lab 1 requirements engineering workflow.*

# Software Requirements Specification
## Subscription Tracker
### Version 1.0 | September 2026

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for the **Subscription Tracker** system. It is intended to serve as the authoritative reference for design, implementation, testing, and acceptance of the system.

The document was produced through a structured requirements elicitation process using the **SKED methodology**, covering three rounds of targeted clarifying questions to resolve all identified ambiguities before specification writing.

### 1.2 Scope

**Subscription Tracker** is a single-user, browser-based web application that provides a centralized dashboard for managing recurring digital subscriptions and free trial periods.

The system shall:
- Track active and cancelled subscriptions with automatic billing date calculation
- Manage free trial periods with configurable expiry detection and conversion workflows
- Maintain a manual billing history log with paid/skipped status
- Display aggregate monthly and annual spend analytics in UAH
- Alert the user to upcoming renewals and trial expirations via in-app notifications
- Persist all data in browser `localStorage` with JSON export/import support

The system shall **not** include:
- User authentication or multi-user support
- Automatic payment processing or bank API integration
- Currency conversion or multi-currency support
- Mobile or native desktop applications
- External backend servers or cloud databases
- Budget limits or spending cap alerts

### 1.3 Intended Audience

| Audience | Purpose |
|----------|---------|
| Development team | Implementation reference |
| Academic reviewers | Lab assessment |
| Testers | Acceptance testing baseline |

### 1.4 Document Conventions

| Notation | Meaning |
|----------|---------|
| `FR-XX.Y` | Functional Requirement, group XX, item Y |
| `NFR-XX` | Non-Functional Requirement |
| `SC-XX` | BDD Acceptance Scenario (see `docs/BDD_Scenarios.md`) |
| **[HIGH]** | Must be implemented in the first release |
| **[MEDIUM]** | Important, but may be deferred |
| **[LOW]** | Nice-to-have, lowest priority |

### 1.5 Overview

| Section | Content |
|---------|---------|
| §2 | Overall system description and constraints |
| §3 | Domain glossary |
| §4 | Functional requirements |
| §5 | Non-functional requirements |
| §6 | Key design decisions resolved during elicitation |

---

## 2. Overall Description

### 2.1 Product Perspective

Subscription Tracker is a **standalone, client-side web application** with no backend server. It runs entirely in the user's browser. Data is stored exclusively in `localStorage`. The user accesses the application directly via a local HTML file or simple static server — no login is required.

```
┌──────────────────────────────────────────────┐
│              Browser (Client Only)           │
│                                              │
│  ┌────────────┐    ┌──────────────────────┐  │
│  │  Web UI    │◄──►│   Application Logic  │  │
│  │ (HTML/CSS/ │    │  (JavaScript/ES6+)   │  │
│  │    JS)     │    └──────────┬───────────┘  │
│  └────────────┘               │              │
│                    ┌──────────▼───────────┐  │
│                    │     localStorage     │  │
│                    └──────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 2.2 Product Functions (Summary)

| # | Function | Priority |
|---|----------|----------|
| 1 | Add, edit, and cancel recurring subscriptions | HIGH |
| 2 | Add and manage free trial periods | HIGH |
| 3 | Auto-detect expired trials and prompt the user for resolution | HIGH |
| 4 | Manually confirm billing events as paid or skipped | HIGH |
| 5 | Flag overdue billing events on subscription cards | HIGH |
| 6 | Display total monthly and annual spend analytics | HIGH |
| 7 | Show persistent in-app notification banners for upcoming events | HIGH |
| 8 | Display a startup summary banner for events missed while app was closed | HIGH |
| 9 | Export all data as a JSON file and import from a JSON backup | HIGH |

### 2.3 User Characteristics

- **Single, non-technical end-user**
- No authentication or login required
- The user manages their own digital subscriptions and trials
- The user is expected to open the application periodically (not necessarily daily)
- All cost values are entered directly in UAH; no currency conversion is needed

### 2.4 Constraints

| Constraint | Detail |
|------------|--------|
| No backend | All logic and storage is client-side only |
| Single currency | UAH (Ukrainian Hryvnia); no conversion |
| Storage medium | Browser `localStorage` (~5 MB capacity) |
| No authentication | No login screen or password |
| No payment integration | No connection to banks, cards, or payment APIs |
| No push notifications | Alerts are only delivered when the app is open |

### 2.5 Assumptions and Dependencies

- The user's browser supports `localStorage` and JavaScript ES6+
- The application is tested on the latest versions of Chrome, Firefox, and Edge
- The system clock is trusted for all date calculations; no external time service is used
- Exchange rate conversion is out of scope; the user enters all costs in UAH
- The user is responsible for periodically opening the application to receive notifications
- The `localStorage` may be cleared by the user's browser; the export/import feature mitigates this risk

---

## 3. Domain Glossary

| Term | Definition |
|------|------------|
| **Subscription** | A recurring paid service agreement, tracked by service name, cost, billing interval, and status |
| **Free Trial** | A temporary, zero-cost access period to a service, with a defined start date and end date |
| **Billing Interval** | The recurrence period of a subscription payment: `monthly`, `annual`, or `custom` (N days/months) |
| **Billing Date** | The calendar date on which a subscription payment is due |
| **Next Billing Date** | Automatically calculated as: `Previous Billing Date + Billing Interval` |
| **Annual Spend Estimate** | Calculated as: `(Cost ÷ Interval in days) × 365`; for monthly: interval = 30 days; for annual: 365 |
| **Monthly Spend Estimate** | Calculated as: `Annual Spend Estimate ÷ 12` |
| **Billing Event** | A single instance of a payment becoming due for a subscription |
| **Billing History** | An immutable log of all user-confirmed billing events |
| **Conversion** | The lifecycle transition of a Free Trial to an Active paid Subscription |
| **Notification** | An in-app inline banner alerting the user to an upcoming or overdue event |
| **Notification Lead-Time** | The number of days before an event at which a notification is triggered |
| **Global Default Lead-Time** | A user-configurable system-wide lead-time applied to all items unless overridden |
| **Per-Item Lead-Time Override** | A lead-time value configured on a specific subscription or trial that overrides the global default |
| **Overdue Billing Event** | A billing event whose due date has passed without user confirmation; remains pending until resolved |
| **Startup Summary Banner** | An inline banner displayed on app load, summarizing all events that occurred since the last visit |
| **Payment Status** | The outcome of a confirmed billing event: `paid` or `skipped` |
| **Export** | Serialization of all `localStorage` data into a downloadable `.json` file |
| **Import** | Restoration of application data from a user-selected `.json` backup file into `localStorage` |

### Status Reference

| Entity | Valid Statuses |
|--------|---------------|
| Subscription | `active`, `cancelled` |
| Free Trial | `active`, `expired`, `converted`, `cancelled` |
| Billing Event (History) | `paid`, `skipped` |

---

## 4. Functional Requirements

### 4.1 Subscription Management

#### FR-01.1 — Add Subscription [HIGH]
The system shall allow the user to create a new subscription record with the following fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Service name | Text | Yes | e.g., "Netflix" |
| Cost | Decimal | Yes | In UAH |
| Billing interval type | Enum | Yes | `monthly` / `annual` / `custom` |
| Custom interval value | Positive integer | If custom | Number of days or months |
| Custom interval unit | Enum | If custom | `days` / `months` |
| First billing date | Date | Yes | Starting point for billing cycle |

A newly created subscription shall have status `active` by default.

#### FR-01.2 — Edit Subscription [HIGH]
The system shall allow the user to modify any field of an existing subscription at any time.

#### FR-01.3 — Cancel Subscription [HIGH]
The system shall allow the user to set a subscription's status to `cancelled`. A cancelled subscription shall remain visible in the subscription list with a distinct **"Cancelled"** badge and shall be excluded from all spend calculations.

#### FR-01.4 — Calculate Next Billing Date [HIGH]
The system shall automatically calculate and store the next billing date using the formula:
> **Next Billing Date = Last Confirmed Billing Date + Billing Interval**

For interval types:
- `monthly` → add 1 month
- `annual` → add 1 year
- `custom (N days)` → add N days
- `custom (N months)` → add N months

#### FR-01.5 — Annual Spend Estimate [HIGH]
The system shall calculate the annual spend estimate per subscription as:
> **Annual Spend = (Cost ÷ Interval in days) × 365**

Normalization rules:
- `monthly` → Interval in days = 30
- `annual` → Interval in days = 365
- `custom (N days)` → Interval in days = N
- `custom (N months)` → Interval in days = N × 30

---

### 4.2 Free Trial Management

#### FR-02.1 — Add Free Trial [HIGH]
The system shall allow the user to create a free trial record with the following fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Linked service name | Text | Yes | e.g., "Adobe CC" |
| Start date | Date | Yes | When trial was activated |
| End date | Date | Yes | When trial expires |
| Linked paid subscription | Reference | No | Optional reference to an existing or new subscription |

A newly created trial shall have status `active` by default. Cost is assumed to be 0 UAH.

#### FR-02.2 — Standalone Trial [MEDIUM]
A free trial may exist without any linked paid subscription (covers cases where the user intends to cancel before the trial ends).

#### FR-02.3 — Subscription Without Trial [MEDIUM]
A paid subscription may be created independently, without any associated free trial.

#### FR-02.4 — Trial Expiry Detection [HIGH]
On application load, the system shall evaluate all trials with status `active`. If `Current Date > Trial End Date`, the system shall update the trial's status to `expired`.

#### FR-02.5 — Trial Expiry Resolution Prompt [HIGH]
For each trial with status `expired`, the system shall display a resolution prompt offering the user two choices:

| Choice | Effect on Trial | Effect on Linked Subscription |
|--------|-----------------|-------------------------------|
| **Convert** | Status → `converted` | Status → `active` (if linked) |
| **Cancel** | Status → `cancelled` | Status → `cancelled` (if linked, automatically) |

If the trial has no linked subscription, only the trial status is updated.

#### FR-02.6 — Upcoming Trial Expiry Notification [HIGH]
The system shall generate a `TRIAL_EXPIRY` notification when:
> `(Trial End Date − Current Date) ≤ Trial Notification Lead-Time`

This notification shall be displayed with **high-priority styling** (see FR-05.7).

---

### 4.3 Billing History & Confirmation

#### FR-03.1 — Billing Due Flag [HIGH]
When `Current Date ≥ Subscription's Next Billing Date`, the system shall display a confirmation badge on the subscription card indicating that a billing event is pending.

#### FR-03.2 — Confirm Billing Event [HIGH]
The user shall be able to resolve a pending billing event by selecting one of:
- **Mark as Paid** → creates a history entry with status `paid`
- **Mark as Skipped** → creates a history entry with status `skipped`

Upon confirmation, the next billing date is recalculated:
> **New Next Billing Date = Date of Confirmation + Billing Interval**

The confirmation badge on the subscription card shall be removed.

#### FR-03.3 — Overdue Billing Events [HIGH]
If `Current Date > Next Billing Date` and the event has not been confirmed, the system shall mark the event as **overdue**. It shall remain pending on the subscription card — visually distinguished from standard due events — until the user manually resolves it. The event shall not be skipped silently or auto-advanced.

#### FR-03.4 — Billing History Entry Fields [MEDIUM]
Each confirmed billing event shall be recorded in the billing history log with:

| Field | Value |
|-------|-------|
| Subscription name | Name of the subscription |
| Amount | Cost in UAH |
| Date confirmed | The date the user marked as paid or skipped |
| Payment status | `paid` / `skipped` |

#### FR-03.5 — View Billing History [MEDIUM]
The system shall provide a dedicated view of the complete billing history log, sorted by date descending by default. Individual history entries shall not be editable or deletable by the user.

---

### 4.4 Analytics

#### FR-04.1 — Total Monthly Spend [HIGH]
The system shall display the estimated total monthly expenditure across all **active** subscriptions:
> **Total Monthly = Σ (Annual Spend Estimate ÷ 12)** for all active subscriptions

#### FR-04.2 — Total Annual Spend [HIGH]
The system shall display the estimated total annual expenditure across all **active** subscriptions:
> **Total Annual = Σ Annual Spend Estimate** for all active subscriptions

#### FR-04.3 — Analytics Scope [MEDIUM]
Cancelled subscriptions shall be excluded from all spend calculations. Free trials (cost = 0) contribute 0 UAH to analytics.

---

### 4.5 Notifications

#### FR-05.1 — Global Renewal Lead-Time Setting [HIGH]
The system shall maintain a user-configurable global default notification lead-time (in days) for subscription renewals.
- **Default value: 3 days**

#### FR-05.2 — Global Trial Lead-Time Setting [HIGH]
The system shall maintain a user-configurable global default notification lead-time (in days) for trial expirations.
- **Default value: 3 days**

#### FR-05.3 — Per-Item Lead-Time Override [MEDIUM]
Each individual subscription and each individual trial may define its own notification lead-time, which overrides the applicable global default for that item only.

#### FR-05.4 — Notification Display Location [HIGH]
Active notifications shall be displayed as **inline banners** on the main dashboard, clearly visible without any user interaction.

#### FR-05.5 — Notification Persistence [HIGH]
Notifications shall remain visible until explicitly dismissed by the user via a dismiss action (e.g., clicking an × button). Dismissed notifications shall not reappear unless a new trigger condition is met.

#### FR-05.6 — Startup Check & Summary Banner [HIGH]
On every application load, the system shall:
1. Evaluate all subscriptions and trials against the current date
2. Detect any events that occurred since the application was last opened (trials expired, billing events became overdue)
3. If such events exist, display a **startup summary banner** listing all missed events
4. The startup summary banner shall be persistent until dismissed

#### FR-05.7 — Notification Type Distinction [HIGH]
The system shall distinguish between two notification types with different visual styling:

| Type | Trigger Condition | Priority Styling |
|------|------------------|-----------------|
| `RENEWAL` | `(Next Billing Date − Current Date) ≤ Renewal Lead-Time` | Standard (e.g., blue/amber) |
| `TRIAL_EXPIRY` | `(Trial End Date − Current Date) ≤ Trial Lead-Time` | **High priority** (e.g., red/warning) |

---

### 4.6 Data Management

#### FR-06.1 — localStorage Persistence [HIGH]
All application data — subscriptions, trials, billing history, notification settings, and global configuration — shall be stored in and retrieved from browser `localStorage`.

#### FR-06.2 — JSON Export [HIGH]
The system shall provide a clearly labeled button to export all application data as a single structured `.json` file, downloadable to the user's device. The JSON file shall contain all subscriptions, trials, billing history, and settings.

#### FR-06.3 — JSON Import [HIGH]
The system shall provide a button to import data from a user-selected `.json` file. On successful import, all current `localStorage` data shall be replaced with the imported data. The system shall validate the JSON structure before applying and display an error message if the file is invalid.

#### FR-06.4 — Import Confirmation Warning [MEDIUM]
Before overwriting existing data during an import, the system shall display a confirmation dialog:
> *"This will permanently overwrite all existing data. This action cannot be undone. Continue?"*

The import shall only proceed if the user explicitly confirms.

---

## 5. Non-Functional Requirements

#### NFR-01 — Performance [MEDIUM]
The application shall load and render the main dashboard in under **2 seconds** on a standard modern browser, with up to 500 subscription records in `localStorage`.

#### NFR-02 — Usability [HIGH]
The UI shall be self-explanatory. All primary actions (add, edit, cancel, confirm billing, dismiss notification, export, import) shall be reachable within **2 clicks** from the main dashboard.

#### NFR-03 — Data Integrity [HIGH]
- All date calculations use the browser's local system clock
- The application shall not depend on any external time service or API
- Billing history entries shall be immutable once created

#### NFR-04 — Browser Compatibility [MEDIUM]
The application shall function correctly on the latest stable releases of Google Chrome, Mozilla Firefox, and Microsoft Edge.

#### NFR-05 — Graceful Degradation [LOW]
The system shall gracefully handle a corrupted, malformed, or empty `localStorage` state by reinitializing with empty data and displaying an appropriate user-facing message.

#### NFR-06 — Data Portability [MEDIUM]
The exported JSON file shall be self-contained and fully importable into any browser instance of the application without data loss or format errors.

---

## 6. Key Design Decisions (Resolved During Elicitation)

| Decision Point | Options Considered | Resolution |
|---------------|-------------------|------------|
| **Currency model** | Global base + conversion; per-subscription currency; single fixed currency | **Single fixed currency (UAH).** User enters all costs in UAH directly. No conversion. |
| **Notification lead-time scope** | Global only; per-item only; global with per-item override | **Global default with per-item override.** Each item may override the global setting. |
| **Trial model** | Part of subscription entity; separate entity | **Separate entity.** Trials have their own lifecycle and may optionally link to a paid subscription. |
| **Trial-to-subscription conversion** | Manual; automatic on date | **Semi-automatic.** System detects expiry; user manually confirms conversion or cancellation. |
| **Billing confirmation** | Automatic (date-based); manual (user confirms) | **Manual.** User explicitly marks each event as paid or skipped. |
| **Cancelled subscription display** | Remove from list; keep with badge | **Keep with "Cancelled" badge.** Preserves historical visibility. |
| **Overdue billing behavior** | Auto-skip; silent advance; flag as overdue | **Flag as overdue.** Remains pending until user resolves it. |
| **Data storage** | localStorage; IndexedDB; cloud | **localStorage.** Zero configuration, sufficient for personal scope. |
| **Backup strategy** | None; cloud sync; JSON export/import | **JSON export/import.** Simple, portable, user-controlled backup. |
| **Authentication** | Login/password; no auth | **No authentication.** Single-user, local tool. |

---

*See also:*
- [`spec/Concept.md`](Concept.md) — Initial domain concept document
- [`docs/BDD_Scenarios.md`](../docs/BDD_Scenarios.md) — BDD acceptance scenarios (Given-When-Then)
- [`docs/Traceability_Matrix.md`](../docs/Traceability_Matrix.md) — Requirements traceability matrix

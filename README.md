# Subscription Tracker

> A centralized information system for managing digital subscriptions and monitoring free trial periods to prevent unwanted charges.

## Local Configuration
- Currency: UAH
- Default alert period: 3 days before trial ends

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Domain Model](#domain-model)
- [Use Cases](#use-cases)
- [Project Structure](#project-structure)
- [Coding Convention](#coding-convention)
- [Development Tooling](#development-tooling)
- [Getting Started](#getting-started)

---

## Overview

**Subscription Tracker** is an information system designed to give users full visibility and control over their recurring digital service payments and active free trial periods. As the number of streaming platforms, SaaS tools, and online services continues to grow, it becomes increasingly easy to lose track of what you are paying for — or to be charged automatically once a trial expires unexpectedly.

This system addresses that problem by providing a single place to:

- Record every active subscription and trial in one dashboard.
- Track upcoming billing dates and trial expiration deadlines.
- Receive advance notifications before a trial converts to a paid plan.
- Calculate total spending across all services for any given month or year.

---

## Key Features

| Feature | Description |
|---|---|
| **Subscription Management** | In the Web UI: create, filter (`All` / `Active` / `Cancelled`), confirm billing (`Mark Paid` / `Mark Skipped`), and cancel (`soft delete`) recurring digital services; editing existing subscription fields is available via the REST API (`PUT /subscriptions/{id}`). |
| **Trial Period Monitoring** | Track the exact start and end dates of free trials with configurable advance alerts. |
| **Billing Event Logging** | Log each payment event, including amount, date, and confirmation or cancellation status. |
| **Expense Reporting** | Summarize total monthly and annual costs directly in `UAH` with no currency conversion. |
| **Upcoming Trial Alerts** | Generate a prioritized list of trials approaching their paid-conversion date. |
| **Cancellation Recording** | Mark a subscription as cancelled and retain a history of past services. |

---

## Domain Model

The system is built around three core entities:

### Subscription
Represents a recurring paid digital service agreement.

- **Service name** — e.g., Spotify, Crunchyroll, Google AI, Netflix.
- **Billing frequency** — monthly or annual.
- **Cost** — the amount charged per billing cycle.
- **Currency** — fixed to `UAH` (no currency conversion).
- **Payment method** — the card or account used for payment.

### Trial Period
Represents a free promotional access window tied to a subscription.

- **Start date** — when the trial was activated.
- **End date** — when the trial expires and billing begins.
- **Advance notification threshold** — how many days before expiration the user should be alerted (e.g., 3 days).

### Billing Event
Represents a single payment transaction associated with a subscription.

- **Next payment date** — the scheduled date for the next charge.
- **Transaction amount** — the exact value to be debited.
- **Status** — whether the payment was confirmed, pending, or cancelled.

---

## Use Cases

1. **Add a new subscription or trial** — Record a newly activated service or promotional period, including all relevant billing and scheduling details.
2. **Calculate total expenses** — Compute the aggregate monthly and annual cost of all active subscriptions directly in `UAH` (no currency conversion).
3. **List expiring trials** — Generate a sorted list of all free trials that are approaching their end date, enabling users to decide whether to keep or cancel each service before being charged.
4. **Cancel a subscription** — Mark a subscription as cancelled, logging the cancellation date and preserving the historical record.

---

## Project Structure

```
lab1/
├── src/                  # Application source code
│   ├── domain/           # Core calculations, store, and validation logic
│   ├── routes/           # Modular HTTP REST API route handlers
│   ├── utils/            # Lightweight router and request/action logger
│   ├── app.js            # App factory, static UI serving, and HTTP dispatcher
│   └── server.js         # HTTP server startup entry point
├── public/               # Lightweight zero-dependency Web UI (HTML/CSS/ES6+)
│   ├── index.html        # Main dashboard page
│   ├── styles.css        # Responsive styles and status badges
│   └── app.js            # Frontend API client and DOM controller
├── spec/                 # System specifications and concept documents
│   ├── Concept.md        # Formal domain and use-case specification
│   ├── SRS.md            # Software Requirements Specification (v1.0)
│   └── SRS_Addendum.md   # Client-Server REST API architecture addendum
├── docs/                 # Documentation & Verification Guides
│   ├── API_Reference.md          # Complete REST API technical reference
│   ├── API_Verification_Guide.md # Contract testing scenarios
│   ├── BDD_Scenarios.md          # Acceptance test scenarios
│   ├── Doc_Verification_Report.md# Documentation vs. code/UI verification report
│   ├── Task_Decomposition.md     # Phase and ticket breakdown
│   ├── Traceability_Matrix.md    # Requirements traceability matrix
│   └── User_Guide.md             # End-user guide for the Web UI
├── tests/                # Automated unit and contract test suites
│   ├── unit.test.js      # Domain calculations unit tests
│   ├── logger.test.js    # Request & action logging tests
│   ├── contract.test.js  # OpenAPI 3.0.3 contract tests (P-01..P-13, N-01..N-08)
│   └── addendum.test.js  # CHG-01 status filter unit & contract tests
├── logs/                 # Activity, verification, and gate logs
│   ├── AiAgent.md        # AI coding agent profile
│   ├── SpecGate.md       # SPEC-GATE review log
│   └── TestGate.md       # TEST-GATE review log
├── openapi.yaml          # Formal OpenAPI 3.0.3 contract specification
└── README.md             # This file
```

---

## Coding Convention

This codebase targets **Node.js v25** using native **ES Modules** (`"type": "module"` in `package.json`).

### Formatting & Syntax
- **Indentation:** 2 spaces (no tabs).
- **Quotes:** Single quotes (`'...'`) for strings; double quotes only when avoiding escaped single quotes inside a string; template literals only for interpolation or multiline strings.
- **Semicolons:** Always terminate statements with semicolons (`;`).
- **Imports:** Always use explicit `.js` file extensions for relative module imports (e.g., `import { Store } from './domain/store.js';`) and `node:` prefixes for built-in modules (`node:http`, `node:crypto`, `node:fs`, `node:path`).
- **Trailing newline:** End every source file with a single newline.

### Naming
- **Variables, functions, methods, and JSON/object properties:** `camelCase` (e.g., `calculateNextBillingDate`, `serviceName`).
- **Classes:** `PascalCase` (e.g., `Store`, `Logger`, `Router`).
- **Module-level constants & logged action names:** `UPPER_SNAKE_CASE` (e.g., `SUBSCRIPTION_STATUS_FILTERS`, `CREATE_SUBSCRIPTION`, `RESOLVE_TRIAL`).
- **Source filenames:** `camelCase` (e.g., `billingEvents.js`).

### Documentation (JSDoc)
- Public modules, classes, domain functions, and route registrars use structured JSDoc blocks (`@param`, `@returns`, `@throws`) documenting non-obvious invariants (in-memory store semantics, soft deletes, immutable billing history, and error codes).

---

## Development Tooling

This project is developed with the assistance of an **AI coding agent** operating inside the **Antigravity (Google Agentic IDE)** environment.

| Property | Value |
|---|---|
| **Environment** | Antigravity — Google Agentic IDE |
| **Agent base model** | Claude Sonnet 4.6 (Thinking) |
| **Repository access** | Direct local filesystem access to the full workspace |
| **Context analysis** | Automatic file-tree indexing across `/spec`, `/src`, `/docs`, `/logs`, `/tests` |
| **Interaction method** | Natural language directives via the built-in agent chat interface |

The agent supports the following operations:

- **Structure analysis** — scanning the file tree and reading specification artifacts.
- **Code and file manipulation** — creating new files, editing and refactoring existing ones.
- **Validation** — checking implementation against the specification (SDD compliance).
- **Instruction execution** — applying approved edits (human retains control over Git commits).
- **Changelog updates** — documenting implemented changes and new features for project history.

---

## Getting Started

### Prerequisites & Runtime
- **Node.js v25** (ES Modules enabled via `"type": "module"` in `package.json`).
- **Zero external `npm` dependencies:** no `npm install` step is required; the server, router, Web UI, and test suite use Node.js built-in modules and vanilla browser ES6+ only.

### Configuration & Persistence Caveat
- **`PORT` environment variable:** defaults to `4010` (`http://localhost:4010`).
- **Currency:** fixed to `UAH` (no currency conversion).
- **Default lead times:** `3` days for both renewal and trial expiry alerts (configurable at runtime via Settings).
- **In-memory persistence:** all data (`subscriptions`, `trials`, `billingEvents`, `notifications`, `settings`) is stored in memory for the lifetime of the server process and resets on restart. Use **Export JSON** / **Import Snapshot** in the Web UI (or `GET /system/export` and `POST /system/import`) to persist backups across restarts.

### Running the Server & Web UI
```bash
# Start the REST API + Web UI server (default port 4010)
node src/server.js
```

On Windows:
- **PowerShell:** `$env:PORT=4010; node src/server.js` (if `npm test` is blocked by execution policy for `npm.ps1`, use `npm.cmd test` or run `node` directly).
- **CMD:** `set PORT=4010 && node src/server.js` (or `npm start`).

Once running, open the Web UI in your browser at:
- **http://localhost:4010**

### Running Automated Test Suites
```bash
# Using npm (or npm.cmd on Windows PowerShell)
npm test

# Or directly with Node's built-in test runner
node --test tests/unit.test.js tests/logger.test.js tests/contract.test.js tests/addendum.test.js
```

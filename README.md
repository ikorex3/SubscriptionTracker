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
| **Subscription Management** | Add, edit, and cancel records for any recurring digital service (music, video, cloud, SaaS, etc.). |
| **Trial Period Monitoring** | Track the exact start and end dates of free trials with configurable advance alerts. |
| **Billing Event Logging** | Log each payment event, including amount, date, and confirmation or cancellation status. |
| **Expense Reporting** | Summarize total costs for a selected period, with currency conversion to a base currency (e.g., UAH). |
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
- **Currency** — the currency of the charge (e.g., UAH, USD, EUR).
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
2. **Calculate total expenses** — Compute the aggregate cost of all active subscriptions for a selected month or year, converting amounts to the base currency where necessary.
3. **List expiring trials** — Generate a sorted list of all free trials that are approaching their end date, enabling users to decide whether to keep or cancel each service before being charged.
4. **Cancel a subscription** — Mark a subscription as cancelled, logging the cancellation date and preserving the historical record.

---

## Project Structure

```
lab1/
├── src/          # Application source code
├── spec/         # System specifications and concept documents
│   └── Concept.md        # Formal domain and use-case specification
├── docs/         # Additional project documentation
├── tests/        # Automated test suites
├── logs/         # Development and agent activity logs
│   └── AiAgent.md        # AI coding agent profile and capabilities log
└── README.md     # This file
```

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

> **Note:** The `src/` directory is currently empty. Implementation will be added as the project develops.

1. **Clone the repository** and open it in your preferred editor or IDE.
2. Review the system concept in [`spec/Concept.md`](spec/Concept.md) to understand the full domain model.
3. Follow the project's specification to implement the core entities: `Subscription`, `TrialPeriod`, and `BillingEvent`.
4. Place all application source files under `src/` and corresponding test files under `tests/`.
5. Update this README and `docs/` as new features are implemented.

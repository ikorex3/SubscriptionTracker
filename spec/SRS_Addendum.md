# SRS Addendum: Architecture Transition to REST API
### Subscription Tracker | Lab Work #4

**Baseline SRS:** [`SRS.md`](SRS.md) v1.0 (GATE-1 Approved)  
**Date:** October 2026  

## 1. Context & Purpose
As part of the architectural evolution for Lab Work #4, the **Subscription Tracker** application transitions from a pure client-side `localStorage` model to a robust **client-server REST API architecture**. 

This addendum formally documents the backend API contracts, resource mappings, and architectural constraints introduced to support the transition while maintaining full backward compatibility with the functional requirements defined in SRS v1.0.

---

## 2. Architectural Changes
1. **Client-Server Separation:** The business logic and data persistence are abstracted behind a standardized HTTP REST API documented via OpenAPI 3.0.3 (`openapi.yaml`).
2. **Persistence Layer:** Direct browser `localStorage` calls are replaced by asynchronous HTTP requests (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) to the backend server (or Mock API server during testing).
3. **Data Integrity & Immutability:** 
   - Financial billing history events (`/billing-events`) are strictly **immutable** (no `PUT` or `DELETE` methods exposed).
   - Deletion of subscriptions is implemented via **Soft Delete** (`DELETE /subscriptions/{id}` sets `status: "cancelled"` and retains the record).

---

## 3. Summary of API Resources & SRS Mapping
| Resource Group | Base URI | Primary SRS Requirements |
|----------------|----------|--------------------------|
| Subscriptions | `/subscriptions` | FR-01.1 – FR-01.5 |
| Billing Events (Nested) | `/subscriptions/{id}/billing-events` | FR-03.4, FR-03.5 |
| Free Trials | `/trials` | FR-02.1 – FR-02.5 |
| Billing History | `/billing-events` | FR-03.1 – FR-03.5, NFR-03 |
| Analytics Summary | `/analytics/summary` | FR-04.1 – FR-04.3 |
| Notifications | `/notifications` | FR-05.4 – FR-05.7 |
| Global Settings | `/settings` | FR-05.1 – FR-05.3 |
| System Operations | `/system` | FR-02.4, FR-03.3, FR-05.6, FR-06.2, FR-06.3 |
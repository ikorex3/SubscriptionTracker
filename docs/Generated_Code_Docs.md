## Modules

<dl>
<dt><a href="#domain/calculations
Pure domain calculation utilities for Subscription Tracker.
Uses fixed 30-day months and 365-day years per SRS formulas.
Traced Requirements_ FR-01.4, FR-01.5, FR-04.1, FR-04.2, FR-04.3.module_">domain/calculations
Pure domain calculation utilities for Subscription Tracker.
Uses fixed 30-day months and 365-day years per SRS formulas.
Traced Requirements: FR-01.4, FR-01.5, FR-04.1, FR-04.2, FR-04.3.</a></dt>
<dd></dd>
<dt><a href="#domain/store
In-memory domain repository for Subscription Tracker.
Persistence is strictly in-memory for the process lifetime; full state can be
serialized/restored via {@link Store+exportData} and {@link Store+importData}.module_">domain/store
In-memory domain repository for Subscription Tracker.
Persistence is strictly in-memory for the process lifetime; full state can be
serialized/restored via {@link Store#exportData} and {@link Store#importData}.</a></dt>
<dd></dd>
<dt><a href="#domain/validation
Request payload and query parameter validators aligned with OpenAPI 3.0.3 contracts.
Every validator returns an array of human-readable error strings (empty array means valid).module_">domain/validation
Request payload and query parameter validators aligned with OpenAPI 3.0.3 contracts.
Every validator returns an array of human-readable error strings (empty array means valid).</a></dt>
<dd></dd>
<dt><a href="#routes/analytics
HTTP route handlers for `/analytics` spend aggregation in UAH (FR-04.1..FR-04.3).module_">routes/analytics
HTTP route handlers for `/analytics` spend aggregation in UAH (FR-04.1..FR-04.3).</a></dt>
<dd></dd>
<dt><a href="#routes/billingEvents
HTTP route handlers for `/billing-events` confirmation and immutable billing history (FR-03.1..FR-03.5, NFR-03).
By design, no `PUT`, `PATCH`, or `DELETE` endpoints are exposed to enforce billing log immutability.module_">routes/billingEvents
HTTP route handlers for `/billing-events` confirmation and immutable billing history (FR-03.1..FR-03.5, NFR-03).
By design, no `PUT`, `PATCH`, or `DELETE` endpoints are exposed to enforce billing log immutability.</a></dt>
<dd></dd>
<dt><a href="#routes/notifications
HTTP route handlers for `/notifications` retrieval and dismissal (FR-05.4..FR-05.7).module_">routes/notifications
HTTP route handlers for `/notifications` retrieval and dismissal (FR-05.4..FR-05.7).</a></dt>
<dd></dd>
<dt><a href="#routes/settings
HTTP route handlers for `/settings` global notification lead-time configuration (FR-05.1, FR-05.2).module_">routes/settings
HTTP route handlers for `/settings` global notification lead-time configuration (FR-05.1, FR-05.2).</a></dt>
<dd></dd>
<dt><a href="#routes/subscriptions
HTTP route handlers for `/subscriptions` lifecycle management (FR-01.1..FR-01.5, CHG-01).module_">routes/subscriptions
HTTP route handlers for `/subscriptions` lifecycle management (FR-01.1..FR-01.5, CHG-01).</a></dt>
<dd></dd>
<dt><a href="#routes/system
HTTP route handlers for `/system` startup evaluation and JSON backup export/import (FR-06.2..FR-06.4, NFR-05, NFR-06).module_">routes/system
HTTP route handlers for `/system` startup evaluation and JSON backup export/import (FR-06.2..FR-06.4, NFR-05, NFR-06).</a></dt>
<dd></dd>
<dt><a href="#routes/trials
HTTP route handlers for `/trials` free trial tracking and resolution (FR-02.1..FR-02.5).module_">routes/trials
HTTP route handlers for `/trials` free trial tracking and resolution (FR-02.1..FR-02.5).</a></dt>
<dd></dd>
<dt><a href="#utils/logger
Structured JSON-lines logger for HTTP requests and domain business actions.module_">utils/logger
Structured JSON-lines logger for HTTP requests and domain business actions.</a></dt>
<dd></dd>
<dt><a href="#utils/router
Lightweight zero-dependency HTTP pattern-matching router.
Supports exact paths and `_param` segments matching `[a-zA-Z0-9-]+`.module_">utils/router
Lightweight zero-dependency HTTP pattern-matching router.
Supports exact paths and `:param` segments matching `[a-zA-Z0-9-]+`.</a></dt>
<dd></dd>
</dl>

<a name="domain/calculations
Pure domain calculation utilities for Subscription Tracker.
Uses fixed 30-day months and 365-day years per SRS formulas.
Traced Requirements_ FR-01.4, FR-01.5, FR-04.1, FR-04.2, FR-04.3.module_"></a>

## domain/calculations
Pure domain calculation utilities for Subscription Tracker.
Uses fixed 30-day months and 365-day years per SRS formulas.
Traced Requirements: FR-01.4, FR-01.5, FR-04.1, FR-04.2, FR-04.3.
<a name="domain/store
In-memory domain repository for Subscription Tracker.
Persistence is strictly in-memory for the process lifetime; full state can be
serialized/restored via {@link Store+exportData} and {@link Store+importData}.module_"></a>

## domain/store
In-memory domain repository for Subscription Tracker.
Persistence is strictly in-memory for the process lifetime; full state can be
serialized/restored via {@link Store#exportData} and {@link Store#importData}.
<a name="domain/validation
Request payload and query parameter validators aligned with OpenAPI 3.0.3 contracts.
Every validator returns an array of human-readable error strings (empty array means valid).module_"></a>

## domain/validation
Request payload and query parameter validators aligned with OpenAPI 3.0.3 contracts.
Every validator returns an array of human-readable error strings (empty array means valid).
<a name="routes/analytics
HTTP route handlers for `/analytics` spend aggregation in UAH (FR-04.1..FR-04.3).module_"></a>

## routes/analytics
HTTP route handlers for `/analytics` spend aggregation in UAH (FR-04.1..FR-04.3).
<a name="routes/billingEvents
HTTP route handlers for `/billing-events` confirmation and immutable billing history (FR-03.1..FR-03.5, NFR-03).
By design, no `PUT`, `PATCH`, or `DELETE` endpoints are exposed to enforce billing log immutability.module_"></a>

## routes/billingEvents
HTTP route handlers for `/billing-events` confirmation and immutable billing history (FR-03.1..FR-03.5, NFR-03).
By design, no `PUT`, `PATCH`, or `DELETE` endpoints are exposed to enforce billing log immutability.
<a name="routes/notifications
HTTP route handlers for `/notifications` retrieval and dismissal (FR-05.4..FR-05.7).module_"></a>

## routes/notifications
HTTP route handlers for `/notifications` retrieval and dismissal (FR-05.4..FR-05.7).
<a name="routes/settings
HTTP route handlers for `/settings` global notification lead-time configuration (FR-05.1, FR-05.2).module_"></a>

## routes/settings
HTTP route handlers for `/settings` global notification lead-time configuration (FR-05.1, FR-05.2).
<a name="routes/subscriptions
HTTP route handlers for `/subscriptions` lifecycle management (FR-01.1..FR-01.5, CHG-01).module_"></a>

## routes/subscriptions
HTTP route handlers for `/subscriptions` lifecycle management (FR-01.1..FR-01.5, CHG-01).
<a name="routes/system
HTTP route handlers for `/system` startup evaluation and JSON backup export/import (FR-06.2..FR-06.4, NFR-05, NFR-06).module_"></a>

## routes/system
HTTP route handlers for `/system` startup evaluation and JSON backup export/import (FR-06.2..FR-06.4, NFR-05, NFR-06).
<a name="routes/trials
HTTP route handlers for `/trials` free trial tracking and resolution (FR-02.1..FR-02.5).module_"></a>

## routes/trials
HTTP route handlers for `/trials` free trial tracking and resolution (FR-02.1..FR-02.5).
<a name="utils/logger
Structured JSON-lines logger for HTTP requests and domain business actions.module_"></a>

## utils/logger
Structured JSON-lines logger for HTTP requests and domain business actions.
<a name="utils/router
Lightweight zero-dependency HTTP pattern-matching router.
Supports exact paths and `_param` segments matching `[a-zA-Z0-9-]+`.module_"></a>

## utils/router
Lightweight zero-dependency HTTP pattern-matching router.
Supports exact paths and `:param` segments matching `[a-zA-Z0-9-]+`.

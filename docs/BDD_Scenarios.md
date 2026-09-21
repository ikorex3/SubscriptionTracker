# BDD Acceptance Criteria — Subscription Tracker
### Version 1.0 | September 2026

All scenarios follow the **Given-When-Then** format.  
Each scenario references one or more Functional Requirements from `spec/SRS.md`.

---

## Feature: Subscription Management

### SC-01 — Add a new subscription
**Covers:** FR-01.1

```
Given the user is on the main dashboard
  And there are no existing subscriptions
When the user clicks "Add Subscription"
  And enters: Service name = "Netflix", Cost = "199", Interval = "monthly", First billing date = "2026-10-01"
  And clicks "Save"
Then a subscription card for "Netflix" appears in the subscription list
  And the card displays: cost "199 UAH", interval "Monthly", next billing date "2026-10-01"
  And the subscription status badge shows "Active"
```

---

### SC-02 — Calculate next billing date for a custom interval
**Covers:** FR-01.4

```
Given the user has a subscription "Spotify Free Trial Paid" with interval "90 days"
  And the last confirmed billing date is "2026-09-01"
When the user marks the billing event on "2026-09-01" as paid
Then the next billing date is displayed as "2026-11-30" (2026-09-01 + 90 days)
```

---

### SC-03 — Cancel a subscription
**Covers:** FR-01.3

```
Given the user has an active subscription "YouTube Premium"
When the user selects "Cancel Subscription" from the subscription card menu
Then the subscription card for "YouTube Premium" remains visible in the list
  And a "Cancelled" badge is displayed on the card
  And "YouTube Premium" is excluded from the Total Monthly and Annual Spend figures
```

---

### SC-04 — Annual spend estimate calculation
**Covers:** FR-01.5, FR-04.1, FR-04.2

```
Given the following active subscriptions:
  | Service    | Cost (UAH) | Interval |
  | Netflix    | 199        | monthly  |
  | Spotify    | 99         | monthly  |
  | Adobe CC   | 800        | monthly  |
When the user views the analytics section
Then the Total Monthly Spend shows "1 098 UAH"
  And the Total Annual Spend shows "13 176 UAH"
```

---

## Feature: Free Trial Management

### SC-05 — Add a free trial with a linked subscription
**Covers:** FR-02.1

```
Given the user is on the main dashboard
When the user clicks "Add Trial"
  And enters: Service name = "Adobe CC", Start date = "2026-09-21", End date = "2026-12-21"
  And links a new subscription: cost = "800 UAH", interval = "monthly"
  And clicks "Save"
Then a trial card appears for "Adobe CC" with status "Active"
  And a linked subscription entry for "Adobe CC" exists in the system with status "Active"
    (Note: the linked subscription becomes truly active only upon conversion)
```

---

### SC-06 — Add a standalone trial (no linked subscription)
**Covers:** FR-02.2

```
Given the user is on the main dashboard
When the user clicks "Add Trial"
  And enters: Service name = "Amazon Prime", Start date = "2026-09-21", End date = "2026-10-21"
  And leaves the "Linked Subscription" field empty
  And clicks "Save"
Then a trial card appears for "Amazon Prime" with status "Active"
  And no linked subscription is created
```

---

### SC-07 — Trial expiry detection on app load
**Covers:** FR-02.4

```
Given the user has a trial for "Amazon Prime" with end date "2026-09-20" and status "Active"
  And the current date is "2026-09-21"
When the user opens the application
Then the trial status for "Amazon Prime" is automatically updated to "Expired"
  And a resolution prompt is displayed asking the user to "Convert" or "Cancel"
```

---

### SC-08 — Convert an expired trial to a paid subscription
**Covers:** FR-02.5

```
Given a trial for "Amazon Prime" has status "Expired"
  And the trial has a linked paid subscription
When the user selects "Convert" in the expiry resolution prompt
Then the trial status changes to "Converted"
  And the linked subscription status changes to "Active"
  And the resolution prompt disappears
```

---

### SC-09 — Cancel an expired trial; linked subscription auto-cancelled
**Covers:** FR-02.5

```
Given a trial for "Canva Pro" has status "Expired"
  And the trial has a linked subscription
When the user selects "Cancel" in the expiry resolution prompt
Then the trial status changes to "Cancelled"
  And the linked subscription status automatically changes to "Cancelled"
  And neither item contributes to spend analytics
```

---

### SC-10 — Cancel a trial with no linked subscription
**Covers:** FR-02.2, FR-02.5

```
Given a standalone trial for "Amazon Prime" has status "Expired"
  And the trial has no linked subscription
When the user selects "Cancel" in the expiry resolution prompt
Then the trial status changes to "Cancelled"
  And no other records are affected
```

---

## Feature: Billing History & Confirmation

### SC-11 — Confirm a billing event as paid
**Covers:** FR-03.1, FR-03.2, FR-03.4

```
Given the subscription "Netflix" has a next billing date of today ("2026-09-21")
  And a confirmation badge is displayed on the Netflix card
When the user clicks the badge and selects "Mark as Paid"
Then a billing history entry is created:
  | Field            | Value          |
  | Subscription     | Netflix        |
  | Amount           | 199 UAH        |
  | Date Confirmed   | 2026-09-21     |
  | Payment Status   | paid           |
  And the next billing date is updated to "2026-10-21"
  And the confirmation badge is removed from the Netflix card
```

---

### SC-12 — Mark a billing event as skipped
**Covers:** FR-03.2, FR-03.4

```
Given the subscription "Spotify" has a next billing date of today ("2026-09-21")
When the user selects "Mark as Skipped" from the billing confirmation
Then a billing history entry is created:
  | Field            | Value          |
  | Subscription     | Spotify        |
  | Amount           | 99 UAH         |
  | Date Confirmed   | 2026-09-21     |
  | Payment Status   | skipped        |
  And the next billing date is recalculated as "2026-10-21"
```

---

### SC-13 — Overdue billing event flagged and held
**Covers:** FR-03.3

```
Given the subscription "YouTube Premium" has a next billing date of "2026-09-18"
  And the current date is "2026-09-21"
  And no billing event has been confirmed for this subscription
When the user opens the application
Then the "YouTube Premium" card displays an "Overdue" indicator
  And the billing event remains pending (not auto-skipped or auto-advanced)
  And the "Overdue" state persists until the user manually marks it as paid or skipped
```

---

### SC-14 — View billing history
**Covers:** FR-03.5

```
Given the user has confirmed several billing events in the past
When the user navigates to the Billing History view
Then a list of all confirmed billing events is displayed
  And entries are sorted by date descending by default
  And each entry shows: subscription name, amount, date, and payment status
  And no edit or delete controls are available on history entries
```

---

## Feature: Notifications

### SC-15 — Renewal notification triggered by global lead-time
**Covers:** FR-05.1, FR-05.4, FR-05.7

```
Given the subscription "Netflix" has a next billing date of "2026-09-24"
  And the global renewal lead-time is 3 days
  And the current date is "2026-09-21"
When the user opens the application
Then a RENEWAL notification banner for "Netflix" appears on the main dashboard
  And the banner uses standard (non-critical) styling
  And the banner remains visible until the user dismisses it
```

---

### SC-16 — Trial expiry notification with high-priority styling
**Covers:** FR-05.2, FR-05.4, FR-05.7

```
Given a trial "Adobe CC" has an end date of "2026-09-24"
  And the global trial lead-time is 3 days
  And the current date is "2026-09-21"
When the user opens the application
Then a TRIAL_EXPIRY notification banner for "Adobe CC" appears on the main dashboard
  And the banner is rendered with high-priority (warning/red) styling
  And the banner remains visible until dismissed
```

---

### SC-17 — Per-item lead-time override takes precedence
**Covers:** FR-05.3

```
Given the global renewal lead-time is 3 days
  And the subscription "Adobe CC" has a per-item lead-time override of 7 days
  And "Adobe CC" has a next billing date of "2026-09-28"
  And the subscription "Spotify" has a next billing date of "2026-09-26" (5 days away, no override)
  And the current date is "2026-09-21"
When the user opens the application
Then a RENEWAL notification for "Adobe CC" is shown (7 days before = triggered)
  And no notification is shown for "Spotify" (5 days away > 3 day global threshold = not triggered)
```

---

### SC-18 — Dismiss a notification
**Covers:** FR-05.5

```
Given a RENEWAL notification banner for "Netflix" is visible on the dashboard
When the user clicks the dismiss (×) button on the notification
Then the "Netflix" notification banner disappears from the dashboard
  And the notification does not reappear on the next app load
    (unless the billing date changes and a new trigger condition is met)
```

---

### SC-19 — Startup summary banner for missed events
**Covers:** FR-05.6

```
Given the user last interacted with the app on "2026-09-18"
  And the subscription "Netflix" had a next billing date of "2026-09-19" (now overdue)
  And the trial "Amazon Prime" had an end date of "2026-09-20" (now expired)
When the user opens the app on "2026-09-21"
Then a startup summary banner appears on the main dashboard containing:
  - "Netflix renewal was due on 2026-09-19 (overdue)"
  - "Amazon Prime trial expired on 2026-09-20"
  And the banner persists until the user explicitly dismisses it
```

---

## Feature: Data Management

### SC-20 — Export all data as JSON
**Covers:** FR-06.2

```
Given the user has 3 active subscriptions, 1 trial, and 5 billing history entries in the system
When the user clicks "Export Data"
Then a file named "subscription-tracker-backup.json" (or similar) is downloaded
  And the file contains all subscriptions, trials, billing history, and settings
  And the file is valid, parseable JSON
```

---

### SC-21 — Import data from a JSON backup
**Covers:** FR-06.3

```
Given the user has a previously exported JSON backup file
  And the current localStorage contains no data
When the user clicks "Import Data" and selects the JSON backup file
Then the application loads all data from the file into localStorage
  And all subscriptions, trials, and billing history are displayed correctly
```

---

### SC-22 — Import confirmation warning before overwrite
**Covers:** FR-06.4

```
Given the user has existing subscriptions in the system
When the user clicks "Import Data" and selects a JSON file
Then a confirmation dialog is shown:
  "This will permanently overwrite all existing data. This action cannot be undone. Continue?"
When the user clicks "Confirm"
Then the existing data is replaced with the imported data
When the user clicks "Cancel"
Then no data is changed and the import is aborted
```

---

### SC-23 — Import rejects invalid JSON
**Covers:** FR-06.3

```
Given the user selects a file that is not valid JSON (e.g., a corrupted or wrong file)
When the import is attempted
Then an error message is displayed: "Invalid file format. Please select a valid backup file."
  And no data in localStorage is modified
```

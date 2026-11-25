# Subscription Tracker — User Guide

Welcome to **Subscription Tracker**, a web application for managing recurring digital subscriptions, monitoring free trial periods, logging manual billing confirmations, and tracking your spending in **UAH**.

> **Important:** All data is stored in server memory while the application is running. Before stopping or restarting the server, use **Export JSON** in **Settings & Backup** to save a backup file.

---

## 1. Opening the Application

1. Start the server (`node src/server.js`).
2. Open **http://localhost:4010** in your browser.
3. Status messages and validation errors appear in the banner at the top of the page.

---

## 2. Analytics Summary & Startup Check

At the top of the dashboard, **Analytics Summary (UAH)** displays three metrics calculated across **active subscriptions only** (cancelled subscriptions and free trials are excluded):

- **Monthly Spend** — total estimated monthly cost in UAH.
- **Annual Spend** — total estimated annual cost in UAH.
- **Active Subscriptions** — count of subscriptions currently in `active` status.

### Running a Startup Check
Click **Run Startup Check** in the top-right header to evaluate all active trials and subscriptions against today's date:
- Active free trials whose **End Date** has passed are transitioned to `expired`.
- Active subscriptions whose **Next Billing Date** has arrived or passed are flagged with `billing due` or `overdue` badges.
- Upcoming renewal/trial alerts and a startup summary notification are generated in **Active Notifications**.

---

## 3. Managing Subscriptions

### Adding a Subscription
1. In the **Subscriptions** section, fill in:
   - **Service Name** (e.g., `Netflix`)
   - **Cost (UAH)** (non-negative amount, e.g., `199.00`)
   - **Billing Interval**: `Monthly (30 days)`, `Annual (365 days)`, or `Custom`
     - If you select `Custom`, two extra fields appear: **Custom Value** (positive number) and **Custom Unit** (`Days` or `Months`).
   - **First Billing Date** (`YYYY-MM-DD`)
   - **Lead Time (days)** *(optional, 1–30)* — overrides the global renewal lead time for this subscription.
2. Click **Add Subscription**. The server computes **Next Billing Date** and monthly/annual spend estimates automatically.

### Filtering Subscriptions
Use the filter buttons in the **Subscriptions** header:
- **All** — shows both `active` and `cancelled` subscriptions.
- **Active** — shows only `active` subscriptions.
- **Cancelled** — shows only `cancelled` subscriptions.

### Confirming a Billing Event (`Mark Paid` / `Mark Skipped`)
For an `active` subscription whose billing date is due or overdue (or on/after its **Next Billing Date**):
- Click **Mark Paid** to log a `paid` billing event, or **Mark Skipped** to log a `skipped` billing event.
- Confirming a payment advances **Next Billing Date** to the next cycle and clears any `billing due` / `overdue` badge.
- If a payment is not due yet (or if validation fails), the server's error message is shown in the top status banner.

### Cancelling a Subscription
- Click **Cancel** on an `active` subscription and confirm the prompt.
- Subscriptions use **soft delete**: the record is retained with a `cancelled` badge for history, and its cost is excluded from **Analytics Summary (UAH)**.
- *(Note: Modifying fields of an existing subscription is supported via the REST API `PUT /subscriptions/{id}` endpoint.)*

---

## 4. Managing Free Trials

### Adding a Free Trial
1. In the **Free Trials** section, fill in:
   - **Service Name** (e.g., `Adobe CC`)
   - **Start Date** and **End Date**
   - **Linked Subscription** *(optional)* — choose `Standalone (none)` or link an existing subscription.
   - **Lead Time (days)** *(optional, 1–30)* — overrides the global trial lead time.
2. Click **Add Trial**. New trials start in `active` status with `Assumed cost: 0.00 UAH`.

### Resolving an Expired Trial
When a trial's **End Date** passes and **Run Startup Check** transitions it to `expired`, two action buttons appear on that trial:
- **Convert** — marks the trial `converted` (and sets any linked subscription to `active`).
- **Cancel** — marks the trial `cancelled` (and sets any linked subscription to `cancelled`).

---

## 5. Active Notifications

**Active Notifications** displays upcoming **Renewal** alerts, high-priority **Trial Expiry** alerts, and **Startup Summary** banners ordered by priority.
- Click **Dismiss** on any notification to clear it from the active list.

---

## 6. Billing History (Immutable)

**Billing History (Immutable)** displays a read-only chronological log of all confirmed `paid` and `skipped` billing events, including the service name, amount in UAH, due date, and confirmation date. Confirmed entries cannot be edited or deleted.

---

## 7. Settings & JSON Backup

### Updating Global Lead-Time Settings
In **Settings & Backup**:
1. Enter **Renewal Lead Time (1–30 days)** and **Trial Lead Time (1–30 days)** (default is `3` days).
2. Click **Save Settings**.

### Exporting & Importing Backups
- **Export JSON:** Click **Export JSON** to download a versioned backup file (`subscription-tracker-backup-YYYY-MM-DD.json`) containing all subscriptions, trials, billing events, notifications, and settings.
- **Import Snapshot:**
  1. Choose a `.json` backup file using the file picker.
  2. Click **Import Snapshot**.
  3. **Warning:** Confirming the prompt **replaces all existing data** in memory with the contents of the backup file.

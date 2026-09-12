# System Description: Subscription and Service Free Trial Control System

## 1. General Purpose
The information system is designed for centralized tracking of regular recurring payments for digital services (music, video streaming, etc.), as well as for monitoring free trial periods with user notification to prevent unwanted debits.

## 2. Main Domain Entities
- **Subscription:**
  - Service name (e.g., Spotify, Crunchyroll, Google AI).
  - Billing frequency (monthly, annual).
  - Cost and payment currency (e.g., UAH).
  - Payment method.

- **Trial Period:**
  - Trial period start date.
  - Trial period end date.
  - Advance notification (e.g., 3 days before expiration).

- **Billing Event:**
  - Next payment date.
  - Transaction amount.
  - Confirmation/cancellation status.

## 3. Basic Use Cases
1. Adding a new record of an active subscription or activated free trial period.
2. Calculation of total expenses for digital services for a selected period (month/year) converted to the base currency.
3. Generating a list of active free trial periods approaching the date of transition to the paid version of the subscription.
4. Recording the fact of subscription cancellation.
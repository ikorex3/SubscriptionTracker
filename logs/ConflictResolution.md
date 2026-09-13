# Conflict Resolution Log
## 1. Conflict Description
- Target file: `README.md`
- Branches involved: `manual-change` and `agent-change`.
- Conflict nature: Both branches independently modified the header and introductory section of `README.md`. The agent introduced an extensive English overview with repository structure, manual editing introduced default parameters (currency and notification lead-time).

## 2. Resolution Decision & Rationale
- The conflict was resolved by hybrid integration.
  - Kept the agent's text because it gives a clear description of the project structure and features.
  - Kept the manual block (`Local Configuration: UAH, 3 days alert`) to specify default settings for the system.
## 3. For Laboratory Work #2
- `spec/Concept.md` does not specify whether the notification time and base currency should be stored as default settings or as parameters configurable for each individual subscription
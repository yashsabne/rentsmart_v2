# RentSmart — Testing & Quality

---

## Current State

| Type | Status |
|---|---|
| Unit tests | ❌ None |
| Integration tests | ❌ None |
| E2E tests | ❌ None |
| Load tests | ✅ k6 (documented in `/testreport.md`) |
| Linting / formatting | ❌ No ESLint or Prettier configured |
| Pre-commit hooks | ❌ None |

> The one form of testing present is a real k6 load test run against the deployed system — a genuine operational signal most portfolio projects don't have.

---

## Load Test Results

**Tool:** k6  
**Target:** Render-hosted search endpoints  
**Profile:** Ramp from 2 → 500 virtual users over ~10 minutes, then hold

| Metric | Value |
|---|---|
| Total requests | 20,235 |
| HTTP failure rate | 0.97% (197 failed) |
| Average response | 7.96s |
| Median (P50) | 3.88s |
| P95 | ~13.8s |
| P99 | ~15.0s |
| Requests > 5s | ~52% |

**Interpretation:** The service is resilient under load (no crash, 99% success rate) but slow. The P95/P99 latency is a consequence of a 512MB Render free-tier instance under 500 concurrent users, not a code bug. Caching search results per query signature would be the highest-leverage fix.

---

## Validation Approaches

### Mongoose Schema Validation
Provides a baseline across all services:
- `required` — prevents missing fields
- `enum` — enforces valid status values (`AVAILABLE`, `RENTED`, `SOLD`, `DELETED`)
- `unique` — email uniqueness, saved-property deduplication
- `min/max` — numeric constraints

### Controller-Level Validation
Each controller uses inline presence checks and type guards. Not standardized across services — no shared library like `zod` or `joi`.

### Dedicated Validators (chat-service only)
`conversationValidator.js` and `messageValidator.js` check required fields and shapes using express-validator-style functions. The only service with a dedicated validation layer.

---

## Error Handling

All controllers follow this pattern:

```javascript
try {
  // business logic
  res.json({ success: true, data: result });
} catch (err) {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
} 

```

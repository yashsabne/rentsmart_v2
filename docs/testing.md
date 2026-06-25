# RentSmart — Testing & Quality

---

## Current State

| Type | Status |
|---|---|
| Unit tests | ❌ None |
| Integration tests | ❌ None |
| E2E tests | ❌ None |
| Load tests | ✅ k6 (documented in `services/testreport.md`) |
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

**Known gaps:**
- `BUG-05`: login's catch-all surfaces a 500 for OAuth-only accounts attempting password login — should be a clear 400 with "use Google sign-in"
- Notification failures are fire-and-forget: if notification-service is down during registration, the user silently never receives a verification email

---

## Recommended Test Suite

### Unit Tests (per service)

```
services/
├── auth-service/
│   └── tests/
│       ├── authController.test.js    # register, login, verify, reset
│       ├── jwtUtils.test.js          # generateToken produces correct claims
│       └── middleware.test.js        # authMiddleware blacklist check
├── property-service/
│   └── tests/
│       ├── searchPipeline.test.js    # aggregation pipeline stages
│       ├── rankScore.test.js         # computeRankScore logic
│       └── savedController.test.js  # toggle, dedup
├── payment-service/
│   └── tests/
│       ├── razorpaySignature.test.js # HMAC-SHA256 verify
│       ├── createOrder.test.js       # idempotency, price enforcement
│       └── paymentSummary.test.js    # BUG-03 regression
```

**Example — regression test for BUG-03 (promotion spend always 0):**

```javascript
describe('getPaymentSummary', () => {
  it('returns correct promotion spend when userId is stored as String', async () => {
    // Seed a PromotePayment with userId as String
    await PromotePayment.create({
      userId: '64abc123def456',   // String, not ObjectId
      status: 'paid',
      amount: 3900
    });

    const summary = await getPaymentSummaryForUser('64abc123def456');
    expect(summary.totalPromotionSpend).toBe(3900);
  });
});
```

### Integration Tests

Key flows to cover:
1. Full contact-unlock flow: create-order → verify-payment → check-access
2. Google OAuth: callback → JWT claims → authenticated request (regression for SEC-02)
3. Listing creation → search result → personalized ranking
4. Logout → blacklist check in all four JWT-verifying services (regression for SEC-01)

### Recommended Stack

```json
{
  "devDependencies": {
    "jest": "^29",
    "@jest/globals": "^29",
    "supertest": "^6",
    "mongodb-memory-server": "^9",
    "nock": "^13"
  }
}
```

---

## Logging

### Current State
Ad hoc `console.log` / `console.error` throughout all services. notification-service has a `logEmail` helper for send-attempt traceability.

**Known artifact:** A debug `console.log("BEFORE:", listing.isHidden)` remains in `toggleHideListing` (Issue QUAL-04).

### Recommended: Structured Logging

```javascript
// Install: npm install pino
import pino from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Usage
logger.info({ userId, listingId }, 'Contact unlock payment verified');
logger.error({ err, userId }, 'Payment verification failed');
```

Benefits:
- JSON output parseable by Datadog, CloudWatch, Logtail
- Request-ID correlation across services
- Log levels (debug/info/warn/error) without `console.log` noise

---

## Code Quality Gaps

| ID | Issue | Impact |
|---|---|---|
| QUAL-01 | Dashboard `active` stat counts `isPromoted`, not `status=AVAILABLE` | Wrong metrics shown to owners |
| QUAL-02 | chat-service uses CommonJS + Express 4; all others use ESM + Express 5 | Onboarding friction, behavioral differences |
| QUAL-03 | Color/theme object redefined verbatim in 7+ page components | Rebrand requires 7+ edits |
| QUAL-04 | Debug `console.log` left in `toggleHideListing` | Production log noise |
| QUAL-05 | `formatPrice` and `formattedPrice` are near-duplicate functions | Drift risk |
| QUAL-06 | Typo in registration success message: "youWr email" | User-facing bug |

---

## Recommended Quality Setup

### ESLint + Prettier (root `package.json`)

```json
{
  "scripts": {
    "lint": "eslint services/ client/src/ --ext .js,.jsx",
    "format": "prettier --write services/ client/src/"
  },
  "devDependencies": {
    "eslint": "^8",
    "eslint-config-prettier": "^9",
    "prettier": "^3"
  }
}
```

### `.eslintrc.js`

```javascript
module.exports = {
  env: { node: true, es2022: true },
  rules: {
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'no-unused-vars': 'error'
  }
};
```

### Pre-commit Hook (husky + lint-staged)

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
// package.json
"lint-staged": {
  "*.{js,jsx}": ["eslint --fix", "prettier --write"]
}
```

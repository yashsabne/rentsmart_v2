# RentSmart — Security Documentation

---

## Security Overview

| Mechanism | Status |
|---|---|
| Password hashing (bcrypt) | ✅ Implemented |
| JWT authentication (HS256) | ✅ Implemented |
| Email verification gating | ✅ Implemented |
| Razorpay signature verification | ✅ Implemented (HMAC-SHA256) |
| Server-side price enforcement | ✅ Implemented |
| Internal secret for service-to-service | ✅ Implemented (except redis-service) |
| Rate limiting (login/register) | ✅ Implemented |
| JWT logout blacklist | ⚠️ Partial (auth-service only) |
| CORS policy | ⚠️ Wide-open on 6/7 services |
| Redis API authentication | ❌ Missing |
| Activity log authentication | ❌ Missing |
| Razorpay webhook | ❌ Missing |

---

## Implemented Security Measures

### Authentication

**JWT (HS256)**
- All four JWT-verifying services (auth, property, payment, chat) use the same `JWT_SECRET`
- Each service independently verifies token signature via its own `authMiddleware`
- Token payload carries: `id`, `city`, `preferences`

**Email Verification Gating**
- `requireVerifiedEmail` middleware makes a live cross-service HTTP call to auth-service
- Applied to listing creation (`POST /api/property`) and payment creation
- Uses current DB state, not a stale JWT claim — prevents bypass via old tokens

**Logout Blacklisting**
- `POST /api/auth/logout` stores the JWT in Redis via redis-service
- auth-service's `authMiddleware` checks the blacklist before accepting a token

**Google OAuth**
- Passport.js GoogleStrategy handles the OAuth flow
- Callback issues a JWT for the authenticated user

### Password Security

- Passwords hashed with `bcryptjs` before storage — never persisted in plaintext
- Password-reset tokens are single-use, randomly generated, and time-limited
- `resetPassword` enforces an 8-character minimum length

### Payment Security

**Price Enforcement**
```javascript
// payment-service/paymentController.js
const CONTACT_UNLOCK_PRICE = 3900; // ₹39 in paise — never from client
const order = await razorpay.orders.create({
  amount: CONTACT_UNLOCK_PRICE,
  currency: 'INR'
});
```

**Razorpay Signature Verification (HMAC-SHA256)**
```javascript
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest('hex');

if (expectedSignature !== razorpaySignature) {
  return res.status(400).json({ message: 'Payment verification failed' });
}
```

### Internal Service Security

Service-to-service calls use a shared `INTERNAL_SECRET` header:

```javascript
// verifyInternalSecret middleware
export const verifyInternalSecret = (req, res, next) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== process.env.INTERNAL_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
```

Applied to: notification-service all routes, property-service promote-activation, auth-service internal user lookup.

### Rate Limiting

Registration and login are rate-limited via `rateLimitMiddleware` (route level) + explicit redis-service calls inside controllers (duplicate — see Issue PERF-04).

---

## Critical Security Issues

### 🔴 SEC-01 — Logout Bypass on 3 of 4 Services (CRITICAL)

**Problem:** Only `auth-service`'s `authMiddleware` checks the Redis blacklist. `property-service`, `payment-service`, and `chat-service` verify the JWT signature only — they accept blacklisted (logged-out) tokens.

**Impact:** A user who logs out on one device remains authenticated on property/payment/chat services until token expiry. A stolen token cannot be fully revoked.

**Fix:**
```javascript
// Add to authMiddleware in property, payment, and chat services:
const blacklisted = await redisGet(`/token/blacklist/${token}`);
if (blacklisted) {
  return res.status(401).json({ message: 'Token has been revoked' });
}
```

Long-term: extract `authMiddleware` into a shared `@rentsmart/service-common` package.

---

### 🔴 SEC-02 — Broken JWT on Google OAuth Login (CRITICAL)

**Problem:** `socialAuthController.js` calls `generateToken(user._id)` instead of `generateToken(user)`. Inside the function, `user._id` evaluated on an ObjectId returns `undefined`.

**Impact:** Every JWT issued via Google login has `id: undefined`. All subsequent authenticated requests fail silently or behave unpredictably.

**Fix:**
```javascript
// WRONG (current):
const token = generateToken(user._id);

// CORRECT:
const token = generateToken(user); // pass the full user document
```

Add regression test:
```javascript
const decoded = jwt.verify(token, JWT_SECRET);
expect(decoded.id).toBe(user._id.toString());
```

---

### 🔴 SEC-03 — Unauthenticated Redis Service (CRITICAL)

**Problem:** None of `redis-service`'s routes (cache, session, blacklist, OTP, rate-limit, queue, pub/sub) are protected by `verifyInternalSecret`. The `rateLimitMiddleware` defined in the service is never applied in `app.js`.

**Impact:** Anyone reaching this service's port can:
- Read/delete any user's cached data
- Forge or destroy sessions
- Un-blacklist a logged-out JWT
- Reset or disable rate limits platform-wide

**Fix:**
```javascript
// redis-service/app.js
import { verifyInternalSecret } from './src/middleware/verifyInternalSecret.js';

// Protect the entire router
app.use('/api/redis', verifyInternalSecret, redisRoutes);

// Also apply rate limiting
app.use(rateLimitMiddleware);
```

---

### 🔴 REL-01 — No Razorpay Webhook (CRITICAL)

**Problem:** The only code path that sets `accessGranted: true` is the client-initiated `POST /api/payment/verify-payment`. No webhook listener exists for `payment.captured` / `order.paid` events.

**Impact:** If the client disconnects after Razorpay charges the card but before calling `/verify-payment`, the buyer is charged with no access granted and no automatic recovery.

**Fix — Add webhook endpoint:**
```javascript
// payment-service/routes/webhookRoutes.js
router.post('/razorpay/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');
  
  if (expectedSignature !== signature) {
    return res.status(400).json({ message: 'Invalid signature' });
  }
  
  const event = JSON.parse(req.body);
  if (event.event === 'payment.captured') {
    await reconcilePayment(event.payload.payment.entity);
  }
  
  res.json({ status: 'ok' });
});
```

---

## High Severity Issues

### 🟠 SEC-04 — Chat Owner Impersonation

**Problem:** `startConversation` accepts a client-supplied `owner` object `{ userId, fullName, email }` with no server-side verification against the listing's real `creatorId`.

**Fix:** Fetch the listing from property-service and extract the real owner ID server-side:
```javascript
const listing = await fetch(`${PROPERTY_SERVICE_URL}/api/property/details/${propertyId}`);
const realOwnerId = listing.creatorId; // never trust client-supplied owner
```

### 🟠 SEC-05 — Activity Log Open Write Endpoint

**Problem:** `POST /api/activities` has no authentication. Any caller can write entries for any `userId`.

**Fix:** Add `verifyInternalSecret` to the create-activity route — it should only be called by internal services.

### 🟠 SEC-06 — Unauthenticated Share Link Creation

**Problem:** `createShareLink` requires no authentication and has no rate limiting. Anyone can create Share documents for any listing ID.

**Fix:** Require authentication or add per-IP rate limiting before creating share links.

### 🟠 SEC-07 — Wide-Open CORS

**Problem:** Six of seven services call `cors()` with no options, allowing any origin. Only `payment-service` whitelists specific origins.

**Fix:**
```javascript
// Apply to all services (use your actual domains)
app.use(cors({
  origin: [
    'https://rentsmart.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

---

## Input Validation Gaps

### VAL-01 — No Password Complexity on Registration

`resetPassword` enforces 8-character minimum; `register` enforces none.

**Fix:**
```javascript
// Shared validator (use in both register and resetPassword)
const validatePassword = (password) => {
  if (password.length < 8) throw new Error('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) throw new Error('Must contain an uppercase letter');
  if (!/[0-9]/.test(password)) throw new Error('Must contain a number');
};
```

---

## Privacy

### PRIV-01 — Incomplete Account Deletion

`DELETE /api/auth/settings/account` anonymizes the email but leaves `firstName`, `lastName`, `phone`, `preferences`, and activity history intact.

**Fix:** On deletion, scrub all directly identifying fields:
```javascript
await User.findByIdAndUpdate(userId, {
  email: `deleted_${userId}@deleted.invalid`,
  firstName: 'Deleted',
  lastName: 'User',
  phone: null,
  preferences: {},
  isDeleted: true,
  deletedAt: new Date()
});
// Also delete or anonymize related Activity and UserInteraction records
```

---

## Environment Security

- All secrets in `.env` files — never committed
- `JWT_SECRET` must be identical across all 4 JWT-verifying services
- `INTERNAL_SECRET` must be identical across all services
- Frontend stores JWT in `localStorage` (common SPA pattern, but vulnerable to XSS — consider `httpOnly` cookies for hardening)
- No secrets manager in use — recommended next step for production

---

## Security Checklist for Pre-Launch

- [ ] Fix SEC-01: Add blacklist check to property/payment/chat `authMiddleware`
- [ ] Fix SEC-02: Pass full user object to `generateToken` in Google OAuth callback
- [ ] Fix SEC-03: Apply `verifyInternalSecret` to all `redis-service` routes
- [ ] Fix REL-01: Add Razorpay webhook endpoint
- [ ] Fix SEC-07: Add explicit CORS origin whitelist to all 6 affected services
- [ ] Fix SEC-04: Verify conversation owner server-side against listing's real `creatorId`
- [ ] Fix SEC-05: Add `verifyInternalSecret` to `POST /api/activities`
- [ ] Fix VAL-01: Add password complexity check to registration
- [ ] Fix PRIV-01: Complete data erasure on account deletion

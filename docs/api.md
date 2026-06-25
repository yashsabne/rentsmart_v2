# RentSmart — API Documentation

All backend services are Express apps. The frontend calls each service directly using a per-service base URL (no API gateway).

**Authentication:** Pass the JWT as `Authorization: Bearer <token>` on all protected routes.  
**Internal endpoints:** Protected by `x-internal-secret: <INTERNAL_SECRET>` header — not callable from the frontend.

---

## Auth Service — `http://localhost:5000`

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create local account. Rate-limited: 5/hr/IP. Body: `{ email, password, firstName, lastName, phone? }` |
| `POST` | `/api/auth/login` | Authenticate. Rate-limited: 10/15min/IP. Body: `{ email, password }` |
| `GET` | `/api/auth/verify-email/:token` | Confirm email via emailed token |
| `POST` | `/api/auth/forgot-password` | Issue password-reset token. Body: `{ email }` |
| `POST` | `/api/auth/reset-password/:token` | Set new password. Body: `{ password }` |
| `GET` | `/api/auth/user/:id` | Public profile lookup by user ID |
| `GET` | `/api/auth/check-verification/:userId` | Check if a user's email is verified |
| `GET` | `/auth/social/google` | Begin Google OAuth flow |
| `GET` | `/auth/social/google/callback` | Google OAuth callback — issues JWT |

### Protected Endpoints (JWT required)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/logout` | Blacklist the current JWT in Redis |
| `GET` | `/api/auth/me` | Return authenticated user's profile |
| `POST` | `/api/auth/resend-verification` | Re-send email verification link |
| `PATCH` | `/api/auth/recently-viewed` | Add property to recently-viewed (capped at 5) |
| `GET` | `/api/auth/recently-viewed` | Return recently-viewed properties |
| `GET` | `/api/auth/settings` | Return profile/settings/preferences |
| `PATCH` | `/api/auth/settings/profile` | Update profile fields |
| `PATCH` | `/api/auth/settings/notifications` | Update notification preferences |
| `PATCH` | `/api/auth/settings/preferences` | Update search/property preferences |
| `PATCH` | `/api/auth/settings/password` | Change password (requires current password) |
| `DELETE` | `/api/auth/settings/account` | Soft-delete account (anonymizes email) |

### Internal Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/internal/user/:id` | Internal user lookup by other services |

---

## Property Service — `http://localhost:5001`

### Listings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/property` | ✅ + verified email | Create a listing |
| `GET` | `/api/property/filter` | Optional | Filtered/paginated search with Atlas `$search` |
| `GET` | `/api/property/search-notlogged` | ❌ | Guest recommendation feed |
| `GET` | `/api/property/recommended` | ✅ | Personalized recommendation feed |
| `GET` | `/api/property/similar` | ❌ | Similar listings by type/city |
| `GET` | `/api/property/details/:id` | ❌ | Full listing detail |
| `GET` | `/api/property/my` | ✅ | Owner's own listings + dashboard stats |
| `PUT` | `/api/property/:id` | ✅ | Update a listing (owner only) |
| `DELETE` | `/api/property/:id` | ✅ | Soft-delete listing (sets status=DELETED) |
| `POST` | `/api/property/interactions` | ✅ | Record view/save/contact/share interaction |

**Search query params:** `q`, `city`, `buyOrSell`, `minPrice`, `maxPrice`, `bedrooms`, `bathrooms`, `furnished`, `parking`, `amenities`, `page`, `limit`

### Listing Actions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `PATCH` | `/api/actions/:id/hide` | ✅ | Toggle listing visibility |
| `PATCH` | `/api/actions/:id/refresh` | ✅ | Bump listing freshness (3-day cooldown) |
| `PATCH` | `/api/actions/:id/status` | ✅ | Update status: `AVAILABLE / RENTED / SOLD` |
| `GET` | `/api/actions/dashboard/owner` | ✅ | Owner dashboard counts |

### Saved Properties

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/saved/toggle` | ✅ | Save or unsave a listing |
| `GET` | `/api/saved/ids` | ✅ | IDs of saved listings (cached) |
| `GET` | `/api/saved` | ✅ | Full saved listing documents |

### Sharing

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/share` | ❌ | Create trackable share link |
| `GET` | `/api/share/:token` | ❌ | Resolve share token & record click |

### Internal

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/promote/listings/promote/activate` | Internal | Activate promotion after verified payment |
| `POST` | `/api/property/internal/users/:userId/hide-listings` | Internal | Hide all listings on account deletion |

---

## Payment Service — `http://localhost:5002`

### Contact Unlock

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payment/create-order` | ✅ + verified email | Create Razorpay order for contact unlock (₹39, server-enforced) |
| `POST` | `/api/payment/verify-payment` | ✅ + verified email | Verify Razorpay HMAC-SHA256 signature & grant access |
| `GET` | `/api/payment/check-access` | ✅ | Check contact access for a listing (cached) |

### Listing Promotion

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payment/promote/order` | ✅ | Create Razorpay order for listing promotion |
| `POST` | `/api/payment/promote/verify` | ✅ | Verify promotion payment & trigger activation |

### Payment History

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/payments/history/contacts` | ✅ | Paginated contact-unlock history |
| `GET` | `/api/payments/history/promotions` | ✅ | Paginated promotion payment history |
| `GET` | `/api/payments/history/summary` | ✅ | Aggregate spend summary (cached) |

---

## Notification Service — `http://localhost:5003` (Internal Only)

All endpoints require `x-internal-secret` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/notify/payment-success` | Send payment receipt email |
| `POST` | `/api/notify/contact-revealed` | Notify buyer that contact was unlocked |
| `POST` | `/api/notify/owner-contact-revealed` | Notify owner their contact was revealed |
| `POST` | `/api/notify/promote-success` | Send promotion confirmation email |

---

## Activity Service — `http://localhost:5004`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/activities` | ❌ ⚠️ | Write activity entry (no auth — see Issue SEC-05) |
| `GET` | `/api/activities/:userId` | ❌ | Return user's activity feed (cached) |

---

## Chat Service — `http://localhost:5005`

> **Note:** chat-service uses no `/api` prefix, unlike all other services.

### REST Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/conversations/start` | ✅ | Start or resume a conversation about a listing |
| `GET` | `/conversations` | ✅ | List caller's conversations |
| `GET` | `/conversations/:slug` | ✅ | Get conversation by slug |
| `PATCH` | `/conversations/archive/:slug` | ✅ | Archive a conversation |
| `POST` | `/messages/send` | ✅ | Send a message (also broadcast via Socket.IO) |
| `GET` | `/messages/:slug` | ✅ | Paginated message history |
| `PATCH` | `/messages/read` | ✅ | Mark messages as read |

### Socket.IO Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `send-message` | Client → Server | `{ conversationId, text }` | Send a new message |
| `new-message` | Server → Client | Message object | Receive a new message |
| `typing` | Client → Server | `{ conversationId }` | Indicate user is typing |
| `stop-typing` | Client → Server | `{ conversationId }` | Indicate user stopped typing |
| `message-delivered` | Client → Server | `{ messageId }` | Acknowledge message delivery |
| `message-read` | Client → Server | `{ messageId }` | Acknowledge message read |
| `online-users` | Server → Client | Array of user IDs | Current online presence |

---

## Redis Service — `http://localhost:5006` (Internal Infrastructure)

> ⚠️ **Issue SEC-03:** No authentication on any route. All routes should be protected by `INTERNAL_SECRET`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/redis/cache` | Set a cache key `{ key, data, ttl }` |
| `GET` | `/api/redis/cache/:key` | Get a cached value |
| `DELETE` | `/api/redis/cache/:key` | Delete a cache key |
| `POST` | `/api/redis/cache/flush` | Bulk delete by pattern |
| `POST` | `/api/redis/session` | Create session |
| `GET` | `/api/redis/session/:userId` | Get session |
| `DELETE` | `/api/redis/session/:userId` | Destroy session |
| `POST` | `/api/redis/token/blacklist` | Blacklist a JWT on logout |
| `GET` | `/api/redis/token/blacklist/:token` | Check if JWT is blacklisted |
| `POST` | `/api/redis/rate-limit/check` | Check/increment rate-limit counter |
| `DELETE` | `/api/redis/rate-limit/:identifier` | Reset a rate-limit counter |

---

## Common Response Shapes

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

### Paginated
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Environment Variables (Frontend)

| Variable | Description |
|---|---|
| `VITE_AUTH_API` | auth-service base URL |
| `VITE_PROPERTY_API` | property-service base URL |
| `VITE_PAYMENT_API` | payment-service base URL |
| `VITE_CHAT_API` | chat-service base URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key for Checkout widget |

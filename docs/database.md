# RentSmart — Database Design

RentSmart follows a **database-per-service** pattern. Each microservice that needs persistence owns its own Mongoose connection and schema set. There are no cross-service joins — cross-service data access requires HTTP calls.

---

## Services & Their Collections

| Service | Collections |
|---|---|
| auth-service | `users` |
| property-service | `listings`, `userinteractions`, `savedproperties`, `shares` |
| payment-service | `payments`, `promotepayments` |
| activity-service | `activities` |
| chat-service | `conversations`, `messages` |
| notification-service | Stateless — no MongoDB |
| redis-service | Stateless — Redis only |

---

## auth-service

### `users`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `email` | String, unique, lowercase | Primary login identifier; sparse-unique for OAuth accounts |
| `password` | String | bcrypt hash; absent for OAuth-only accounts |
| `firstName` | String, required | |
| `lastName` | String, required | |
| `phone` | String | Optional |
| `googleId` | String | Google OAuth identifier |
| `microsoftId` | String | Declared but never populated (Feature not implemented) |
| `isEmailVerified` | Boolean | Gates listing creation and payments |
| `emailVerificationToken` | String | Random token for email confirmation |
| `emailVerificationExpiry` | Date | TTL-style expiry for verification token |
| `passwordResetToken` | String | Random token for password reset |
| `passwordResetExpiry` | Date | TTL-style expiry for reset token |
| `preferences` | Object | `{ city, propertyType, budgetRange, bedrooms }` — feeds search personalization |
| `notificationSettings` | Object | `{ email, sms, promotions }` — per-channel booleans |
| `contactAccess.monthlyEmailReveals` | Number | Monthly quota counter (reset logic never invoked — see Issue BUG-04) |
| `isDeleted` | Boolean | Soft-delete flag |
| `deletedAt` | Date | Timestamp of soft-delete |
| `createdAt` / `updatedAt` | Date | Auto-managed by Mongoose timestamps |

**Indexes:**
- Unique on `email`
- Unique-sparse on `googleId`

---

## property-service

### `listings`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `creatorId` | String, required | Owning user's `_id` as a string (cross-service, not a Mongo ref) |
| `title` | String | Indexed for Atlas `$search` |
| `description` | String | Indexed for Atlas `$search` |
| `buyOrSell` | String enum | `"rent"` or `"sell"` |
| `price` | Number | |
| `paymentType` | String | Distinguishes one-time sale vs monthly rent |
| `address` | Object | `{ street, city, state, pincode, coordinates }` |
| `bedrooms` | Number | |
| `bathrooms` | Number | |
| `areaSqft` | Number | |
| `furnished` | String | |
| `parking` | Boolean | |
| `amenities` | Array | |
| `photos` | Array | Cloudinary URLs; max 8 enforced in controller |
| `status` | String enum | `AVAILABLE`, `RENTED`, `SOLD`, `DELETED` |
| `isHidden` | Boolean | Owner-controlled visibility toggle |
| `isPromoted` | Boolean | Set by payment-service on successful promotion payment |
| `promotedUntil` | Date | Promotion expiry |
| `rankScore` | Number, default 0 | Pre-computed popularity score (currently always 0 — see Issue PERF-02) |
| `refreshedAt` | Date | 3-day cooldown enforcement for listing bumps |
| `createdAt` / `updatedAt` | Date | Timestamps |

**Indexes:**
- Compound: `{ city, buyOrSell, status }` — primary filter index
- Descending: `{ rankScore, createdAt }` — sort index (unused while rankScore=0)
- **Atlas Search index** (external): full-text on `title`, `description`, `address`

---

### `userinteractions`

Behavioral log driving personalized search & recommendations.

| Field | Type | Notes |
|---|---|---|
| `userId` | String | Indexed; absent for anonymous interactions |
| `propertyId` | ObjectId, ref Listing | Indexed |
| `action` | String enum | `view`, `save`, `contact`, `share` |
| `createdAt` | Date | Used for recency decay in scoring |

**Action Weights (in personalization pipeline):**

| Action | Relative Weight |
|---|---|
| `contact` | Highest |
| `save` | High |
| `share` | Medium |
| `view` | Base |

---

### `savedproperties`

Wishlist/favorites join table.

| Field | Type | Notes |
|---|---|---|
| `userId` | String, required, indexed | |
| `propertyId` | ObjectId, ref Listing, required, indexed | |
| `createdAt` | Date | |

**Index:** Compound unique on `{ userId, propertyId }` — prevents duplicates, enables toggle check.

---

### `shares`

Trackable share links for listings.

| Field | Type | Notes |
|---|---|---|
| `propertyId` | ObjectId, ref Listing, required | |
| `token` | String, unique | Random token for share URL |
| `createdBy` | String | Optional userId (not required — see Issue SEC-06) |
| `clicks` | Number | Total click count |
| `uniqueVisitors` | Array | Visitor identifiers |
| `createdAt` | Date | |

---

## payment-service

### `payments`

Contact-unlock transaction records.

| Field | Type | Notes |
|---|---|---|
| `userId` | String | Buyer's user ID (cross-service string, not a ref) |
| `listingId` | String | Target listing ID |
| `razorpayOrderId` | String | Populated on order creation |
| `razorpayPaymentId` | String | Populated on verification |
| `razorpaySignature` | String | HMAC-SHA256 signature from Razorpay |
| `amount` | Number | Always server-computed: ₹39 in paise (3900) |
| `status` | String enum | `created`, `paid`, `failed` |
| `accessGranted` | Boolean | The flag UI checks via `/check-access` |
| `createdAt` / `updatedAt` | Date | |

---

### `promotepayments`

Listing-promotion transaction records.

| Field | Type | Notes |
|---|---|---|
| `userId` | String | Owner's user ID — stored as String ⚠️ |
| `listingId` | String | Target listing |
| `razorpayOrderId` | String | |
| `razorpayPaymentId` | String | |
| `razorpaySignature` | String | |
| `status` | String enum | `created`, `paid`, `failed` |
| `createdAt` / `updatedAt` | Date | |

> ⚠️ **Issue BUG-03:** `getPaymentSummary` matches `userId` as `ObjectId`, but it is stored as `String`. Promotion spend is always reported as ₹0. Fix: match `userId` as a plain string.

---

## activity-service

### `activities`

Append-only cross-service event log.

| Field | Type | Notes |
|---|---|---|
| `userId` | String, required, indexed | |
| `type` | String | Event type: `LOGIN`, `LISTING_CREATED`, `PAYMENT_SUCCESS`, `CONTACT_UNLOCKED`, etc. |
| `message` | String | Human-readable description |
| `metadata` | Object | Arbitrary structured detail |
| `createdAt` | Date, indexed desc | For feed pagination |

> ⚠️ **Issue SEC-05:** No auth on write endpoint. Any caller can write entries for any `userId`.

---

## chat-service

### `conversations`

Chat threads between two participants.

| Field | Type | Notes |
|---|---|---|
| `participants` | Array | `[{ userId, fullName, email, avatar, role }]` — **denormalized** snapshot (may go stale) |
| `propertyId` | Mixed | Listing context |
| `propertySlug` | String | Used as the conversation identifier |
| `propertyTitle` | String | Denormalized for chat header display |
| `lastMessage` | Mixed | Cached for conversation list rendering |
| `lastMessageAt` | Date | Sort key for conversation list |
| `isArchived` | Boolean | Per-conversation soft-hide |
| `createdAt` / `updatedAt` | Date | |

> ⚠️ **Issue SEC-04:** `startConversation` trusts client-supplied `owner` object rather than verifying against listing's real `creatorId`.

---

### `messages`

| Field | Type | Notes |
|---|---|---|
| `conversationId` | ObjectId, ref Conversation, indexed | |
| `senderId` | String, required | |
| `text` | String, required | Stored as plain text (no encryption despite `iv` field in frontend) |
| `status` | String enum | `sent`, `delivered`, `read` |
| `createdAt` | Date, indexed | Chronological pagination |

---

## Redis Key Patterns (redis-service)

| Key Pattern | Purpose | TTL |
|---|---|---|
| `listings:my:<userId>:page:<page>` | Owner's own listings, paginated | 600s |
| `listings:stats:<userId>` | Owner dashboard counts | 600s |
| `user:<userId>` | Cached profile lookups | 600s |
| `saved:ids:<userId>` | Cached saved-listing IDs | 600s |
| `payments:summary:<userId>` | Cached spend summary | 600s |
| `rate-limit:<route>:<ip>` | Rate-limit counter | Window length (e.g. 3600s) |
| `token-blacklist:<jwt>` | Logged-out JWTs | Until token expiry |

---

## ERD Summary (Cross-Service)

```
User (auth-service)
  │
  ├── Listing (property-service)  [via creatorId = User._id as String]
  │     ├── UserInteraction        [via userId = User._id, propertyId = Listing._id]
  │     ├── SavedProperty          [via userId, propertyId]
  │     └── Share                  [via propertyId]
  │
  ├── Payment (payment-service)   [via userId, listingId]
  ├── PromotePayment               [via userId, listingId]
  │
  ├── Activity (activity-service) [via userId]
  │
  └── Conversation (chat-service) [via participants[].userId]
        └── Message                [via conversationId]
```

> All cross-service relationships are **string-keyed** (not MongoDB refs/populate). Joins require HTTP calls.

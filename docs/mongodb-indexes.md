# RentSmart — MongoDB Indexes

All indexes were derived from Mongoose schema files and aggregation pipeline analysis.

---

## auth-service — `users` collection

```javascript
// Unique email (primary login identifier)
db.users.createIndex({ email: 1 }, { unique: true, sparse: true })

// Google OAuth lookup
db.users.createIndex({ googleId: 1 }, { unique: true, sparse: true })

// Soft-delete queries
db.users.createIndex({ isDeleted: 1 })
```

---

## property-service

### `listings` collection

```javascript
// Primary search filter (most used compound index)
db.listings.createIndex({ city: 1, buyOrSell: 1, status: 1 })

// Owner dashboard — all listings by owner
db.listings.createIndex({ creatorId: 1, status: 1 })

// Sort by freshness / rank
db.listings.createIndex({ rankScore: -1, createdAt: -1 })

// Promoted listings filter
db.listings.createIndex({ isPromoted: 1, promotedUntil: 1 })

// Refresh cooldown check
db.listings.createIndex({ creatorId: 1, refreshedAt: -1 })
```

**Atlas Search Index** (configured externally on MongoDB Atlas):

```json
{
  "name": "listings_search",
  "definition": {
    "mappings": {
      "dynamic": false,
      "fields": {
        "title": { "type": "string", "analyzer": "lucene.standard" },
        "description": { "type": "string", "analyzer": "lucene.standard" },
        "address.city": { "type": "string", "analyzer": "lucene.standard" },
        "address.street": { "type": "string", "analyzer": "lucene.standard" }
      }
    }
  }
}
```

> This Atlas Search index is **required** for the `/api/property/filter` endpoint. The app will not function without it on Atlas.

### `userinteractions` collection

```javascript
// Personalization lookups by user
db.userinteractions.createIndex({ userId: 1, createdAt: -1 })

// Per-property analytics
db.userinteractions.createIndex({ propertyId: 1, action: 1 })

// Deduplication / recency decay
db.userinteractions.createIndex({ userId: 1, propertyId: 1, action: 1 })
```

### `savedproperties` collection

```javascript
// Prevent duplicate saves + toggle check
db.savedproperties.createIndex({ userId: 1, propertyId: 1 }, { unique: true })

// Fetch all saved by user
db.savedproperties.createIndex({ userId: 1 })
```

### `shares` collection

```javascript
// Share link resolution
db.shares.createIndex({ token: 1 }, { unique: true })

// Analytics by property
db.shares.createIndex({ propertyId: 1 })
```

---

## payment-service

### `payments` collection

```javascript
// Access check (most frequent query)
db.payments.createIndex({ userId: 1, listingId: 1 })

// Payment history pagination
db.payments.createIndex({ userId: 1, createdAt: -1 })

// Razorpay order lookup
db.payments.createIndex({ razorpayOrderId: 1 }, { unique: true, sparse: true })
```

### `promotepayments` collection

```javascript
// Promotion history
db.promotepayments.createIndex({ userId: 1, createdAt: -1 })

// BUG-03 NOTE: userId stored as String — do NOT query with ObjectId
db.promotepayments.createIndex({ listingId: 1 })
db.promotepayments.createIndex({ razorpayOrderId: 1 }, { unique: true, sparse: true })
```

---

## activity-service

### `activities` collection

```javascript
// Activity feed by user (paginated, descending)
db.activities.createIndex({ userId: 1, createdAt: -1 })

// Filter by event type
db.activities.createIndex({ userId: 1, type: 1 })
```

---

## chat-service

### `conversations` collection

```javascript
// List conversations for a user (via participants array)
db.conversations.createIndex({ "participants.userId": 1, lastMessageAt: -1 })

// Conversation lookup by listing
db.conversations.createIndex({ propertyId: 1 })

// Slug-based lookup (unique identifier)
db.conversations.createIndex({ propertySlug: 1 }, { unique: true, sparse: true })
```

### `messages` collection

```javascript
// Chronological message history per conversation
db.messages.createIndex({ conversationId: 1, createdAt: 1 })

// Unread count queries
db.messages.createIndex({ conversationId: 1, status: 1 })

// Messages by sender
db.messages.createIndex({ senderId: 1 })
```

---

## Index Creation Script

Run this against each service's database to create all indexes:

```javascript
// Run in MongoDB shell or as a seed script
// Connect to each database: use auth-db / property-db / payment-db / activity-db / chat-db

// --- auth-db ---
use auth-db
db.users.createIndex({ email: 1 }, { unique: true, sparse: true })
db.users.createIndex({ googleId: 1 }, { unique: true, sparse: true })
db.users.createIndex({ isDeleted: 1 })

// --- property-db ---
use property-db
db.listings.createIndex({ city: 1, buyOrSell: 1, status: 1 })
db.listings.createIndex({ creatorId: 1, status: 1 })
db.listings.createIndex({ rankScore: -1, createdAt: -1 })
db.listings.createIndex({ isPromoted: 1, promotedUntil: 1 })
db.userinteractions.createIndex({ userId: 1, createdAt: -1 })
db.userinteractions.createIndex({ propertyId: 1, action: 1 })
db.savedproperties.createIndex({ userId: 1, propertyId: 1 }, { unique: true })
db.shares.createIndex({ token: 1 }, { unique: true })

// --- payment-db ---
use payment-db
db.payments.createIndex({ userId: 1, listingId: 1 })
db.payments.createIndex({ userId: 1, createdAt: -1 })
db.promotepayments.createIndex({ userId: 1, createdAt: -1 })

// --- activity-db ---
use activity-db
db.activities.createIndex({ userId: 1, createdAt: -1 })
db.activities.createIndex({ userId: 1, type: 1 })

// --- chat-db ---
use chat-db
db.conversations.createIndex({ "participants.userId": 1, lastMessageAt: -1 })
db.conversations.createIndex({ propertySlug: 1 }, { unique: true, sparse: true })
db.messages.createIndex({ conversationId: 1, createdAt: 1 })
db.messages.createIndex({ conversationId: 1, status: 1 })
```

# RentSmart — System Architecture

> A Microservices-Based Property Rental & Sale Platform  
> Stack: MERN + Redis + Docker + Socket.IO

---

## Overview

RentSmart is built as a distributed set of **seven independent Node.js/Express microservices** with a single React SPA frontend. There is no API gateway — the frontend calls each backend service directly using a per-service base URL defined in `client/apis.js`.

---

## High-Level Diagram

```
                        ┌─────────────────────────────┐
                        │     React SPA (Vite/React 19) │
                        │     Hosted on Vercel          │
                        └──────────────┬──────────────┘
                                       │ Direct HTTP per service
          ┌────────────┬───────────────┼───────────────┬──────────────┐
          ▼            ▼               ▼               ▼              ▼
    ┌──────────┐ ┌──────────┐  ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  auth    │ │ property │  │ payment  │   │  chat    │   │ activity │
    │ :5000    │ │ :5001    │  │ :5002    │   │ :5005    │   │ :5004    │
    └────┬─────┘ └────┬─────┘  └────┬─────┘   └────┬─────┘   └──────────┘
         │            │             │               │
         └────────────┴─────────────┴───────────────┘
                              │ Internal HTTP (INTERNAL_SECRET)
              ┌───────────────┼─────────────┐
              ▼               ▼             ▼
       ┌──────────┐   ┌──────────┐   ┌──────────┐
       │notification│  │  redis  │   │ MongoDB  │
       │ :5003    │   │ :5006    │   │ Atlas    │
       └──────────┘   └──────────┘   └──────────┘
```

---

## Services

| Service | Port | Responsibility |
|---|---|---|
| `auth-service` | 5000 | Registration, login, JWT, email verification, Google OAuth, account settings |
| `property-service` | 5001 | Listing CRUD, full-text search, recommendations, saved properties, sharing |
| `payment-service` | 5002 | Razorpay contact-unlock & listing-promotion payments, payment history |
| `notification-service` | 5003 | Transactional email via Brevo API (internal-only) |
| `activity-service` | 5004 | Cross-service append-only activity/audit log |
| `chat-service` | 5005 | Real-time Socket.IO messaging, delivery/read receipts, presence |
| `redis-service` | 5006 | Shared Redis HTTP wrapper for cache, sessions, rate-limiting, blacklist |

---

## Frontend Layer

- **Framework:** React 19 + Vite, client-side routing via `react-router-dom`
- **Auth:** JWT stored in `localStorage`, sent as `Bearer` token to all services
- **Real-time:** Single `Socket.IO` client connection shared via `socketContext`
- **Payments:** Razorpay Checkout loaded as a window script

---

## Cross-Service Communication Patterns

### JWT Authentication
Each service independently verifies the JWT (HS256, shared `JWT_SECRET`). Only `auth-service` checks the logout blacklist in Redis — property, payment, and chat services do not (known gap: Issue SEC-01).

### Internal Service Calls
Service-to-service calls use a shared `INTERNAL_SECRET` header verified by `verifyInternalSecret` middleware. Example: payment-service → notification-service to trigger emails.

### Redis Access
No service holds a direct Redis client. All Redis access goes through `redis-service`'s HTTP API via a thin `redisClient.js` (axios) helper.

---

## Database Strategy

- **Database-per-service**: each service that needs persistence owns its own Mongoose connection and schemas.
- No shared schema packages, no cross-service joins — cross-service data requires HTTP calls.
- `notification-service` and `redis-service` are stateless (no MongoDB).

| Service | Collections |
|---|---|
| auth-service | `users` |
| property-service | `listings`, `userinteractions`, `savedproperties`, `shares` |
| payment-service | `payments`, `promotepayments` |
| activity-service | `activities` |
| chat-service | `conversations`, `messages` |

---

## External Services

| Service | Purpose |
|---|---|
| MongoDB Atlas | Hosted cluster; required for `$search` full-text index |
| Cloudinary | Listing photo upload & CDN |
| Razorpay | Payment gateway (contact unlock + listing promotion) |
| Google OAuth 2.0 | Social login |
| Brevo (Sendinblue) | Transactional email delivery |

---

## Request Flow Examples

### Contact Unlock Payment
1. Frontend → `POST /api/payment/create-order` (payment-service)
2. payment-service validates JWT, computes price server-side (₹39), creates Razorpay order
3. Razorpay Checkout opens client-side
4. Frontend → `POST /api/payment/verify-payment` with Razorpay signature
5. payment-service recomputes HMAC-SHA256, sets `accessGranted: true`
6. payment-service → notification-service (email to buyer + owner)
7. payment-service → activity-service (log event)
8. Frontend → `GET /api/payment/check-access` → owner phone revealed

### Personalized Property Search
1. Frontend → `GET /api/property/search` with query, filters, JWT
2. MongoDB Atlas `$search` stage (fuzzy text match)
3. `$match` filters (price, city, bedrooms, type…)
4. Personalization scoring from JWT preferences + `UserInteraction` history
5. Promoted listings (`isPromoted: true`) receive a ranking boost
6. Paginated results returned
7. Frontend fires fire-and-forget `view` interaction for future personalization

---

## Deployment

| Layer | Platform |
|---|---|
| Frontend | Vercel (SPA rewrite rule in `vercel.json`) |
| Backend services | Render free tier (512MB RAM) |
| Local dev | Docker Compose (9 containers: 7 services + mongo + redis) |
| Database | MongoDB Atlas (production) / self-hosted mongo (local) |

---

## Known Architecture Gaps

| ID | Issue |
|---|---|
| SEC-01 | Logout blacklist only checked by auth-service, not property/payment/chat |
| SEC-03 | redis-service has no authentication on any route |
| PERF-01 | Atlas `$search` incompatible with Docker Compose's vanilla mongo image |
| SCALE-01 | chat-service uses in-memory presence map — breaks at >1 instance |
| ARCH-01 | `authMiddleware` copy-pasted across 4 services instead of a shared package |

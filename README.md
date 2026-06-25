# 🏠 RentSmart v2

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat&logo=redis&logoColor=white)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white)
![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render&logoColor=white)
![Frontend on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat&logo=vercel&logoColor=white)

**RentSmart v2** is a production-ready property rental and sale platform rebuilt from the ground up on a **containerized microservices architecture** using Docker. It is a complete redesign of RentSmart v1 (monolithic), with each business domain running as an independent service — enabling isolated deployments, fault containment, and real-world scalability.

🔗 **Live:** [rentsmart.fun](https://rentsmart.fun)
📦 **Repo:** [github.com/yashsabne/rentsmart_v2](https://github.com/yashsabne/rentsmart_v2)

---

## 📌 Table of Contents

- [Why v2?](#-why-v2)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Services](#-services)
  - [Auth Service](#-auth-service-port-5000)
  - [Property Service](#-property-service-port-5001)
  - [Payment Service](#-payment-service-port-5002)
  - [Notification Service](#-notification-service-port-5003)
  - [Activity Service](#-activity-service-port-5004)
  - [Chat Service](#-chat-service-port-5005)
  - [Redis Service](#-redis-service-port-5006)
- [Frontend](#-frontend-client)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Performance & Load Testing](#-performance--load-testing)
- [Docker Setup](#-docker-setup)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Roadmap](#-current-status--roadmap)
- [Getting Started](#-getting-started)

---

## 💡 Why v2?

RentSmart v1 was a traditional Express monolith. It worked — but as features grew, so did the pain:

- **One deploy = all-or-nothing.** A bug in the chat module could take down payments and auth with it.
- **No independent scaling.** The property filter endpoint took the most load but couldn't be scaled without scaling everything else.
- **Tight coupling made iteration slow.** Auth logic was entangled with property logic, making changes risky.

v2 separates every domain into its own service. Auth, property, payments, chat, notifications, activity, and Redis each run in their own container, own database namespace, and own deploy lifecycle. A crash in the notification service doesn't affect a user creating a listing.

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────┐
│              React + Vite (Client)               │
│              Deployed on: Vercel                  │
└────────────────────┬─────────────────────────────┘
                     │ REST / Socket.IO
        ┌────────────┼────────────────────┐
        ▼            ▼                    ▼
┌─────────────┐ ┌──────────────┐ ┌─────────────────┐
│ Auth Service│ │Property Serv.│ │ Payment Service │
│  Port 5000  │ │  Port 5001   │ │   Port 5002     │
│  MongoDB    │ │  MongoDB +   │ │  Razorpay +     │
│             │ │  Cloudinary  │ │  MongoDB        │
└─────────────┘ └──────────────┘ └─────────────────┘
        ▼            ▼                    ▼
┌─────────────┐ ┌──────────────┐ ┌─────────────────┐
│Notification │ │ Activity Svc │ │  Chat Service   │
│  Port 5003  │ │  Port 5004   │ │  Port 5005      │
│  Brevo API  │ │  MongoDB     │ │  Socket.IO +    │
│             │ │              │ │  MongoDB        │
└─────────────┘ └──────────────┘ └─────────────────┘
                     ▲
              ┌──────┴──────┐
              │Redis Service│
              │  Port 5006  │
              │  (Shared    │
              │  HTTP API)  │
              └─────────────┘
```

All persistent services share a single MongoDB Atlas cluster. Redis is abstracted as its own dedicated microservice — rather than each service holding a direct Redis connection, all caching, rate limiting, and session calls go through `redis-service` over a clean internal HTTP API. Inter-service calls are authenticated via an `x-internal-secret` header.

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Socket.IO Client | Real-time chat |
| react-hot-toast | Notifications/toasts |
| crypto-js | Client-side encryption helpers |
| @vercel/analytics | Analytics |

### Backend (per service)

| Technology | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server |
| MongoDB + Mongoose | Primary database |
| JWT (jsonwebtoken) | Stateless authentication |
| Redis (via redis-service) | Rate limiting, caching, session store |
| bcryptjs | Password hashing |
| Socket.IO | Real-time chat |
| Cloudinary + Multer | Image storage |
| Razorpay | Payment gateway (HMAC-SHA256 verified) |
| Nodemailer / Brevo API | Email delivery |
| Passport.js | Google OAuth |
| Morgan | HTTP request logging |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerization & orchestration |
| GitHub Actions | CI/CD — path-filtered per-service deployments |
| Vercel | Frontend hosting |
| Render | Backend service hosting |

---

## 🔧 Services

### 🔐 Auth Service (Port 5000)

Handles all authentication and user identity management.

**Key Features:**
- User registration with email verification
- Login with JWT issuance (JWT blacklisting on logout via redis-service)
- Forgot password / reset password via secure email token
- Rate-limited registration (5 attempts/hr) and login (10 attempts/15 min) via redis-service
- Google OAuth via Passport.js
- Internal user lookup endpoint (protected by internal secret)
- Recently viewed properties tracking per user

**API Routes (`/api/auth/...`):**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login and receive JWT |
| POST | `/logout` | ✅ | Logout + blacklist JWT |
| GET | `/me` | ✅ | Get current user |
| GET | `/user/:id` | ❌ | Get user by ID |
| GET | `/internal/user/:id` | 🔒 Internal | Fetch user for other services |
| GET | `/verify-email/:token` | ❌ | Verify email |
| POST | `/resend-verification` | ✅ | Resend verification email |
| GET | `/check-verification/:userId` | ❌ | Check email verified status |
| POST | `/forgot-password` | ❌ | Send password reset email |
| POST | `/reset-password/:token` | ❌ | Reset password |
| PATCH | `/recently-viewed` | ✅ | Add to recently viewed |
| GET | `/recently-viewed` | ✅ | Get recently viewed |

---

### 🏘 Property Service (Port 5001)

Manages all property listing CRUD, image uploads, filtering, search, saved properties, and recommendations.

**Key Features:**
- Create, update, delete property listings (verified email required)
- Upload up to 8 photos per listing via Cloudinary
- MongoDB Atlas full-text `$search` with fuzzy matching on title, description, and address
- Personalized search ranking weighted by user preferences and interaction history (views, saves, contacts, shares — decayed by recency)
- Promoted listings (`isPromoted: true`) boosted in search ranking
- Saved properties / wishlist (userId ↔ propertyId join)
- Listing sharing with trackable links
- Interaction tracking for future personalization
- Internal endpoint to hide listings by owner (e.g. account suspension)

**API Routes (`/api/property/...`):**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/upload-photos` | ✅ + Verified | Upload listing photos to Cloudinary |
| POST | `/` | ✅ + Verified | Create a new listing |
| GET | `/filter` | ❌ | Filter + full-text search listings |
| GET | `/similar` | ❌ | Get similar listings |
| GET | `/recommended` | ❌ | Personalized recommendations |
| GET | `/search-notlogged` | ❌ | Latest listings for unauthenticated users |
| GET | `/my` | ✅ | Get my listings |
| GET | `/details/:id` | ❌ | Get listing details |
| PUT | `/:id` | ✅ | Update listing |
| DELETE | `/:id` | ✅ | Delete listing |
| POST | `/internal/users/:userId/hide-listings` | 🔒 Internal | Hide all listings of a user |

---

### 💳 Payment Service (Port 5002)

Handles all Razorpay-powered payment flows for property contact unlock and listing promotion.

**Key Features:**
- Server-side price enforcement (client cannot alter the amount)
- HMAC-SHA256 Razorpay signature verification on all payments
- Contact unlock flow — sets `accessGranted: true`, triggers email notification to both parties via notification-service
- Promote listing flow — sets `isPromoted: true` on the listing with an expiry
- Payment history and spend summary per user

**API Routes (`/api/payment/...`):**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-order` | ✅ + Verified | Create a Razorpay order |
| POST | `/verify-payment` | ✅ + Verified | Verify Razorpay signature + grant access |
| GET | `/check-access` | ✅ | Check if user has paid for a property |
| POST | `/promote/order` | ✅ | Create a promo boost order |
| POST | `/promote/verify` | ✅ | Verify promo payment + activate boost |
| GET | `/history` | ✅ | Get payment history & spend summary |

---

### 🔔 Notification Service (Port 5003)

Lightweight, stateless email delivery service using the Brevo (Sendinblue) transactional email API. Decoupled from auth so email failures never block registration or login flows.

**Key Features:**
- Verification, password reset, payment receipt, and contact-reveal emails
- Called internally by other services — no direct user-facing endpoints
- No database — stateless send-and-forget

---

### 📊 Activity Service (Port 5004)

Centralized service for logging and retrieving all user activity events across the platform.

**Key Features:**
- Ingests events from all other services (logins, listing changes, payments, chat events)
- Retrieve activity history per user
- Used for analytics, audit trails, and future trust scoring

**API Routes (`/api/activity/...`):**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Log a new activity event |
| GET | `/:userId` | Get activity log for a user |

---

### 💬 Chat Service (Port 5005)

Real-time, socket-powered messaging between property seekers and owners.

**Key Features:**
- Socket.IO-based real-time messaging
- Conversation creation and management
- Message delivery state tracking (`sent` → `delivered` → `read`)
- Typing indicators
- Online user tracking (Map-based in-memory)
- JWT-authenticated socket connections
- Slug-based conversation identifiers via nanoid

**Socket Events:**

| Event | Direction | Description |
|---|---|---|
| `USER_ONLINE` | Emit | Broadcasts when a user connects |
| `JOIN_CONVERSATION` | Listen | Join a socket room by conversation slug |
| `LEAVE_CONVERSATION` | Listen | Leave a room |
| `MESSAGE_DELIVERED` | Emit | Broadcast delivery status updates |
| `ONLINE_USERS` | Emit | Emit current online users list |

**REST Routes:**
- `/conversations` — CRUD for conversations
- `/messages` — message history per conversation
- `/health` — service health check

---

### 🗄 Redis Service (Port 5006)

Redis abstracted as a dedicated microservice. Rather than each service holding its own Redis client, all Redis access goes through a single internal HTTP API — effectively "Redis-as-a-microservice."

**Key Features:**
- Cache: `get`, `set`, `delete`, pattern-delete
- Session: `create`, `get`, `destroy` (used for JWT blacklisting on logout)
- Rate limiting: `check` / `reset` per key
- Called by all other services via a shared `redisClient.js` (axios) helper — no direct `ioredis`/`node-redis` connections elsewhere
- No external endpoints — internal-secret protected

---

## 🖥 Frontend (Client)

A React 19 SPA built with Vite, deployed on Vercel.

### Listing Draft Auto-Save

The create-listing flow includes a client-side draft system that preserves form state across sessions without any backend round-trips:

- `loadDraft()` — reads the saved draft from `localStorage` on mount
- `saveDraft(form, step)` — writes current form state and multi-step progress
- `clearDraft()` — called after a successful publish to wipe the saved draft
- `useListingDraft(form, step)` — React hook that debounces auto-saves by 600ms on every form/step change

If a user navigates away mid-creation and returns, their progress is automatically restored.

### Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | HomePage | Landing, search, personalized or latest listings |
| `/register` | RegisterPage | User registration with preferences |
| `/login` | LoginPage | JWT login |
| `/dashboard` | Dashboard | User dashboard with listing stats |
| `/dashboard/messages` | Dashboard (Messages) | Chat inbox |
| `/dashboard/messages/:slug` | Dashboard (Chat) | Individual chat conversation |
| `/saved-properties` | SavedPropertiesPage | Bookmarked / wishlisted listings |
| `/details/:id` | ListingDetails | Full property detail + unlock contact flow |
| `/search-for-property/:type` | PropertyBuyPage | Filtered property search |
| `/create` | CreateListing | Create a new property listing (with draft auto-save) |
| `/edit-property/:id` | EditListing | Edit existing listing |
| `/verify-email/:token` | VerifyEmailPage | Email verification handler |
| `/forgot-password` | ForgotPasswordPage | Request password reset |
| `/reset-password/:token` | ResetPasswordPage | Set new password |
| `/developer` | RentSmartDev | Developer/about page |
| `/help` | Help | Help & support page |

### Client Architecture

- **`client/apis.js`** — Centralized API base URL map (`API.AUTH`, `API.PROPERTY`, `API.PAYMENT`, etc.)
- **`client/src/pages/`** — Page-level components
- **`client/src/components/`** — Reusable components (Navbar, Footer, Hero, Messages)
- **`client/src/constants/`** — App-wide constants and stats
- **`client/src/const_func/`** — Utility functions (e.g. `formattedPrice`, `loadDraft`, `saveDraft`, `clearDraft`)
- Token stored in `localStorage`, sent as `Authorization: Bearer <token>` header

---

## ⚙ CI/CD Pipeline

RentSmart v2 uses a **path-filtered GitHub Actions pipeline** that triggers only on pushes to `main`. Instead of redeploying all services on every commit, the pipeline detects which service directories actually changed and fires Render deploy hooks only for those services — keeping deploys fast and avoiding unnecessary cold starts.

### How It Works

```
push to main
      │
      ▼
detect-changes (dorny/paths-filter)
      │
      ├─ services/auth-service/**      → deploy-auth
      ├─ services/property-service/**  → deploy-property
      ├─ services/payment-service/**   → deploy-payment
      ├─ services/notification-service/** → deploy-notification
      ├─ services/activity-service/**  → deploy-activity
      └─ services/chat-service/**      → deploy-chat
                                              │
                                              ▼
                                   summary job (always runs)
                                   prints per-service change
                                   + deploy status table
```

### Pipeline Jobs

| Job | Trigger condition | What it does |
|---|---|---|
| `detect-changes` | Always | Uses `dorny/paths-filter` to output a boolean per service |
| `deploy-auth` | `auth == 'true'` | Calls `RENDER_DEPLOY_HOOK_AUTH` |
| `deploy-property` | `property == 'true'` | Calls `RENDER_DEPLOY_HOOK_PROPERTY` |
| `deploy-payment` | `payment == 'true'` | Calls `RENDER_DEPLOY_HOOK_PAYMENT` |
| `deploy-notification` | `notification == 'true'` | Calls `RENDER_DEPLOY_HOOK_NOTIFICATION` |
| `deploy-activity` | `activity == 'true'` | Calls `RENDER_DEPLOY_HOOK_ACTIVITY` |
| `deploy-chat` | `chat == 'true'` | Calls `RENDER_DEPLOY_HOOK_CHAT` |
| `summary` | Always (after all) | Posts a service/changed/status table to GitHub Actions summary |

### Required Secrets

Add these to your GitHub repository's **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `RENDER_DEPLOY_HOOK_AUTH` | Render deploy hook URL for auth-service |
| `RENDER_DEPLOY_HOOK_PROPERTY` | Render deploy hook URL for property-service |
| `RENDER_DEPLOY_HOOK_PAYMENT` | Render deploy hook URL for payment-service |
| `RENDER_DEPLOY_HOOK_NOTIFICATION` | Render deploy hook URL for notification-service |
| `RENDER_DEPLOY_HOOK_ACTIVITY` | Render deploy hook URL for activity-service |
| `RENDER_DEPLOY_HOOK_CHAT` | Render deploy hook URL for chat-service |

The workflow file lives at `.github/workflows/deploy.yml`.

---

## 📈 Performance & Load Testing

The property filter/search endpoint (`GET /api/property/filter`) was load tested using **k6** against the deployed Render instance.

### Test Configuration

| Parameter | Value |
|---|---|
| Tool | k6 |
| Target endpoint | `GET /api/property/filter` |
| Virtual users (VUs) | 500 |
| Test duration | 10 minutes |
| Request timeout | 30s |
| Infrastructure | Render free tier — 512 MB RAM |

### Results

| Metric | Value |
|---|---|
| Total requests | 20,235 |
| Throughput | 32.87 req/s |
| Success rate | 99.03% (20,038 / 20,235) |
| Failed requests | 0.97% (197) — all timeouts |
| Avg response time | 7.96s |
| Median (p50) | 3.87s |
| p90 | 20.13s |
| p95 | 20.90s |
| p99 | 22.83s |
| Max | 30.00s |

The median at **3.87s is acceptable** for a free-tier instance under 500 concurrent users. The jump from **p50 → p90 (3.87s → 20.13s)** signals the instance hitting its CPU/RAM ceiling and queuing requests. This is an infrastructure constraint, not a code problem — the microservices architecture means the property service can be scaled independently without touching auth, payments, or chat.

---

## 🐳 Docker Setup

The project includes a full `docker-compose.yml` at the root that orchestrates all services.

### Services in Docker Compose

| Service | Port | Depends On |
|---|---|---|
| auth-service | 5000 | mongo, redis-service |
| property-service | 5001 | mongo, redis-service |
| payment-service | 5002 | mongo, redis-service |
| notification-service | 5003 | — |
| activity-service | 5004 | mongo |
| chat-service | 5005 | mongo |
| redis-service | 5006 | redis |
| mongo | 27017 | — |
| redis | 6379 | — |

### Running with Docker

```bash
# Clone the repository
git clone https://github.com/yashsabne/rentsmart_v2.git
cd rentsmart_v2

# Create .env files for each service (see Environment Variables section)

# Start all services
docker compose up --build

# Run in detached mode
docker compose up -d --build
```

Each service has its own `Dockerfile` inside `./services/<service-name>/`.

---

## ⚙ Environment Variables

### Frontend (`client/.env`)

```env
VITE_AUTH_API=http://localhost:5000
VITE_PROPERTY_API=http://localhost:5001
VITE_PAYMENT_API=http://localhost:5002
VITE_NOTIF_API=http://localhost:5003
VITE_ACTIVITY_API=http://localhost:5004
VITE_CHAT_API=http://localhost:5005
```

### Auth Service (`services/auth-service/.env`)

```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/rentsmart-auth
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
REDIS_SERVICE_URL=http://redis-service:5006
INTERNAL_SECRET=your_internal_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Property Service (`services/property-service/.env`)

```env
PORT=5001
MONGO_URI=mongodb://mongo:27017/rentsmart-property
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
INTERNAL_SECRET=your_internal_secret
AUTH_SERVICE_URL=http://auth-service:5000
REDIS_SERVICE_URL=http://redis-service:5006
```

### Payment Service (`services/payment-service/.env`)

```env
PORT=5002
MONGO_URI=mongodb://mongo:27017/rentsmart-payment
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
INTERNAL_SECRET=your_internal_secret
NOTIFICATION_SERVICE_URL=http://notification-service:5003
ACTIVITY_SERVICE_URL=http://activity-service:5004
```

### Notification Service (`services/notification-service/.env`)

```env
PORT=5003
BREVO_API_KEY=your_brevo_api_key
INTERNAL_SECRET=your_internal_secret
```

### Activity Service (`services/activity-service/.env`)

```env
PORT=5004
MONGO_URI=mongodb://mongo:27017/rentsmart-activity
```

### Chat Service (`services/chat-service/.env`)

```env
PORT=5005
MONGO_URI=mongodb://mongo:27017/rentsmart-chat
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### Redis Service (`services/redis-service/.env`)

```env
PORT=5006
REDIS_URL=redis://redis:6379
INTERNAL_SECRET=your_internal_secret
```

### Production (Render-hosted services)

```env
VITE_AUTH_API=https://auth-service.onrender.com
VITE_PROPERTY_API=https://property-service.onrender.com
VITE_PAYMENT_API=https://payment-service.onrender.com
VITE_NOTIF_API=https://notification-service.onrender.com
VITE_ACTIVITY_API=https://activity-service.onrender.com
VITE_CHAT_API=https://chat-service.onrender.com
```

---

## 📁 Project Structure

```
rentsmart_v2/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Path-filtered CI/CD pipeline
├── docker-compose.yml
├── README.md
├── showcase/                       # Screenshots / demo assets
├── client/                         # React + Vite frontend
│   ├── apis.js                     # Centralized API base URL map
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── pages/
│       ├── components/
│       │   ├── reuse/              # Navbar, Footer
│       │   ├── messages/           # Chat UI
│       │   └── Hero.jsx
│       ├── constants/
│       └── const_func/
│           ├── formattedPrice.js
│           └── draftUtils.js       # loadDraft, saveDraft, clearDraft, useListingDraft
└── services/
    ├── auth-service/
    │   ├── Dockerfile
    │   └── src/
    │       ├── controllers/
    │       ├── middleware/         # authMiddleware, rateLimitMiddleware, verifyInternalSecret
    │       ├── models/             # User.js
    │       ├── routes/
    │       ├── services/           # sendVerificationEmail, sendForgotPasswordEmail
    │       └── utils/              # activityLogger, redisClient
    ├── property-service/
    │   ├── Dockerfile
    │   └── src/
    │       ├── config/             # cloudinary.js, db.js
    │       ├── controllers/
    │       ├── middleware/
    │       ├── models/             # Listing.js, SavedProperty.js, UserInteraction.js
    │       └── routes/
    ├── payment-service/
    │   ├── Dockerfile
    │   └── src/
    │       ├── config/
    │       ├── controller/
    │       ├── middleware/
    │       └── routes/
    ├── notification-service/
    │   ├── Dockerfile
    │   └── src/routes/
    ├── activity-service/
    │   ├── Dockerfile
    │   └── src/
    │       ├── controllers/
    │       └── routes/
    ├── chat-service/
    │   ├── Dockerfile
    │   └── src/
    │       ├── app.js              # Express + Socket.IO setup
    │       ├── config/
    │       ├── constants/          # events.js (socket event names)
    │       ├── middleware/
    │       ├── models/             # Conversation.js, Message.js
    │       ├── routes/
    │       └── sockets/            # chatSocket.js
    └── redis-service/
        ├── Dockerfile
        └── src/
            ├── app.js
            ├── routes/             # cache, session, rateLimit
            └── middleware/         # verifyInternalSecret
```

---

## 🔒 Security

### Implemented

- **JWT Authentication** — stateless, shared HS256 secret across all services; blacklisted on logout via redis-service
- **Redis Rate Limiting** — registration (5/hr), login (10/15 min) via redis-service
- **Email Verification** — required before creating listings or making payments
- **Internal Secret Header** — `x-internal-secret` guards all service-to-service endpoints
- **bcryptjs Password Hashing** — passwords never stored in plain text
- **Razorpay HMAC-SHA256 Signature Verification** — payment authenticity validated server-side; price enforced server-side (client cannot alter amount)
- **Environment-based Config** — secrets never hardcoded
- **CORS Whitelisting** — each service allows only known origins
- **Activity Logging** — all user actions tracked centrally

### Planned

- Suspicious activity monitoring and alerts
- User reporting and moderation system
- Role-based access control (RBAC)
- Fraud prevention and risk scoring
- User trust and reputation scoring
- Property verification workflow
- Security audit logs

---

## 🗺 Current Status & Roadmap

### ✅ Phase 1 — Complete

- [x] Microservices architecture (7 services)
- [x] Auth service (register, login, email verify, forgot/reset password, Google OAuth)
- [x] Property service (CRUD, image upload, full-text search, filter, recommendations)
- [x] Payment service (Razorpay contact-unlock + listing promotion, HMAC-verified)
- [x] Chat service (real-time Socket.IO with delivery/read receipts and typing indicators)
- [x] Activity service (logging & retrieval)
- [x] Notification service (email via Brevo API)
- [x] Redis service (dedicated HTTP microservice for cache, sessions, rate limiting)
- [x] Saved properties / wishlist
- [x] Listing draft auto-save (client-side, debounced 600ms, persists across sessions)
- [x] Docker Compose setup
- [x] Vercel frontend deployment
- [x] Render backend deployment
- [x] k6 load testing on property search endpoint
- [x] CI/CD pipeline (GitHub Actions — path-filtered per-service deploys)

### 🔄 Phase 2 — In Progress

- [ ] Microsoft OAuth login (backend ready, frontend integration pending)
- [ ] Admin dashboard and moderation tools
- [ ] Advanced property recommendation engine
- [ ] Property analytics dashboard

### 🔮 Phase 3 — Planned

- [ ] Suspicious activity monitoring
- [ ] Trust and reputation scoring
- [ ] Emergency contact and safety features
- [ ] Rate limiting at API gateway level
- [ ] Full observability (logging, metrics, tracing)
- [ ] Production-grade Kubernetes deployment
- [ ] Upgrade property service to dedicated paid instance and re-run load tests

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- MongoDB Atlas or local MongoDB
- Redis instance (or use Docker)
- Cloudinary account
- Razorpay account
- Brevo (Sendinblue) account for transactional email

### Local Development (without Docker)

```bash
# 1. Clone the repo
git clone https://github.com/yashsabne/rentsmart_v2.git
cd rentsmart_v2

# 2. Start each service
cd services/redis-service && npm install && npm start
cd services/auth-service && npm install && npm start
cd services/property-service && npm install && npm start
cd services/payment-service && npm install && npm start
cd services/notification-service && npm install && npm start
cd services/activity-service && npm install && npm start
cd services/chat-service && npm install && node src/app.js

# 3. Start the frontend
cd client && npm install && npm run dev
```

### With Docker Compose

```bash
docker compose up --build

# Frontend runs separately on Vercel or:
cd client && npm install && npm run dev
```

---

## 👨‍💻 Author

**Yash Sabne**
GitHub: [@yashsabne](https://github.com/yashsabne)

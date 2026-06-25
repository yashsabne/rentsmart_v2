# 🏠 RentSmart v2

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat&logo=redis&logoColor=white)
![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render&logoColor=white)
![Frontend on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat&logo=vercel&logoColor=white)

**RentSmart v2** is a production-ready property rental platform rebuilt from the ground up on a **containerized microservices architecture** using Docker. It is a complete redesign of RentSmart v1 (monolithic), with each business domain running as an independent service — enabling isolated deployments, fault containment, and real-world scalability.

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
- [Frontend](#-frontend-client)
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

v2 separates every domain into its own service. Auth, property, payments, chat, notifications, and activity each run in their own container, own database namespace, and own deploy lifecycle. A crash in the notification service doesn't affect a user creating a listing.

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
│  Redis      │ │  Cloudinary  │ │  MongoDB        │
└─────────────┘ └──────────────┘ └─────────────────┘
        ▼            ▼                    ▼
┌─────────────┐ ┌──────────────┐ ┌─────────────────┐
│Notification │ │ Activity Svc │ │  Chat Service   │
│  Port 5003  │ │  Port 5004   │ │  Port 5005      │
│  Nodemailer │ │  MongoDB     │ │  Socket.IO +    │
│             │ │  Morgan logs │ │  MongoDB        │
└─────────────┘ └──────────────┘ └─────────────────┘
                     ▲
              ┌──────┴──────┐
              │    Redis     │
              │  (Shared)    │
              └─────────────┘
```

All services share a single MongoDB Atlas cluster and a Redis instance for caching and rate limiting. Inter-service calls are authenticated via an `x-internal-secret` header to prevent unauthorized cross-service access.

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
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
| Redis | Rate limiting, caching, inter-service state |
| bcryptjs | Password hashing |
| Socket.IO | Real-time chat |
| Cloudinary + Multer | Image storage |
| Razorpay | Payment gateway |
| Nodemailer | Email delivery |
| Passport.js | OAuth (Google + Microsoft) |
| Morgan | HTTP request logging |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerization & orchestration |
| Redis (dedicated container) | Shared in-memory store |
| Vercel | Frontend hosting |
| Render | Backend service hosting |

---

## 🔧 Services

### 🔐 Auth Service (Port 5000)

Handles all authentication and user identity management.

**Key Features:**
- User registration with email verification
- Login with JWT issuance
- Forgot password / reset password via secure email token
- Rate-limited registration (5 attempts/hr) and login (10 attempts/15 min) via Redis
- Google OAuth and Microsoft OAuth via Passport.js
- Internal user lookup endpoint (protected by internal secret)
- Recently viewed properties tracking per user

**API Routes (`/api/auth/...`):**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login and receive JWT |
| POST | `/logout` | ✅ | Logout user |
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

**User Model Fields:**
`email`, `password`, `firstName`, `lastName`, `phone`, `city`, `preferences` (1BHK/2BHK/3BHK/Villa/Studio/Commercial), `emailNotifications`, `smsNotifications`, `whatsappNotifications`, `googleId`, `microsoftId`, `emailVerificationToken`, `emailVerificationExpiry`

---

### 🏘 Property Service (Port 5001)

Manages all property listing CRUD, image uploads, filtering, search, and recommendations.

**Key Features:**
- Create, update, delete property listings (verified email required)
- Upload up to 8 photos per listing via Cloudinary
- Filter listings by type, city, price range, BHK
- Similar property recommendations
- Personalized recommendations based on user city and preferences
- Search for non-logged-in users (latest listings)
- Internal endpoint to hide listings by owner (e.g. when account is suspended)

**API Routes (`/api/property/...`):**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/upload-photos` | ✅ + Verified | Upload listing photos to Cloudinary |
| POST | `/` | ✅ + Verified | Create a new listing |
| GET | `/filter` | ❌ | Filter listings |
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

Handles all Razorpay-powered payment flows for property access and listing promotion.

**Key Features:**
- Create Razorpay payment orders
- Verify payment signatures server-side
- Property access gating (check if user has paid for a listing)
- Promote listing payment flow (pay to boost a listing)
- Payment history tracking

**API Routes (`/api/payment/...`):**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-order` | ✅ + Verified | Create a Razorpay order |
| POST | `/verify-payment` | ✅ + Verified | Verify Razorpay payment |
| GET | `/check-access` | ✅ | Check if user has access to a property |
| POST | `/promote/order` | ✅ | Create a promo boost order |
| POST | `/promote/verify` | ✅ | Verify promo payment |
| GET | `/history` | ✅ | Get payment history |

---

### 🔔 Notification Service (Port 5003)

Lightweight, stateless email delivery service decoupled from auth so email failures never block registration or login flows.

**Key Features:**
- Email-based notifications (verification, password reset)
- Consumed internally by other services — no direct user-facing endpoints
- No database — pure send-and-forget

---

### 📊 Activity Service (Port 5004)

Centralized service for logging and retrieving all user activity events across the platform.

**Key Features:**
- Log any user activity (login events, property views, searches)
- Retrieve activity history per user
- Used for analytics, audit trails, and future trust scoring

**API Routes (`/api/activity/...`):**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Log a new activity event |
| GET | `/:userId` | Get activity log for a user |

---

### 💬 Chat Service (Port 5005)

Real-time, socket-powered messaging between users.

**Key Features:**
- Socket.IO-based real-time messaging
- Conversation creation and management
- Message delivery status tracking (`sent` → `delivered` → `read`)
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

## 🖥 Frontend (Client)

A React 19 SPA built with Vite, deployed on Vercel.

### Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | HomePage | Landing, property search, personalized or latest listings |
| `/register` | RegisterPage | User registration with preferences |
| `/login` | LoginPage | JWT login |
| `/dashboard` | Dashboard | User dashboard |
| `/dashboard/messages` | Dashboard (Messages) | Chat inbox |
| `/dashboard/messages/:slug` | Dashboard (Chat) | Individual chat conversation |
| `/saved-properties` | SavedPropertiesPage | Bookmarked listings |
| `/details/:id` | ListingDetails | Full property detail page |
| `/search-for-property/:type` | PropertyBuyPage | Filtered property search |
| `/create` | CreateListing | Create a new property listing |
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
- **`client/src/const_func/`** — Utility functions (e.g. `formattedPrice`)
- Token stored in `localStorage`, sent as `Authorization: Bearer <token>` header

---

## 📈 Performance & Load Testing

The property filter endpoint (`GET /api/property/filter`) was load tested using **k6** to validate behavior under real traffic conditions. The backend services are deployed on Render's free tier (512 MB RAM, shared CPU, no horizontal scaling).

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

### What these numbers mean

The median at **3.87s is acceptable** for a free-tier instance under 500 concurrent users. The real story is the **jump from p50 → p90 (3.87s → 20.13s)** — a 5x spike that signals the instance hitting its CPU/RAM ceiling and queuing requests rather than processing them. Once the queue fills, requests approach the 30s timeout, which accounts for the 0.97% failure rate.

**This is an infrastructure constraint, not a code problem.** The same service on a paid Render instance or a horizontally scaled container setup would flatten this latency curve significantly. The microservices architecture means the property service can be scaled independently without touching auth, payments, or chat.

---

## 🐳 Docker Setup

The project includes a full `docker-compose.yml` at the root that orchestrates all services.

### Services in Docker Compose

| Service | Port | Depends On |
|---|---|---|
| auth-service | 5000 | mongo, redis |
| property-service | 5001 | mongo, redis |
| payment-service | 5002 | mongo, redis |
| notification-service | 5003 | mongo, redis |
| activity-service | 5004 | mongo |
| chat-service | 5005 | mongo |
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
REDIS_SERVICE_URL=http://redis-service:6379
INTERNAL_SECRET=your_internal_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
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
```

### Payment Service (`services/payment-service/.env`)

```env
PORT=5002
MONGO_URI=mongodb://mongo:27017/rentsmart-payment
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### Notification Service (`services/notification-service/.env`)

```env
PORT=5003
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
└── services/
    ├── auth-service/
    │   ├── Dockerfile
    │   └── src/
    │       ├── controllers/        # authController, recentlyViewedController
    │       ├── middleware/         # authMiddleware, rateLimitMiddleware, verifyInternalSecret
    │       ├── models/             # User.js
    │       ├── routes/
    │       ├── services/           # sendVerificationEmail, sendForgotPasswordEmail
    │       └── utils/             # activityLogger, redisClient
    ├── property-service/
    │   ├── Dockerfile
    │   └── src/
    │       ├── config/            # cloudinary.js, db.js
    │       ├── controllers/
    │       ├── middleware/
    │       ├── models/            # Property.js
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
    └── chat-service/
        ├── Dockerfile
        └── src/
            ├── app.js             # Express + Socket.IO setup
            ├── config/
            ├── constants/         # events.js (socket event names)
            ├── middleware/
            ├── models/            # Conversation.js, Message.js
            ├── routes/
            └── sockets/           # chatSocket.js
```

---

## 🔒 Security

### Implemented

- **JWT Authentication** — stateless, shared secret across all services
- **Redis Rate Limiting** — registration (5/hr), login (10/15 min)
- **Email Verification** — required before creating listings or making payments
- **Internal Secret Header** — `x-internal-secret` guards all service-to-service endpoints
- **bcryptjs Password Hashing** — passwords never stored in plain text
- **Environment-based Config** — secrets never hardcoded
- **CORS Whitelisting** — each service allows only known origins
- **Activity Logging** — all user actions tracked centrally
- **Razorpay Signature Verification** — payment authenticity validated server-side

### Planned

- Suspicious activity monitoring and alerts
- User reporting and moderation system
- Security audit logs
- Role-based access control (RBAC)
- Fraud prevention and risk scoring
- User trust and reputation scoring
- Property verification workflow

---

## 🗺 Current Status & Roadmap

### ✅ Phase 1 — Complete

- [x] Microservices architecture established
- [x] Auth service (register, login, email verify, forgot/reset password)
- [x] Property service (CRUD, image upload, filter, search, recommendations)
- [x] Payment service (Razorpay, access gating, promote)
- [x] Chat service (real-time Socket.IO messaging)
- [x] Activity service (logging & retrieval)
- [x] Notification service (email delivery)
- [x] Redis rate limiting and caching
- [x] Docker Compose setup
- [x] Vercel frontend deployment
- [x] Render backend deployment
- [x] k6 load testing on property filter endpoint

### 🔄 Phase 2 — In Progress

- [ ] Google / Microsoft OAuth login (backend ready, frontend integration pending)
- [ ] Admin dashboard and moderation tools
- [ ] Advanced property recommendation engine
- [ ] CI/CD pipeline (GitHub Actions)
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

### Local Development (without Docker)

```bash
# 1. Clone the repo
git clone https://github.com/yashsabne/rentsmart_v2.git
cd rentsmart_v2

# 2. Start each service
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

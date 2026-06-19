# 🏠 RentSmart v2

**RentSmart v2** is a production-ready, scalable property rental platform built on a **containerized microservices architecture** using Docker. It is a complete ground-up redesign of RentSmart v1 (monolithic), rebuilt to achieve independent service deployment, better fault isolation, and real-world scalability.

🔗 **Live Demo:** [rentsmart-v2.vercel.app](https://rentsmart-v2.vercel.app)
📦 **Repository:** [github.com/yashsabne/rentsmart_v2](https://github.com/yashsabne/rentsmart_v2)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Services](#-services)
  - [Auth Service](#-auth-service-port-5000)
  - [Property Service](#-property-service-port-5001)
  - [Payment Service](#-payment-service-port-5002)
  - [Notification Service](#-notification-service-port-5003)
  - [Activity Service](#-activity-service-port-5004)
  - [Chat Service](#-chat-service-port-5005)
- [Frontend (Client)](#-frontend-client)
- [Docker Setup](#-docker-setup)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Current Status & Roadmap](#-current-status--roadmap)
- [Getting Started](#-getting-started)

---

## 🧭 Overview

RentSmart v2 enables users to **discover, list, manage, and transact on rental properties** through a modern, service-oriented platform. Each business domain (Auth, Property, Payments, Chat, Notifications, Activity) runs as its own independent microservice, communicating over HTTP and real-time sockets.

Key improvements over v1:
- Monolith → Microservices
- Stateless JWT auth shared across services
- Redis-backed rate limiting and caching
- Razorpay payment integration
- Real-time chat with Socket.IO
- Cloudinary-based image uploads
- Docker Compose for unified local/production deployment

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────┐
│                  React + Vite (Client)           │
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
│Notification │ │ Activity Svc │ │  Chat Service    │
│  Port 5003  │ │  Port 5004   │ │  Port 5005       │
│  Nodemailer │ │  MongoDB     │ │  Socket.IO +     │
│             │ │  Morgan logs │ │  MongoDB         │
└─────────────┘ └──────────────┘ └─────────────────┘
                     ▲
              ┌──────┴──────┐
              │    Redis     │
              │  (Shared)    │
              └─────────────┘
```

All services share a single MongoDB cluster and a Redis instance for caching and rate limiting. Services communicate with each other using an internal secret header (`x-internal-secret`) for protected inter-service calls.

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
| Redis | Rate limiting, caching, inter-service |
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
| Docker + Docker Compose | Containerization |
| Redis (dedicated service) | Shared in-memory store |
| Vercel | Frontend hosting |
| Render | Backend service hosting |

---

## 🔧 Services

### 🔐 Auth Service (Port 5000)

Handles all authentication and user identity management.

**Key Features:**
- User registration with email verification
- Login with JWT issuance
- Forgot password / Reset password via secure email token
- Rate-limited registration (5 attempts/hr) and login (10 attempts/15 min) using Redis
- Google OAuth and Microsoft OAuth support (Passport.js)
- Internal user lookup endpoint (protected by internal secret)
- Recently Viewed properties tracking per user

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

**Dependencies:** `bcryptjs`, `jsonwebtoken`, `mongoose`, `nodemailer`, `passport`, `passport-google-oauth20`, `passport-microsoft`, `express-session`, `dotenv`, `cors`

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

**Dependencies:** `axios`, `cloudinary`, `multer`, `multer-storage-cloudinary`, `mongoose`, `jsonwebtoken`, `cors`, `dotenv`, `bcryptjs`

---

### 💳 Payment Service (Port 5002)

Handles all Razorpay-powered payment flows for property access and property promotion.

**Key Features:**
- Create Razorpay payment orders
- Verify payment signatures
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

**API Routes (`/api/payments/...`):**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/history` | Get payment history |

**Dependencies:** `razorpay`, `crypto`, `mongoose`, `jsonwebtoken`, `cors`, `dotenv`

---

### 🔔 Notification Service (Port 5003)

Lightweight email notification delivery service.

**Key Features:**
- Handles email-based notifications (e.g. verification emails, password reset)
- Decoupled from the auth service so email failures don't block registration
- Stateless — no database, just sends emails via the notification routes

**API Routes (`/api/notify/...`):**
- Internal email sending endpoints consumed by other services

**Dependencies:** `express`, `cors`, `dotenv`

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

**Dependencies:** `mongoose`, `morgan`, `express`, `cors`, `dotenv`

---

### 💬 Chat Service (Port 5005)

Real-time, socket-powered messaging service between users.

**Key Features:**
- Socket.IO-based real-time messaging
- Conversation creation and management
- Message delivery status tracking (`sent` → `delivered` → `read`)
- Online user tracking (Map-based)
- JWT-authenticated socket connections
- Slug-based conversation identifiers (nanoid)

**Socket Events:**
- `USER_ONLINE` — broadcasts when a user connects
- `JOIN_CONVERSATION` — join a socket room by conversation slug
- `LEAVE_CONVERSATION` — leave a room
- `MESSAGE_DELIVERED` — broadcast delivery status updates
- `ONLINE_USERS` — emit current online users list

**REST Routes:**
- `/conversations` — CRUD for conversations
- `/messages` — message history per conversation
- `/health` — service health check

**Dependencies:** `socket.io`, `mongoose`, `jsonwebtoken`, `nanoid`, `express-validator`, `cors`, `dotenv`

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

- **`client/apis.js`** — Centralised API base URL map (`API.AUTH`, `API.PROPERTY`, `API.PAYMENT`, etc.)
- **`client/src/pages/`** — Page-level components
- **`client/src/components/`** — Reusable components (Navbar, Footer, Hero, Messages)
- **`client/src/constants/`** — App-wide constants and stats
- **`client/src/const_func/`** — Utility functions (e.g. `formattedPrice`)
- Token stored in `localStorage`, sent as `Authorization: Bearer <token>` header

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
├── docker-compose.yml              # Orchestrates all services
├── README.md
├── showcase/                       # Screenshots / demo assets
├── client/                         # React + Vite frontend
│   ├── apis.js                     # Centralised API base URL map
│   ├── package.json
│   └── src/
│       ├── App.jsx                 # Route definitions
│       ├── pages/                  # Page components
│       ├── components/             # Reusable UI components
│       │   ├── reuse/              # Navbar, Footer
│       │   ├── messages/           # Chat UI
│       │   └── Hero.jsx
│       ├── constants/              # App constants & stats
│       └── const_func/            # Utility functions
└── services/
    ├── auth-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── controllers/        # authController, recentlyViewedController
    │       ├── middleware/         # authMiddleware, rateLimitMiddleware, verifyInternalSecret
    │       ├── models/             # User.js
    │       ├── routes/             # authRoutes.js
    │       ├── services/           # sendVerificationEmail, sendForgotPasswordEmail
    │       └── utils/             # activityLogger, redisClient
    ├── property-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── config/            # cloudinary.js, db.js
    │       ├── controllers/       # propertyController.js
    │       ├── middleware/        # authMiddleware, requireVerifiedEmail, verifyInternalSecret
    │       ├── models/            # Property.js
    │       └── routes/            # propertyRoutes.js
    ├── payment-service/
    │   ├── Dockerfile
    │   ├── app.js
    │   └── src/
    │       ├── config/            # db.js
    │       ├── controller/        # paymentController.js
    │       ├── middleware/        # authMiddleware, requireVerifiedEmail
    │       └── routes/            # paymentRoutes.js, historyRoutes.js
    ├── notification-service/
    │   ├── Dockerfile
    │   ├── app.js
    │   └── src/
    │       └── routes/            # notificationRoutes.js
    ├── activity-service/
    │   ├── Dockerfile
    │   └── src/
    │       ├── controllers/       # activityController.js
    │       └── routes/            # activityRoutes.js
    └── chat-service/
        ├── Dockerfile
        ├── package.json
        └── src/
            ├── app.js             # Express + Socket.IO setup
            ├── config/            # db.js
            ├── constants/         # events.js (socket event names)
            ├── middleware/        # authMiddleware (JWT + socket)
            ├── models/            # Conversation.js, Message.js
            ├── routes/            # conversationRoutes.js, messageRoutes.js
            └── sockets/           # chatSocket.js (online users, delivery tracking)
```

---

## 🔒 Security

### Implemented
- **JWT Authentication** — stateless, shared secret across all services
- **Redis Rate Limiting** — registration (5/hr), login (10/15min), via dedicated Redis service
- **Email Verification** — required before creating listings or making payments
- **Internal Secret Header** — `x-internal-secret` guards service-to-service endpoints
- **bcryptjs Password Hashing** — passwords never stored in plain text
- **Environment-based Config** — secrets never hardcoded
- **CORS Whitelisting** — each service allows only known origins
- **Activity Logging** — all user actions tracked centrally
- **Razorpay Signature Verification** — payment authenticity validated server-side

### Planned
- Suspicious activity monitoring & alerts
- User reporting and moderation system
- Security audit logs
- Advanced authorization (RBAC)
- Fraud prevention & risk scoring
- User trust and reputation scoring
- Property verification workflow

---

## 🗺 Current Status & Roadmap

### ✅ Phase 1 — Complete (Current)
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

### 🔄 Phase 2 — In Progress
- [ ] Google / Microsoft OAuth login (backend ready, frontend integration)
- [ ] Admin dashboard and moderation tools
- [ ] Advanced property recommendation engine
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Property analytics dashboard

### 🔮 Phase 3 — Planned
- [ ] Suspicious activity monitoring
- [ ] Trust & reputation scoring
- [ ] Emergency contact and safety features
- [ ] Rate limiting at API gateway level
- [ ] Full observability (logging, metrics, tracing)
- [ ] Production-grade Kubernetes deployment

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
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
# Build and start all containers
docker compose up --build

# Frontend runs separately on Vercel or:
cd client && npm install && npm run dev
```

---

## 👨‍💻 Author

**Yash Sabne**
GitHub: [@yashsabne](https://github.com/yashsabne)

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.

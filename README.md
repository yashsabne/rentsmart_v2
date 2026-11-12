# RentSmart v2

RentSmart is a property rental and sales platform built around a React
frontend and a set of independently running Node.js backend services. It
supports property discovery, owner-managed listings, paid contact
unlocking, listing promotion, user activity, and real-time conversations
between property seekers and owners.

## Contents

-   [Features](#features)
-   [Architecture](#architecture)
-   [Technology stack](#technology-stack)
-   [Repository structure](#repository-structure)
-   [How the main flows work](#how-the-main-flows-work)
-   [Local development](#local-development)
-   [Environment variables](#environment-variables)
-   [API overview](#api-overview)
-   [Deployment](#deployment)
-   [Implementation notes](#implementation-notes)

## Features

### Property discovery

-   Browse rental and sale listings.
-   Search by city and text.
-   Filter by price, property type, bedrooms, bathrooms, furnishing,
    parking, and amenities.
-   Sort by price or listing recency.
-   View listing details, photos, location, owner information, and
    similar properties.
-   See promoted listings with higher placement in search results.
-   Track authenticated user interactions to help personalize listing
    order.

### Owner listing management

-   Create, edit, and delete property listings.
-   Upload up to eight listing photos to Cloudinary.
-   Save an in-progress listing draft in browser local storage.
-   View listings and listing statistics in the owner dashboard.
-   Hide or unhide a listing.
-   Change listing status (`AVAILABLE`, `RENTED`, or `SOLD`).
-   Refresh a listing, subject to a three-day cooldown.
-   Promote a listing through a Razorpay payment flow.
-   Request an AI-powered property evaluation and view its evaluation
    history.

### Accounts and preferences

-   Register and log in with email/phone and password.
-   Verify email addresses and request password-reset links.
-   Sign in through the configured Google OAuth flow.
-   Update profile details, property preferences, and notification
    preferences.
-   Change a password or request account deletion.
-   View recently viewed properties.
-   Save properties to a user account; guest save state is stored in
    browser local storage.

### Contact unlocking and payments

-   Create a Razorpay order to unlock an owner's contact details.
-   Verify the Razorpay payment signature on the backend.
-   Return the unlocked contact information after successful
    verification.
-   Promote a listing for 30 days after successful payment verification.
-   View contact-payment history, promotion history, and a payment
    summary.

### Messaging and activity

-   Start and archive buyer-owner conversations associated with a
    property.
-   Send and retrieve messages through authenticated HTTP endpoints.
-   Use Socket.IO for live conversation updates, typing indicators,
    online presence, and delivery/read events.
-   Store user activity records such as logins, property actions, and
    payment events.

### Email notifications

The Notification Service sends transactional emails through the Brevo
SMTP API for payment success, contact unlock, owner contact-view, and
listing-promotion events. The Auth Service also uses Brevo for email
verification and password-reset messages.

## Architecture

The repository contains a React client and seven backend services.
MongoDB and Redis are infrastructure dependencies used by the services;
the Redis Service exposes Redis operations through an internal HTTP API.

``` mermaid
flowchart TB
    Browser[React + Vite client]
    Auth[Auth Service]
    Property[Property Service]
    Payment[Payment Service]
    Notification[Notification Service]
    Activity[Activity Service]
    Chat[Chat Service + Socket.IO]
    RedisAPI[Redis Service]
    Mongo[(MongoDB)]
    Redis[(Redis / Upstash)]
    Cloudinary[Cloudinary]
    Razorpay[Razorpay]
    Brevo[Brevo Email API]
    AI[External Property Intelligence API]

    Browser --> Auth
    Browser --> Property
    Browser --> Payment
    Browser --> Activity
    Browser --> Chat
    Auth --> Mongo
    Property --> Mongo
    Payment --> Mongo
    Activity --> Mongo
    Chat --> Mongo
    Auth --> RedisAPI
    Property --> RedisAPI
    Payment --> RedisAPI
    Activity --> RedisAPI
    Chat --> RedisAPI
    RedisAPI --> Redis
    Property --> Cloudinary
    Payment --> Razorpay
    Payment --> Notification
    Notification --> Brevo
    Auth --> Brevo
    Property --> AI
    Payment --> Auth
    Payment --> Property
    Auth --> Activity
    Property --> Activity
    Payment --> Activity
```

### Backend services

  ---------------------------------------------------------------------
  Service                             Default port Responsibility
  -------------------- --------------------------- --------------------
  Auth Service                              `5000` Registration, login,
                                                   JWT authentication,
                                                   Google OAuth, email
                                                   verification,
                                                   password reset,
                                                   profile/settings,
                                                   recently viewed
                                                   properties

  Property Service                          `5001` Listing CRUD,
                                                   filtering/search,
                                                   recommendations,
                                                   saved properties,
                                                   interactions,
                                                   sharing, owner
                                                   actions, Cloudinary
                                                   uploads, AI
                                                   evaluation
                                                   integration

  Payment Service                           `5002` Razorpay order
                                                   creation and
                                                   signature
                                                   verification,
                                                   contact access,
                                                   listing promotion,
                                                   payment history

  Notification Service                      `5003` Internal
                                                   transactional email
                                                   endpoints backed by
                                                   Brevo

  Activity Service                          `5004` Store and retrieve
                                                   user activity
                                                   records

  Chat Service                              `5005` Conversation and
                                                   message APIs,
                                                   Socket.IO
                                                   connections, online
                                                   presence and chat
                                                   events

  Redis Service                             `5006` HTTP interface for
                                                   cache, sessions,
                                                   token blacklist,
                                                   OTP, rate limits,
                                                   queues, and Pub/Sub
                                                   operations
  ---------------------------------------------------------------------

The services connect to MongoDB using their configured `MONGO_URI`. They
use separate Mongoose models/collections, but the code does not
establish a separate MongoDB deployment per service.

### Request routing

In the current production setup, the frontend calls the backend services
using their configured service base URLs. The backend services are
deployed independently on Render; NGINX is not currently in the
production request path.

An NGINX reverse-proxy configuration and Dockerfile are present in the
repository as groundwork for a future gateway-based architecture. That
configuration is planned work and should not be treated as a deployed
production component.

### Data and integrations

-   **MongoDB:** Stores users, listings, saved-property records,
    interactions, payments, conversations, messages, shares, and
    activity records.
-   **Redis:** Stores cache entries, sessions, token blacklist entries,
    OTP values, rate-limit counters, and queue data.
-   **Cloudinary:** Stores listing photos. The upload middleware accepts
    JPG, PNG, and WEBP images, up to 5 MB per image, with a maximum of
    eight images per upload.
-   **Razorpay:** Handles payment checkout. The backend verifies the
    returned signature using HMAC-SHA256 and the configured Razorpay
    secret.
-   **Brevo:** Sends transactional emails.
-   **Property Intelligence API:** An external service called by the
    Property Service for listing evaluation and evaluation-history
    retrieval. Its implementation is not contained in this repository.

## Technology stack

  ---------------------------------------------------------------------
  Layer                              Technologies
  ---------------------------------- ----------------------------------
  Frontend                           React 19, Vite, React Router,
                                     Tailwind CSS 4

  Backend                            Node.js, Express

  Database                           MongoDB, Mongoose

  Cache and supporting data          Redis, ioredis

  Real-time communication            Socket.IO and socket.io-client

  Authentication                     JWT, bcryptjs, Passport Google
                                     OAuth

  Payments                           Razorpay

  Image storage                      Cloudinary, Multer

  Email                              Brevo API

  Planned reverse proxy              NGINX (configuration only; not
                                     deployed in production)

  Containers                         Docker, Docker Compose

  Frontend hosting / analytics       Vercel configuration, Vercel
                                     Analytics and Speed Insights

  Backend deployment                 Render deploy hooks through GitHub
                                     Actions
  ---------------------------------------------------------------------

## Repository structure

``` text
rentsmart_v2/
├── client/                         # React + Vite frontend
│   ├── src/
│   │   ├── chat/                   # Socket context and chat hooks
│   │   ├── components/             # Shared UI, dashboard, payments, chat
│   │   ├── pages/                  # Application pages
│   │   ├── services/               # Frontend API clients
│   │   ├── draft/                  # Listing draft persistence
│   │   └── utils/
│   ├── apis.js                     # Frontend API base URLs
│   └── vercel.json                 # SPA rewrite configuration
├── services/
│   ├── auth-service/
│   ├── property-service/
│   ├── payment-service/
│   ├── notification-service/
│   ├── activity-service/
│   ├── chat-service/
│   ├── redis-service/
│   └── chatbot-service             # Placeholder referring to a separate repository
├── nginx/
│   └── nginx.render.conf           # Planned NGINX gateway configuration
├── postman/
│   ├── RentSmart.postman_collection.json
│   └── RentSmart_Local.postman_environment.json
├── .github/
│   └── workflows/
│       └── deploy.yml              # Changed-service Render deploy workflow
├── docker-compose.yml              # Local backend + MongoDB + Redis
└── Dockerfile.nginx
```

## How the main flows work

### 1. Creating a property listing

1.  The owner completes the multi-step listing form in the frontend.
2.  The draft form and current step can be saved in browser local
    storage.
3.  The frontend uploads photos to the Property Service.
4.  The Property Service uses Multer and Cloudinary Storage to upload
    the images.
5.  The frontend submits the listing data to the Property Service.
6.  The Property Service saves the listing in MongoDB.
7.  It then calls the external Property Intelligence API to evaluate the
    new listing.
8.  If the AI evaluation fails, listing creation is still allowed to
    complete; the response indicates that the evaluation was
    unavailable.
9.  The service invalidates relevant listing caches and records a
    property-created activity.

### 2. Searching and ranking properties

The Property Service builds a MongoDB aggregation pipeline for filtered
listing requests.

-   When a text or city search is supplied, the service uses the Atlas
    Search index named `default`.
-   Search relevance boosts title matches above amenities, property
    type/category, and description matches.
-   Additional filters are applied for transaction type, property type,
    price, bedrooms, bathrooms, furnishing, parking, and amenities.
-   Promoted listings receive a higher sort priority while their
    promotion is active.
-   For authenticated users, the service builds preferences from profile
    information and recent interactions. Interaction weights are
    assigned to actions such as viewing, saving, contacting, and
    sharing, with older interactions decaying over time.
-   Guest filter results and individual listing details are cached
    through the Redis Service.

A MongoDB Atlas Search index named `default` must be configured for the
listing fields used by the search aggregation (`title`, `amenities`,
`type`, `category`, and `description`).

### 3. Unlocking an owner's contact details

1.  The frontend requests a payment order from the Payment Service.
2.  The Payment Service retrieves the listing and buyer/owner details
    from the Property and Auth Services.
3.  It creates a Razorpay order and stores a pending payment record.
4.  The user completes checkout through Razorpay.
5.  The frontend sends the Razorpay order ID, payment ID, and signature
    to the Payment Service.
6.  The backend recomputes the HMAC-SHA256 signature and compares it
    with the submitted signature.
7.  After successful verification, the payment record is marked paid and
    access is granted.
8.  The Payment Service requests notification emails and records
    activity events.
9.  The verified response includes the owner's contact information.

### 4. Promoting a listing

1.  The owner requests a promotion order through the Payment Service.
2.  The Payment Service creates a Razorpay order and a promotion-payment
    record.
3.  After checkout, the frontend submits the payment details for
    verification.
4.  The Payment Service verifies the signature and asks the Property
    Service's internal promotion endpoint to activate the listing.
5.  The Property Service marks the listing as promoted and sets a 30-day
    expiry.
6.  A promotion activity and confirmation email are requested.

### 5. Real-time messaging

-   The frontend obtains a JWT and connects to the Chat Service using
    Socket.IO.
-   The Chat Service authenticates the socket handshake using the JWT.
-   Conversation and message data are stored in MongoDB.
-   REST endpoints handle conversation creation, listing conversations,
    message history, message sending, read state, and archiving.
-   Socket.IO rooms are used for conversation-scoped events, including
    incoming messages, typing state, online presence, and delivery/read
    updates.

### 6. AI property evaluation

The Property Service calls an external Property Intelligence API using
`PROPERTY_INTELLIGENCE_URL` and `PROPERTY_INTELLIGENCE_API_KEY`.

-   New listings are evaluated after the listing record is saved.
-   Owners can request an evaluation for an existing listing through an
    authenticated endpoint.
-   The existing-listing endpoint checks ownership and checks evaluation
    history before requesting a new evaluation.
-   Owners can retrieve evaluation history through a separate
    authenticated endpoint.
-   The frontend review page presents evaluation scores, text/image
    evaluation summaries, issues, improvement suggestions, and saved
    evaluation history when supplied by the external service.

The evaluation engine itself is not implemented in this repository; it
must be deployed separately and made reachable by the Property Service.

## Local development

### Prerequisites

-   Node.js (use a current LTS release compatible with the Vite version
    in `client/package.json`)
-   npm
-   Docker Desktop with Docker Compose
-   A MongoDB connection (local MongoDB through Compose or a MongoDB
    deployment)
-   A Redis instance
-   Credentials for the third-party services required by the features
    you want to run

### 1. Configure backend environment files

Docker Compose expects an environment file for each backend service:

``` text
services/auth-service/.env
services/property-service/.env
services/payment-service/.env
services/notification-service/.env
services/activity-service/.env
services/chat-service/.env
services/redis-service/.env
```

These files are not included in the repository. Create them locally and
populate the variables listed in [Environment
variables](#environment-variables).

For a Docker Compose network, service-to-service URLs should use the
Compose service names, for example:

``` env
MONGO_URI=mongodb://mongo:27017/rentsmart
REDIS_SERVICE_URL=http://redis-service:5006
AUTH_SERVICE_URL=http://auth-service:5000
PROPERTY_SERVICE_URL=http://property-service:5001
ACTIVITY_SERVICE_URL=http://activity-service:5004
NOTIFICATION_SERVICE_URL=http://notification-service:5003
```

Set the Redis Service to development mode and point it at the Compose
Redis container:

``` env
VERSION=development
REDIS_HOST=redis
REDIS_PORT=6379
```

Only add the service URLs relevant to each service's code. For example,
the Notification Service does not need a MongoDB connection.

### 2. Start the backend services and infrastructure

From the repository root:

``` bash
docker compose up --build
```

The Compose file starts the seven backend services, a MongoDB container,
and a Redis container. MongoDB and Redis data are persisted using named
Docker volumes.

The Compose configuration uses `depends_on` with `service_started`; it
does not define health checks or wait for database readiness. If a
service starts before its dependency is ready, inspect its logs and
restart it after the dependency is available.

### 3. Start the frontend

Create `client/.env` and set the frontend API URLs. For local
development where the backend ports are exposed by Docker Compose:

``` env
VITE_AUTH_API=http://localhost:5000
VITE_PROPERTY_API=http://localhost:5001
VITE_PAYMENT_API=http://localhost:5002
VITE_NOTIF_API=http://localhost:5003
VITE_ACTIVITY_API=http://localhost:5004
VITE_CHAT_API=http://localhost:5005
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Then run:

``` bash
cd client
npm install
npm run dev
```

Vite prints the local development URL, normally `http://localhost:5173`.

### 4. Frontend build and lint

From `client/`:

``` bash
npm run build
npm run lint
npm run preview
```

The backend package manifests do not currently define a working
automated test suite. Most backend packages contain a placeholder `test`
script that exits with an error.

## Environment variables

Use secrets from your own accounts. Do not commit `.env` files or expose
secret values in frontend variables. Only values prefixed with `VITE_`
are intended to be exposed to the browser.

### Frontend (`client/.env`)

  ---------------------------------------------------------------------
  Variable                           Purpose
  ---------------------------------- ----------------------------------
  `VITE_AUTH_API`                    Auth Service base URL

  `VITE_PROPERTY_API`                Property Service base URL

  `VITE_PAYMENT_API`                 Payment Service base URL

  `VITE_ACTIVITY_API`                Activity Service base URL

  `VITE_NOTIF_API`                   Notification Service base URL
                                     (declared in the frontend API
                                     configuration)

  `VITE_CHAT_API`                    Chat Service base URL

  `VITE_RAZORPAY_KEY_ID`             Public Razorpay checkout key ID
  ---------------------------------------------------------------------

### Auth Service

  ---------------------------------------------------------------------
  Variable                           Purpose
  ---------------------------------- ----------------------------------
  `PORT`                             Service port; defaults to `5000`

  `MONGO_URI`                        MongoDB connection string

  `JWT_SECRET`                       JWT signing and verification
                                     secret

  `SESSION_SECRET`                   Express session secret used by the
                                     OAuth setup

  `CLIENT_URL`                       Frontend origin and email
                                     verification/reset link base

  `BACKEND_URL_AUTH`                 Auth Service callback base URL for
                                     Google OAuth

  `GOOGLE_CLIENT_ID`                 Google OAuth client ID

  `GOOGLE_CLIENT_SECRET`             Google OAuth client secret

  `BREVO_API_KEY`                    Brevo API key for verification and
                                     reset emails

  `OWNER_EMAIL`                      Sender email configured in Brevo

  `REDIS_SERVICE_URL`                Redis Service base URL

  `ACTIVITY_SERVICE_URL`             Activity Service base URL

  `PROPERTY_SERVICE_URL`             Property Service base URL for
                                     account-deletion listing cleanup

  `INTERNAL_SECRET`                  Shared secret for internal service
                                     requests

  `NODE_ENV`                         Controls secure session-cookie
                                     behavior in production
  ---------------------------------------------------------------------

### Property Service

  ---------------------------------------------------------------------
  Variable                           Purpose
  ---------------------------------- ----------------------------------
  `PORT`                             Service port; defaults to `5001`

  `MONGO_URI`                        MongoDB connection string

  `JWT_SECRET`                       JWT verification secret

  `REDIS_SERVICE_URL`                Redis Service base URL

  `CLOUDINARY_CLOUD_NAME`            Cloudinary cloud name

  `CLOUDINARY_API_KEY`               Cloudinary API key

  `CLOUDINARY_API_SECRET`            Cloudinary API secret

  `ACTIVITY_SERVICE_URL`             Activity Service base URL

  `AUTH_SERVICE_URL`                 Auth Service base URL for
                                     verified-user checks

  `INTERNAL_SECRET`                  Shared secret for internal
                                     endpoints

  `PROPERTY_INTELLIGENCE_URL`        External Property Intelligence API
                                     base URL

  `PROPERTY_INTELLIGENCE_API_KEY`    Key sent to the Property
                                     Intelligence API

  `CLIENT_URL`                       Frontend base URL used by
                                     share-link redirects

  `SERVER_URL`                       Public backend base URL used when
                                     creating share links
  ---------------------------------------------------------------------

### Payment Service

  ---------------------------------------------------------------------
  Variable                           Purpose
  ---------------------------------- ----------------------------------
  `PORT`                             Service port; defaults to `5002`

  `MONGO_URI`                        MongoDB connection string

  `JWT_SECRET`                       JWT verification secret

  `RAZORPAY_KEY_ID`                  Razorpay key ID

  `RAZORPAY_KEY_SECRET`              Razorpay secret used for order
                                     signature verification

  `AUTH_SERVICE_URL`                 Auth Service base URL

  `PROPERTY_SERVICE_URL`             Property Service base URL

  `NOTIFICATION_SERVICE_URL`         Notification Service base URL

  `ACTIVITY_SERVICE_URL`             Activity Service base URL

  `REDIS_SERVICE_URL`                Redis Service base URL

  `INTERNAL_SECRET`                  Shared secret for internal service
                                     requests
  ---------------------------------------------------------------------

### Notification Service

  Variable            Purpose
  ------------------- ------------------------------------------
  `PORT`              Service port; defaults to `5003`
  `INTERNAL_SECRET`   Protects internal notification endpoints
  `BREVO_API_KEY`     Brevo API key
  `OWNER_EMAIL`       Sender email configured in Brevo

### Activity Service

  Variable              Purpose
  --------------------- ----------------------------------
  `PORT`                Service port; defaults to `5004`
  `MONGO_URI`           MongoDB connection string
  `REDIS_SERVICE_URL`   Redis Service base URL

### Chat Service

  ---------------------------------------------------------------------
  Variable                           Purpose
  ---------------------------------- ----------------------------------
  `PORT`                             Service port; defaults to `5005`

  `MONGO_URI`                        MongoDB connection string

  `JWT_SECRET`                       JWT verification secret for HTTP
                                     and Socket.IO authentication

  `REDIS_SERVICE_URL`                Redis Service base URL

  `AUTH_SERVICE_URL`                 Auth Service base URL for fetching
                                     the initiating user's profile

  `FRONTEND_URL`                     Allowed frontend origin for HTTP
                                     and Socket.IO CORS
  ---------------------------------------------------------------------

### Redis Service

  ---------------------------------------------------------------------
  Variable                           Purpose
  ---------------------------------- ----------------------------------
  `PORT`                             Service port; defaults to `5006`

  `VERSION`                          Set to `development` to use
                                     host/port configuration

  `REDIS_HOST`                       Redis hostname in development

  `REDIS_PORT`                       Redis port in development

  `REDIS_PASSWORD`                   Redis password when required by
                                     the configured connection

  `REDIS_URL`                        Redis connection URL used outside
                                     development mode

  `CACHE_TTL`                        Default cache TTL in seconds

  `SESSION_TTL`                      Default session and
                                     token-blacklist TTL in seconds

  `OTP_TTL`                          Default OTP TTL in seconds

  `RATE_LIMIT_TTL`                   Default rate-limit window in
                                     seconds

  `RATE_LIMIT_MAX`                   Default maximum requests per
                                     rate-limit window
  ---------------------------------------------------------------------

## API overview

The following paths are mounted by the services. All URLs below are
relative to the relevant service base URL. The NGINX gateway is not part
of the current production deployment. Protected endpoints require a
bearer token unless otherwise noted.

### Auth Service

Base path: `/api/auth`

  -----------------------------------------------------------------------
  Method             Path                            Purpose
  ------------------ ------------------------------- --------------------
  `POST`             `/register`                     Register an account

  `POST`             `/login`                        Log in

  `POST`             `/logout`                       Log out and
                                                     blacklist the
                                                     current token

  `GET`              `/me`                           Get the
                                                     authenticated user

  `GET`              `/user/:id`                     Get a public user
                                                     profile

  `GET`              `/verify-email/:token`          Verify an email
                                                     address

  `POST`             `/resend-verification`          Resend verification
                                                     email

  `GET`              `/check-verification/:userId`   Check
                                                     email-verification
                                                     status

  `POST`             `/forgot-password`              Request a
                                                     password-reset link

  `POST`             `/reset-password/:token`        Reset a password

  `PATCH`            `/recently-viewed`              Add a recently
                                                     viewed listing

  `GET`              `/recently-viewed`              Get recently viewed
                                                     listing IDs
  -----------------------------------------------------------------------

Settings are mounted at `/api/auth/settings`:

-   `GET /` --- read settings
-   `PATCH /profile` --- update profile
-   `PATCH /notifications` --- update notification preferences
-   `PATCH /preferences` --- update property preferences
-   `PATCH /password` --- change password
-   `DELETE /account` --- delete/deactivate account data

Google OAuth routes are mounted under `/auth/social`:

-   `GET /google`
-   `GET /google/callback`

### Property Service

Base paths: `/api/property`, `/api/saved`, `/api/actions`,
`/api/promote`, `/api/share`

  ---------------------------------------------------------------------------------
  Method       Path                                              Purpose
  ------------ ------------------------------------------------- ------------------
  `POST`       `/api/property/upload-photos`                     Upload listing
                                                                 photos

  `POST`       `/api/property/`                                  Create a listing

  `GET`        `/api/property/filter`                            Search and filter
                                                                 listings

  `GET`        `/api/property/recommended`                       Get
                                                                 preference-based
                                                                 recommendations

  `GET`        `/api/property/search-notlogged`                  Get guest
                                                                 recommendations

  `GET`        `/api/property/similar`                           Get similar
                                                                 listings

  `GET`        `/api/property/my`                                Get the owner's
                                                                 listings

  `GET`        `/api/property/details/:id`                       Get listing
                                                                 details

  `PUT`        `/api/property/:id`                               Update a listing

  `DELETE`     `/api/property/:id`                               Delete a listing

  `POST`       `/api/property/interactions`                      Record a user
                                                                 interaction

  `GET`        `/api/property/evaluations/:propertyId/history`   Get AI evaluation
                                                                 history

  `POST`       `/api/property/evaluations/:propertyId`           Request an AI
                                                                 evaluation for an
                                                                 existing listing

  `POST`       `/api/saved/:propertyId`                          Toggle a saved
                                                                 property

  `GET`        `/api/saved/ids`                                  Get saved listing
                                                                 IDs

  `GET`        `/api/saved/properties`                           Get saved property
                                                                 details

  `PATCH`      `/api/actions/:id/hide`                           Toggle listing
                                                                 visibility

  `PATCH`      `/api/actions/:id/refresh`                        Refresh a listing

  `PATCH`      `/api/actions/:id/status`                         Update listing
                                                                 status

  `GET`        `/api/actions/dashboard/owner`                    Get owner
                                                                 dashboard data

  `POST`       `/api/promote/listings/promote/activate`          Internal promotion
                                                                 activation

  `POST`       `/api/share/create-link`                          Create a share
                                                                 link

  `GET`        `/api/share/open/:token`                          Track and open a
                                                                 share link
  ---------------------------------------------------------------------------------

### Payment Service

Base paths: `/api/payment` and `/api/payments`

  -------------------------------------------------------------------------
  Method           Path                                 Purpose
  ---------------- ------------------------------------ -------------------
  `POST`           `/api/payment/create-order`          Create
                                                        contact-unlock
                                                        order

  `POST`           `/api/payment/verify-payment`        Verify
                                                        contact-unlock
                                                        payment

  `GET`            `/api/payment/check-access`          Check contact
                                                        access for a
                                                        listing

  `POST`           `/api/payment/promote/order`         Create
                                                        listing-promotion
                                                        order

  `POST`           `/api/payment/promote/verify`        Verify
                                                        listing-promotion
                                                        payment

  `GET`            `/api/payments/history/contacts`     Get contact-payment
                                                        history

  `GET`            `/api/payments/history/promotions`   Get
                                                        promotion-payment
                                                        history

  `GET`            `/api/payments/history/summary`      Get payment summary
  -------------------------------------------------------------------------

### Activity Service

Base path: `/api/activities`

  Method   Path                        Purpose
  -------- --------------------------- -------------------------------
  `POST`   `/api/activities/`          Create an activity record
  `GET`    `/api/activities/:userId`   Get a user's activity records

### Chat Service

The Chat Service uses root-level HTTP paths rather than an `/api`
prefix.

  ----------------------------------------------------------------------
  Method             Path                             Purpose
  ------------------ -------------------------------- ------------------
  `POST`             `/conversations/start`           Start or reuse a
                                                      property
                                                      conversation

  `GET`              `/conversations`                 List conversations
                                                      for the current
                                                      user

  `GET`              `/conversations/:slug`           Get a conversation

  `PATCH`            `/conversations/archive/:slug`   Archive a
                                                      conversation

  `POST`             `/messages/send`                 Send a message

  `GET`              `/messages/:slug`                Retrieve
                                                      conversation
                                                      messages

  `PATCH`            `/messages/read`                 Mark received
                                                      messages as read

  `GET`              `/health`                        Chat Service
                                                      health endpoint

  Socket.IO          `/socket.io/`                    Real-time chat
                                                      connection
  ----------------------------------------------------------------------

### Notification and Redis Services

These are internal service APIs and should not be exposed as public
application APIs.

Notification Service base path: `/api/notify`

-   `POST /payment-success`
-   `POST /contact-revealed`
-   `POST /owner-contact-revealed`
-   `POST /promote-success`

Redis Service base path: `/api/redis`

-   `/cache`
-   `/session`
-   `/token/blacklist`
-   `/otp`
-   `/rate-limit`
-   `/queue`
-   `/pubsub/publish`

The Redis Service route definitions specify the supported HTTP methods
and parameters for each operation.

## Deployment

### Frontend

The client contains a Vercel SPA rewrite configuration that sends
application routes to `index.html`. Configure the `VITE_*` variables in
the frontend hosting environment.

### Backend

The backend services have individual Dockerfiles and are deployed as
separate Render services. The frontend is deployed separately on Vercel.
The current production architecture does not use an NGINX gateway: the
client communicates with the configured backend service URLs directly.

An NGINX configuration and `Dockerfile.nginx` are present in the
repository for a future reverse-proxy setup, but this work is not
currently deployed to production.

The GitHub Actions workflow runs on pushes to `main`. It uses path
filters to detect changes in the Auth, Property, Payment, Notification,
Activity, and Chat service directories, then triggers the corresponding
Render deploy hook using repository secrets:

-   `RENDER_DEPLOY_HOOK_AUTH`
-   `RENDER_DEPLOY_HOOK_PROPERTY`
-   `RENDER_DEPLOY_HOOK_PAYMENT`
-   `RENDER_DEPLOY_HOOK_NOTIFICATION`
-   `RENDER_DEPLOY_HOOK_ACTIVITY`
-   `RENDER_DEPLOY_HOOK_CHAT`

The workflow does not currently define a deploy job for the Redis
Service or the frontend.

## Implementation notes

-   **Email delivery is synchronous, not queue-backed.** The Payment
    Service calls the Notification Service during payment verification,
    and the Notification Service waits for the Brevo API request. The
    current implementation has no durable job queue, retry worker, or
    outbox for email delivery. If the Notification Service is
    unavailable or the request fails, the notification helper logs the
    failure; it does not persist the email for later delivery.
-   **Redis queue primitives exist, but there is no notification worker
    wired into the current flow.** The Redis Service exposes
    enqueue/dequeue operations and contains a blocking dequeue helper,
    but the email controllers do not use them.
-   **The Property Intelligence engine is external.** This repository
    contains the HTTP integration and frontend review experience, not
    the evaluation engine itself.
-   **The chatbot directory is a placeholder.** Its tracked content
    points to a separate chatbot repository; it is not a runnable
    chatbot implementation in this codebase.
-   **The deployment workflow is selective.** It deploys six backend
    services when their directories change. Redis Service and the
    frontend are not included in that workflow.
-   **NGINX is planned, not currently deployed.** The repository
    contains gateway configuration from a separate development branch;
    it is not part of the live production request flow.
-   **Local Compose does not start the frontend or NGINX.** Start the
    Vite client separately; the NGINX gateway remains future work.
-   **Atlas Search is required for text/city search.** A regular MongoDB
    index alone does not replace the Atlas Search index referenced by
    the aggregation.
-   **Automated backend tests are not configured.** The package scripts
    currently contain placeholder test commands rather than executable
    test suites.

## License

No project license file was identified in the repository tree. Contact
the repository owner before reusing or redistributing the code.

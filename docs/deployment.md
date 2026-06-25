# RentSmart — Deployment Architecture

---

## Environments

| Environment | Frontend | Backend | Database |
|---|---|---|---|
| **Production** | Vercel | Render (free tier, 512MB RAM) | MongoDB Atlas |
| **Local Dev** | Vite dev server | Docker Compose | Community mongo image |

> ⚠️ **Issue PERF-01:** Production uses MongoDB Atlas (required for `$search`), but Docker Compose provisions a vanilla `mongo` image that does not support Atlas Search. The flagship search feature is non-functional in the local Docker environment. See the fix section at the bottom.

---

## Docker Setup

### Container Architecture

`docker-compose.yml` defines **9 containers**:

| Container | Image | Port |
|---|---|---|
| `auth-service` | Built from `./services/auth-service/Dockerfile` | 5000 |
| `property-service` | Built from `./services/property-service/Dockerfile` | 5001 |
| `payment-service` | Built from `./services/payment-service/Dockerfile` | 5002 |
| `notification-service` | Built from `./services/notification-service/Dockerfile` | 5003 |
| `activity-service` | Built from `./services/activity-service/Dockerfile` | 5004 |
| `chat-service` | Built from `./services/chat-service/Dockerfile` | 5005 |
| `redis-service` | Built from `./services/redis-service/Dockerfile` | 5006 |
| `mongo` | `mongo` (community) | 27017 |
| `redis` | `redis:latest` | 6379 |

### Volumes

```yaml
volumes:
  mongo-data:   # MongoDB persistence across restarts
  redis-data:   # Redis persistence across restarts
```

### Networks

Default Docker Compose bridge network. Services reach each other by container name:
- `http://mongo:27017`
- `http://redis:6379`
- `http://redis-service:5006`

### Dockerfile Pattern (per service)

All seven Dockerfiles follow the same structure:

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE <PORT>
CMD ["node", "app.js"]
```

> ⚠️ Known gaps: full `node:18` base (not slim), `npm install` not `npm ci`, no multi-stage build, no `HEALTHCHECK`.

---

## Running Locally

### Prerequisites

- Docker & Docker Compose installed
- MongoDB Atlas cluster (required for search functionality)
- `.env` file per service (see Environment Variables below)

### Start All Services

```bash
# Clone the repo
git clone <repo-url>
cd rentsmart_v2

# Copy env templates and fill in values
cp services/auth-service/.env.example services/auth-service/.env
# ... repeat for each service

# Start everything
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop
docker-compose down

# Stop and remove volumes (full reset)
docker-compose down -v
```

### Frontend Development

```bash
cd client
npm install
npm run dev
# Available at http://localhost:5173
```

---

## Environment Variables

### auth-service

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/auth-db
JWT_SECRET=your_shared_jwt_secret
INTERNAL_SECRET=your_shared_internal_secret
REDIS_SERVICE_URL=http://redis-service:5006
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/social/google/callback
SESSION_SECRET=your_session_secret
```

### property-service

```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/property-db
JWT_SECRET=your_shared_jwt_secret
INTERNAL_SECRET=your_shared_internal_secret
REDIS_SERVICE_URL=http://redis-service:5006
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
AUTH_SERVICE_URL=http://auth-service:5000
```

### payment-service

```env
PORT=5002
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/payment-db
JWT_SECRET=your_shared_jwt_secret
INTERNAL_SECRET=your_shared_internal_secret
REDIS_SERVICE_URL=http://redis-service:5006
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NOTIFICATION_SERVICE_URL=http://notification-service:5003
PROPERTY_SERVICE_URL=http://property-service:5001
ACTIVITY_SERVICE_URL=http://activity-service:5004
```

### notification-service

```env
PORT=5003
INTERNAL_SECRET=your_shared_internal_secret
BREVO_API_KEY=your_brevo_api_key
FROM_EMAIL=noreply@rentsmart.in
```

### activity-service

```env
PORT=5004
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/activity-db
REDIS_SERVICE_URL=http://redis-service:5006
```

### chat-service

```env
PORT=5005
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/chat-db
JWT_SECRET=your_shared_jwt_secret
```

### redis-service

```env
PORT=5006
REDIS_URL=redis://redis:6379
```

### Frontend (`client/.env`)

```env
VITE_AUTH_API=http://localhost:5000
VITE_PROPERTY_API=http://localhost:5001
VITE_PAYMENT_API=http://localhost:5002
VITE_CHAT_API=http://localhost:5005
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

> ⚠️ `VITE_RAZORPAY_KEY_ID` is not documented in the README but is required for the Checkout widget to work.

---

## Production Deployment

### Frontend — Vercel

`vercel.json` contains a single SPA rewrite rule:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Deploy via Vercel CLI or GitHub integration. Set all `VITE_*` environment variables in the Vercel project settings.

### Backend — Render

Each service is deployed as a separate Render web service. The included k6 load test targets Render's free tier (512MB RAM).

**Per-service Render config:**
- Build command: `npm install`
- Start command: `node app.js`
- Environment: add all env vars from the table above

### MongoDB Atlas Setup

1. Create a cluster on [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create one database per service: `auth-db`, `property-db`, `payment-db`, `activity-db`, `chat-db`
3. **Required for search:** Create an Atlas Search index on the `listings` collection:
   - Index fields: `title` (text), `description` (text), `address.city` (text)
4. Whitelist your Render service IP addresses

---

## Load Test Results (k6, Render Free Tier)

Test parameters: 500 virtual users, ~13 minutes ramp-up

| Metric | Value |
|---|---|
| Total requests | 20,235 |
| Success rate | 99.02% |
| Average response time | 7.96s |
| P50 (median) | 3.88s |
| P95 | ~13.8s |
| P99 | ~15.0s |
| Requests > 5s | ~52% |

The service did not crash under sustained load, but latency is well above production UX targets. Root cause: 512MB free-tier instance + un-cached search queries.

**Recommended fixes:**
1. Cache search results per normalized query signature in redis-service
2. Upgrade to a paid Render instance or migrate to a container orchestrator
3. Enable `rankScore` pre-computation to reduce per-request aggregation cost

---

## Known Deployment Issues & Fixes

| Issue | Description | Fix |
|---|---|---|
| PERF-01 | Atlas `$search` not available in local Docker `mongo` image | Use Atlas URI even locally, or add `$text` fallback for self-hosted |
| REL-01 | No Razorpay webhook — payments can be lost on client disconnect | Add `payment.captured` webhook endpoint |
| Docker startup race | `depends_on: service_started` doesn't wait for DB to be ready | Add `HEALTHCHECK` to mongo/redis and use `condition: service_healthy` |
| Image size | Full `node:18` image, no multi-stage build | Switch to `node:18-alpine` + multi-stage |

---

## CI/CD

> ⚠️ No CI/CD pipeline exists in the repository. Deployment is currently manual (push-to-deploy via Render's Git hook for backend, Vercel auto-deploy for frontend).

**Recommended pipeline (GitHub Actions):**

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm test   # once tests are added
  deploy-frontend:
    needs: test
    uses: vercel deploy
  deploy-backend:
    needs: test
    uses: render deploy hook per service
```

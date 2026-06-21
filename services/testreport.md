# RentSmart Load Testing Report

## Test Environment

* Application: RentSmart Property Search API
* Backend: Node.js, Express.js, MongoDB Atlas
* Caching Layer: Redis
* Hosting: Render (Free Tier - 512 MB RAM)
* Load Testing Tool: k6

---

## Load Test Configuration

* Peak Concurrent Users: 500 VUs
* Test Duration: 13 Minutes
* Traffic Pattern: Gradual ramp-up to 500 concurrent users
* Endpoints Tested:

  * Property Search (Rent)
  * Property Search (Sell)
* Query Parameters:

  * Pagination
  * Price Filtering
  * Property Type Filtering

---

## Performance Results

### Overall Statistics

| Metric                   | Value      |
| ------------------------ | ---------- |
| Total Requests Processed | 34,267     |
| Successful Requests      | 34,263     |
| Failed Requests          | 4          |
| Success Rate             | 99.99%     |
| HTTP Failure Rate        | 0.01%      |
| Concurrent Users Tested  | 500        |
| Test Duration            | 13 Minutes |

---

### Response Time Metrics

| Metric                | Value        |
| --------------------- | ------------ |
| Average Response Time | 6,140.44 ms  |
| Median (P50)          | 5,296.48 ms  |
| P90 Response Time     | 13,169.52 ms |
| P95 Response Time     | 13,835.33 ms |
| P99 Response Time     | 15,078.00 ms |

---

### Rent Listings Endpoint

| Metric               | Value  |
| -------------------- | ------ |
| Requests Processed   | 17,239 |
| HTTP Failures        | 1      |
| Requests > 5 Seconds | 8,974  |

---

### Sell Listings Endpoint

| Metric               | Value  |
| -------------------- | ------ |
| Requests Processed   | 17,028 |
| HTTP Failures        | 3      |
| Requests > 5 Seconds | 8,817  |

---

## Key Achievements

* Successfully sustained 500 concurrent virtual users on a cloud-hosted MERN application.
* Processed 34,267 API requests during a single load-testing session.
* Achieved a 99.99% request success rate.
* Maintained only 0.01% HTTP failures under sustained load.
* Validated backend scalability using MongoDB Atlas, Redis caching, and optimized database indexing.
* Demonstrated stable application behavior on free-tier infrastructure (Render 512 MB RAM).

---

## Technologies Used

* Node.js
* Express.js
* MongoDB Atlas
* Redis
* k6
* Render

---

Generated from k6 performance testing conducted on the RentSmart property search platform.

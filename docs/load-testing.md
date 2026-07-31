# RentSmart v2 - Load Testing Report

**Project:** RentSmart v2 - Microservices-Based Real Estate Marketplace  
**Test Tool:** k6  
**Date:** July 2026  
**Environment:** Railway Free Tier

---

# Objective

The objective of this test was to evaluate the scalability, stability, and reliability of the **Property Service** under concurrent user traffic.

The benchmark targets the public property filtering endpoint used by anonymous users while searching for rental and sale properties.

---

# Test Configuration

| Parameter | Value |
|-----------|-------|
| Tool | k6 |
| Deployment | Railway Free Tier |
| Maximum Concurrent Users | **500 VUs** |
| Test Duration | **7 Minutes** |
| Endpoint | `/api/property/filter` |
| HTTP Method | GET |

---

# Endpoint Tested

```http
GET /api/property/filter
```

Example Request

```text
https://https://propservice-production.up.railway.app/api/property/filter
?type=rent
&minPrice=50000
&maxPrice=500000
&page=5
&limit=20
```

Each request randomly generated:

- Property Type (Rent / Sell)
- Minimum Price
- Maximum Price
- Page Number

This prevents repeated identical queries and better simulates real-world user behavior.

---

# Load Profile

```javascript
stages: [
  { duration: "1m", target: 100 },
  { duration: "1m", target: 250 },
  { duration: "1m", target: 500 },
  { duration: "3m", target: 500 },
  { duration: "1m", target: 0 },
]
```

---

# Test Results

## Overall Summary

| Metric | Result |
|---------|--------|
| Total Requests | **41,556** |
| Successful Requests | **41,403** |
| Failed Requests | **153** |
| Success Rate | **99.63%** |
| Failure Rate | **0.36%** |
| Maximum Concurrent Users | **500** |
| Test Duration | **7 Minutes** |

---

## Response Time

| Metric | Value |
|---------|------:|
| Average | **2.40 s** |
| Median (P50) | **1.93 s** |
| Minimum | **939 ms** |
| Maximum | **30.0 s** |
| P90 | **3.46 s** |
| P95 | **5.16 s** |
| P99 | **12.56 s** |

---

## Throughput

| Metric | Value |
|---------|------:|
| HTTP Requests | **41,556** |
| Average Requests/sec | **93.82 req/s** |
| Iterations | **41,556** |

---

## Network Statistics

| Metric | Value |
|---------|------:|
| Data Received | **472 MB** |
| Data Sent | **7.1 MB** |

---

# Observations

- Successfully sustained **500 concurrent virtual users**.
- Processed over **41,000 property search requests** during the benchmark.
- Achieved an overall **99.63% HTTP success rate**.
- HTTP request failures remained below **0.4%**.
- Maintained service availability throughout the complete stress test.
- No application crashes or manual intervention occurred during execution.

---

# Performance Analysis

The Property Service demonstrated strong stability while handling sustained concurrent traffic on Railway Free Tier.

Key observations:

- **Median response time of 1.93 seconds** indicates responsive performance for the majority of user requests.
- **Average response time of 2.40 seconds** remained significantly lower than previous infrastructure benchmarks.
- **P90 latency of 3.46 seconds** shows that 90% of requests completed within a few seconds even under heavy load.
- **P95 latency of 5.16 seconds** indicates limited request queuing during peak concurrency.
- **P99 latency of 12.56 seconds** reflects only a small percentage of slow requests under maximum load.
- The service maintained a **99.63% success rate**, demonstrating high reliability throughout the benchmark.
- Average throughput reached **93.82 requests per second**, showing the service can efficiently process concurrent search traffic.

---

# Infrastructure Notes

Current deployment architecture:

- Frontend: **Vercel**
- Property Service: **Railway**
- Database: **MongoDB Atlas**
- Cache: **Redis**
- Architecture: **Microservices**

The benchmark was executed against the production deployment using realistic randomized search queries to simulate actual application usage.

---

# Comparison with Previous Deployment

| Metric | Railway | Previous Render |
|---------|---------:|---------------:|
| Average Response | **2.40 s** | 7.96 s |
| Median | **1.93 s** | 3.87 s |
| P90 | **3.46 s** | 20.13 s |
| P95 | **5.16 s** | 20.90 s |
| P99 | **12.56 s** | 22.83 s |
| Success Rate | **99.63%** | 99.02% |
| Failure Rate | **0.36%** | 0.97% |
| Requests/sec | **93.82** | 32.87 |

### Improvement Summary

Compared with the previous Render deployment:

- Average response time improved by approximately **70%**.
- Throughput increased by approximately **2.9×**.
- P95 latency reduced from **20.90 s** to **5.16 s**.
- Failure rate decreased from **0.97%** to **0.36%**.
- Tail latency (P90–P99) improved substantially, resulting in more consistent response times under peak concurrent load.

---

# Conclusion

The Railway deployment demonstrates a significant improvement in both latency and throughput compared to the previous deployment while maintaining excellent reliability.

The Property Service successfully sustained **500 concurrent virtual users**, processed over **41,000 requests**, and maintained a **99.63% success rate** without application crashes or manual intervention.

These results validate the scalability of the application's microservices architecture and indicate that the Property Service is capable of supporting high concurrent search traffic with consistent performance on free-tier infrastructure.

---

*Report generated for RentSmart v2 - July 2026*
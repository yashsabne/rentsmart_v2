# Railway vs Render Performance Comparison

---

## Test Configuration

Both deployments were benchmarked using:

- k6
- 500 Concurrent Virtual Users
- Random property search queries
- MongoDB Atlas
- Redis Cache
- Same Property Service

---

## Benchmark Results

| Metric | Railway | Render |
|---------|---------:|--------:|
| Requests | 41,556 | 20,235 |
| Success Rate | **99.63%** | 99.02% |
| Failure Rate | **0.36%** | 0.97% |
| Average Response | **2.40 s** | 7.96 s |
| Median | **1.93 s** | 3.87 s |
| P90 | **3.46 s** | 20.13 s |
| P95 | **5.16 s** | 20.90 s |
| P99 | **12.56 s** | 22.83 s |
| Requests/sec | **93.82** | 32.87 |

---

## Observations

Compared to the previous Render deployment:

- Average response time reduced by approximately **70%**
- Throughput increased by approximately **2.9×**
- P95 latency reduced by approximately **75%**
- Failure rate reduced from **0.97%** to **0.36%**
- Improved consistency under sustained concurrent traffic

---

## Conclusion

Migrating the Property Service from Render Free Tier to Railway significantly improved throughput, reduced request latency, and lowered the failure rate while sustaining 500 concurrent virtual users.

The benchmark demonstrates that the application's architecture scales effectively when deployed on infrastructure with improved runtime performance.
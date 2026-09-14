# Performance Harness

Reproducible measurements for the resume "performance" bullet. **Nothing here is
pre-filled with results** — run the tools yourself and record the real numbers in
the tables below. Interviewers ask how you got them, so measure, don't guess.

---

## 1. API load test (k6)

Measures catalog API latency and error rate under concurrent load.

```bash
# Backend must be running (docker compose up -d)
k6 run perf/k6-catalog.js

# Override target / credentials
k6 run -e BASE_URL=http://localhost:8080 -e EMAIL=you@example.com -e PASSWORD=secret perf/k6-catalog.js
```

Read `http_req_duration` (avg / p95 / max) and `http_req_failed` from the summary.
The script gates p95 < 400 ms and error rate < 1%; adjust the threshold to whatever
you actually want to hold the line at.

| Scenario | VUs | Requests | p95 latency | error rate | Date |
|----------|-----|----------|-------------|------------|------|
| Catalog GET (baseline) |  |  |  |  |  |
| Catalog GET (after tuning) |  |  |  |  |  |

> If you add caching or fix an N+1, capture a before/after row so the bullet reads
> "reduced p95 from \_\_ ms to \_\_ ms".

---

## 2. Frontend Lighthouse

Run against a production build (not `next dev`, which is slower and unoptimized):

```bash
cd frontend
pnpm build && pnpm start   # serves on http://localhost:3000
# In another shell:
npx lighthouse http://localhost:3000/login --output html --output-path ./lighthouse-login.html --view
npx lighthouse http://localhost:3000/dashboard/books --output html --output-path ./lighthouse-books.html
```

(Or use Chrome DevTools → Lighthouse.) Record the category scores:

| Page | Performance | Accessibility | Best Practices | SEO | Date |
|------|-------------|---------------|----------------|-----|------|
| /login |  |  |  |  |  |
| /dashboard/books |  |  |  |  |  |

---

## Notes

- The catalog endpoint requires authentication; the k6 script logs in during `setup()`
  and reuses the access token. The refresh token is an HttpOnly cookie and is not needed here.
- For a fair p95, run k6 from a machine close to the API (localhost is fine for a baseline;
  note the environment in the table).

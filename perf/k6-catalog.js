// k6 load test for the book catalog API.
//
// Measures latency and error rate for GET /api/v1/books under sustained
// concurrent load. The p95 threshold below is a PASS/FAIL gate, not a claimed
// result — run this yourself and record the real numbers in perf/README.md.
//
// Run (backend must be up, e.g. `docker compose up -d`):
//   k6 run perf/k6-catalog.js
//   k6 run -e BASE_URL=http://localhost:8080 -e EMAIL=... -e PASSWORD=... perf/k6-catalog.js
//
// Install k6: https://k6.io/docs/get-started/installation/

import http from "k6/http"
import { check, sleep } from "k6"

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080"
const EMAIL = __ENV.EMAIL || "kiro-admin@example.com"
const PASSWORD = __ENV.PASSWORD || "Passw0rd!23"

export const options = {
  scenarios: {
    catalog_browsing: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 20 }, // ramp up to 20 virtual users
        { duration: "1m", target: 20 },  // hold
        { duration: "10s", target: 0 },  // ramp down
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"], // <1% errors
    "http_req_duration{endpoint:catalog}": ["p(95)<400"], // gate: p95 under 400ms
  },
}

// Log in once per VU init and reuse the access token.
export function setup() {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { "Content-Type": "application/json" } }
  )
  check(res, { "login succeeded": (r) => r.status === 200 })
  return { token: res.json("data.token") }
}

export default function (data) {
  const res = http.get(`${BASE_URL}/api/v1/books`, {
    headers: { Authorization: `Bearer ${data.token}` },
    tags: { endpoint: "catalog" },
  })
  check(res, { "catalog 200": (r) => r.status === 200 })
  sleep(1)
}

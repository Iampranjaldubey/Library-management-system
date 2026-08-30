# Resume Bullets — LibraryOS

Copy-ready bullets. Numbers in **\_\_** need a real measurement first (see
`perf/README.md`); everything else is backed by code/tests in this repo. Only use a
bullet you can defend for ten minutes — talking points are under each.

---

### Concurrency (the strongest one)
> Eliminated a book over-issue race in the circulation service by introducing JPA
> optimistic locking (`@Version`) with bounded retry, verified by a multi-threaded
> test firing **12** concurrent requests at a single-copy book (10/12 succeeded
> before the fix, exactly 1 after).

**Talking points:** the read-check-decrement-write race; why optimistic over
pessimistic locking (low contention, no held row locks, no deadlock risk); why the
retry runs in a `REQUIRES_NEW` transaction (open-session-in-view would otherwise
hand back the stale first-level-cached entity); the atomic conditional-`UPDATE`
alternative and when you'd switch to it.

### Authentication
> Built stateless JWT auth on Spring Security 6 across 3 roles, with refresh-token
> rotation and reuse detection, delivering the refresh token in an HttpOnly
> SameSite cookie (via a same-origin Next.js proxy) instead of localStorage.

**Talking points:** access token (bearer, 15 min) vs refresh token (HttpOnly
cookie, rotated); reuse detection revoking the whole token family; why localStorage
is XSS-readable and the cookie isn't; the same-origin proxy that keeps the cookie
first-party; the 401-vs-403 fix for authenticated-but-unauthorized requests.

### Testing & CI
> Reached ~66% backend coverage (JaCoCo-gated in CI) with JUnit 5 + Mockito and
> Testcontainers integration tests that run real Flyway migrations against MySQL
> under `ddl-auto=validate`; wired GitHub Actions to build/test backend + frontend
> and build the Docker image on every push.

**Talking points:** why Testcontainers over H2 (H2 never exercises the migrations
or MySQL semantics); the migration-vs-entity validation test; `disabledWithoutDocker`
so the suite still runs locally without Docker; Vitest + RTL on the frontend.

### Full-stack / DX
> Containerized the stack (multi-stage Dockerfile + Compose) for one-command local
> setup, and added silent access-token refresh with graceful session-expiry UX in
> the Next.js client.

**Talking points:** `docker compose up --build` = MySQL + API with healthcheck;
Flyway over `ddl-auto=update`; the silent-refresh flow and its loop protection.

### Signature feature
> Added on-demand PDF circulation receipts (OpenPDF) downloadable from the
> transactions UI as a streamed blob.

---

### Numbers to capture before using these
- Catalog API p95 latency (baseline, and after any caching/N+1 fix) — `k6 run perf/k6-catalog.js`
- Lighthouse Performance score on the deployed frontend
- CI + deploy time (from a GitHub Actions run)

### One-line project title for the resume header
> **LibraryOS** — full-stack library platform with concurrency-safe circulation,
> rotating-refresh JWT auth, and MySQL-backed CI (Spring Boot 3 · Next.js 16).

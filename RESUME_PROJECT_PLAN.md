# LibraryOS — Resume Project Plan (Full-Stack)

**Goal:** turn a generic-sounding CRUD app into a project that survives a recruiter scan *and* a technical interview.

- **Target role:** Full-stack (Java/Spring Boot + Next.js/React/TypeScript)
- **Timeline:** ~4–5 weeks part-time
- **Status date:** 2026-08-29

---

## Guiding Principles

1. **Depth beats breadth.** One race-condition bug you found, reproduced, and fixed is worth more than ten CRUD features.
2. **Every resume line is bait.** Only write a bullet you *want* to be asked about, and can defend for 10 minutes.
3. **Measure, never fake.** Real, modest numbers beat impressive fabricated ones. Interviewers ask how you got them.
4. **Skip the SaaS scope.** Multi-tenancy, billing, MARC, OPAC — wrong signal, infinite time sink. Keep `ROADMAP.md` only as a "future vision" answer.

### The three filters your resume must pass

| Filter | Time | Wants |
|--------|------|-------|
| ATS / keyword scan | instant | Right nouns: Spring Boot, JWT, REST, MySQL, Docker, CI/CD, testing, Next.js, TypeScript |
| Recruiter | 6–30 sec | Live demo link, clean GitHub, bullets with numbers |
| Engineer in the loop | deep | Proof you understand what you built and can defend decisions |

---

## Milestone 0 — Table Stakes (Week 1)

**Goal:** it builds, runs anywhere, and looks credible. Absence of these gets you filtered out.

- [ ] Fix compile break: add `@Value` import in `AuthServiceImpl` (`org.springframework.beans.factory.annotation.Value`)
- [ ] Implement `PUT /api/v1/books/{id}` and `DELETE /api/v1/books/{id}` (frontend already calls them; controller + service are missing)
- [ ] Move DB password + JWT secret out of `application.properties` into env vars; rotate the committed secret
- [ ] Add Maven wrapper (`mvnw`) so it builds without a local Maven install
- [ ] Add a multi-stage `Dockerfile` (backend) + `docker-compose.yml` (backend + MySQL) for one-command local run
- [ ] Fix `Procfile` jar name mismatch (`library-management-1.0.0.jar`) or set `<finalName>` in the pom
- [ ] Unify frontend storage keys (`auth-context.tsx` uses literal `"token"`/`"user"`; `lib/api.ts` uses `getStorageKey()`)

**Exit criteria:** a stranger can `git clone` → `docker-compose up` → hit the app. Backend compiles and boots clean.

**Payoff:** "runs on any machine in one command" is the baseline signal that you ship real software.

---

## Milestone 1 — Backend Signature: Concurrency (Week 2)

**Goal:** your strongest interview story. A real bug, reproduced and fixed.

### The bug (already in your code)

`TransactionServiceImpl.issueBook()` does read → check → decrement → write with no locking. Two concurrent issues of the last copy both pass the availability check and both create a loan → over-issue.

- [ ] Write a failing multi-threaded test: `ExecutorService` + `CountDownLatch` fire N concurrent `issueBook` calls on a 1-copy book; assert exactly 1 succeeds
- [ ] Fix with **optimistic locking**: add `@Version` to `Book`, catch `OptimisticLockException`, retry with bounded backoff
- [ ] Document the alternatives you rejected and why: pessimistic lock (`@Lock(PESSIMISTIC_WRITE)` / `SELECT ... FOR UPDATE`) and atomic conditional update (`UPDATE books SET available_copies = available_copies - 1 WHERE id = ? AND available_copies > 0`)
- [ ] Confirm the concurrency test now passes; keep it in the suite as a regression guard
- [ ] Wrap issue/return in a single `@Transactional` unit and verify partial failures roll back

**Exit criteria:** the concurrency test fails on the old code, passes on the new code, and lives in CI.

**Payoff:** covers concurrency, DB transactions, isolation, and engineering tradeoffs — high-frequency interview topics, in one narrative.

---

## Milestone 2 — Testing + CI (Week 2–3)

**Goal:** prove rigor with a number and a green badge.

Right now: 2 test files, and tests run on H2 with `spring.flyway.enabled=false` — so migrations are never tested.

- [ ] Migrate integration tests to **Testcontainers MySQL** with Flyway enabled (tests your real schema)
- [ ] Add a test asserting Flyway migrations + JPA entities agree (`ddl-auto=validate` passes on a fresh DB)
- [ ] Unit tests for `TransactionServiceImpl` fine logic: on-time (null fine), 1 day late, many days late, boundary at due date
- [ ] Add JaCoCo coverage report + a CI gate (target a real 80%+)
- [ ] Frontend: a few component/hook tests with Vitest + React Testing Library (e.g. `use-books`, auth context)
- [ ] **GitHub Actions CI**: build + test backend, lint + type-check + test frontend, build Docker image
- [ ] Add CI + coverage badges to the README

**Exit criteria:** every push runs the full suite in CI; README shows a passing badge and a coverage number.

**Payoff:** "85% coverage, integration tests against real MySQL in CI" is a bullet most student resumes can't claim.

---

## Milestone 3 — Full-Stack Depth (Week 3–4)

**Goal:** show the frontend is engineered, not just styled. Pick the auth-lifecycle story (already mostly built) plus **one** feature.

### 3a. End-to-end auth lifecycle (harden what exists)

- [ ] Document the full flow: login → cookie + storage → `proxy.ts` route gate → silent refresh in `lib/api.ts` → logout
- [ ] Move the refresh token from `localStorage` to an `HttpOnly` `Secure` `SameSite` cookie (localStorage is XSS-readable — be ready to critique your original choice)
- [ ] Add refresh-token rotation with reuse detection on the backend
- [ ] Error boundary + graceful session-expiry UX on the frontend

### 3b. Performance (get real numbers for the resume)

- [ ] Run Lighthouse on the deployed frontend; record the score, then improve it (image formats, code splitting)
- [ ] Verify Suspense/streaming is working via your existing `loading.tsx` files; add skeletons where missing
- [ ] Optional: add Redis caching to the book catalog; measure API p95 before/after with k6 or JMeter

### 3c. Pick ONE signature feature (don't do all three)

- [ ] **CSV bulk import** of books with validation, row-level error reporting, and a progress state (practical, shows file handling + UX)
- [ ] **PDF receipt/report** on issue/return using OpenPDF (already a dependency, currently unused — quick, visible win)
- [ ] **Real-time dashboard** via SSE/WebSocket that updates stats live when a book is issued/returned (shows real-time skills)

**Exit criteria:** the chosen feature works end to end on the live demo, and you can explain every layer it touches.

**Payoff:** demonstrates full-stack range — data flow from a React interaction through the API to the DB and back.

---

## Milestone 4 — Presentation (Week 4–5)

**Goal:** win the 30-second recruiter scan.

- [ ] Rewrite the README top section: one-line pitch, **live demo link first**, demo credentials, architecture diagram, screenshots (you have them), tech stack table, one-command run
- [ ] Add a short "Engineering Highlights" section: the concurrency fix, testing strategy, auth design — with links to the relevant files/PRs
- [ ] Reframe the project name on your resume away from generic "Library Management System" (e.g. "LibraryOS — a full-stack library platform with concurrency-safe circulation and JWT auth")
- [ ] Clean up commit history / add a few well-written PRs so the GitHub timeline reads like real work
- [ ] Pin the repo on your GitHub profile

**Exit criteria:** someone who spends 30 seconds on the repo knows what it is, sees it's live, and sees it's tested.

---

## Resume Bullets (fill the blanks with real measurements)

- Eliminated a concurrency defect allowing books to be over-issued under load by introducing optimistic locking with retry, verified by a multi-threaded test simulating __ concurrent requests.
- Secured __ REST endpoints with stateless JWT auth (access + refresh-token rotation, BCrypt, role-based access across 3 roles) on Spring Security 6.
- Reached __% line coverage with JUnit 5 + Testcontainers integration tests running against real MySQL in CI.
- Automated build/test/deploy with GitHub Actions + Docker; push-to-deploy in under __ minutes.
- Built a full-stack auth lifecycle with silent token refresh and route gating in Next.js, cutting redundant login redirects to zero.
- [If done] Reduced catalog API p95 latency from __ms to __ms via Redis caching and N+1 query elimination.

---

## Interview Question Bank (be able to answer each cold)

Your resume invites these — rehearse them.

- Why JWT over server-side sessions? What's in your token? What happens on logout?
- Your refresh token was in `localStorage` — what's the risk, and how did you fix it?
- Walk me through the race condition. Why optimistic over pessimistic locking? When would you flip that choice?
- Why Flyway with `ddl-auto=validate` instead of `update`?
- How do you test code that hits a database? Why Testcontainers over H2 or mocks?
- Server Components vs Client Components in your app — where's the boundary and why?
- How does your silent token refresh avoid infinite loops or duplicate requests?
- What's the N+1 problem, and where did it show up here? (You already fixed it with `JOIN FETCH`.)

---

## Explicitly Out of Scope

Do **not** build these for this goal — they cost months and signal the wrong thing:

- Multi-tenancy, subscription billing, back-office console
- MARC/Z39.50/SIP2, OPAC, accreditation reporting
- Anything else in `ROADMAP.md` (keep it only as a "where would you take this next?" answer)

---

## Metrics to Capture (for bullets)

| Metric | Tool | Where it goes |
|--------|------|---------------|
| Test coverage % | JaCoCo | Resume + README badge |
| Concurrent requests handled | Your multi-threaded test / k6 | Concurrency bullet |
| API p95 latency (before/after) | k6 or JMeter | Performance bullet (if done) |
| Lighthouse score | Chrome DevTools | Frontend bullet |
| Deploy time | GitHub Actions run | CI/CD bullet |

---

## Week-by-Week Summary

| Week | Focus | Outcome |
|------|-------|---------|
| 1 | Milestone 0 | Builds + runs anywhere; secrets removed |
| 2 | Milestones 1–2 | Concurrency fix + Testcontainers/CI |
| 3 | Milestones 2–3 | Coverage gate + auth hardening + feature start |
| 4 | Milestone 3–4 | Feature done + performance numbers |
| 5 | Milestone 4 | README, demo, resume bullets, GitHub polish |

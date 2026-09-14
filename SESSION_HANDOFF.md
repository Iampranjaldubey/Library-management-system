# Session Handoff — LibraryOS Resume Project

**Purpose:** portable context so a new chat can continue seamlessly.
**Last updated:** 2026-08-30

---

## 1. Goal

Turn this Library Management System into a **resume-grade, full-stack project** that survives a recruiter scan and a technical interview. Strategy is **depth over breadth**: fix real bugs, add tests/CI, and build one or two defensible "signature" features to talk about in interviews. Full plan lives in `RESUME_PROJECT_PLAN.md`. The longer-term "turn it into a product" vision is in `ROADMAP.md` (kept only as a "where would you take this next?" talking point — NOT the current focus).

Target role: **full-stack** (Java/Spring Boot + Next.js/React/TypeScript).

---

## 2. Current branch & git state

- Working branch: **`resume-prep`** (branched from `main` @ `b10e51b` = `origin/main`).
- **Nothing pushed.** `main` untouched. Working tree clean.

Commits on `resume-prep` (newest last):

- chore(backend): externalize DB, JWT, and mail config to environment variables
- fix(auth): add missing @Value import and make email verification configurable
- fix(backend): flush refresh-token deletes before insert, pin role column type, add H2 test dep
- fix(db): use MySQL-compatible CREATE INDEX syntax in migrations
- test(backend): add auth and book controller tests
- chore(frontend): migrate to pnpm and simplify env-var access
- docs: add product roadmap, resume project plan, and local setup guide
- feat(books): add update (PUT) and delete (DELETE) endpoints
- build: add Maven wrapper and set jar finalName to match Procfile
- test: align test config with app.jwt.* keys and disable email verification
- build: add multi-stage Dockerfile and docker-compose for local stack
- refactor(frontend): use getStorageKey() for auth storage keys
- build: disable email verification in local docker stack
- build: map MySQL to host port 3307 to avoid local 3306 conflict
- build: add restart policy to compose services
- fix(security): return 403 instead of 401 for authenticated-but-unauthorized requests
- docs: add session handoff for continuing in a new chat
- fix(circulation): prevent book over-issue via optimistic locking + regression test
- test(backend): add fine-logic unit tests, Testcontainers MySQL ITs, and JaCoCo gate
- test(frontend): add Vitest + React Testing Library with hook/context/util tests
- ci: add GitHub Actions pipeline (backend verify, frontend build/test, docker image)
- feat(auth): HttpOnly refresh-token cookie with rotation and reuse detection
- feat(frontend): cookie-based auth via same-origin proxy + graceful session expiry
- feat(receipts): downloadable PDF transaction receipts via OpenPDF
- perf: add k6 catalog load test and Lighthouse harness (no fabricated numbers)
- docs: rewrite README (highlights, one-command run, badges) and add resume bullets  <- HEAD

---

## 3. Environment gotchas (READ FIRST)

- **System JDK is 24; project targets Java 17.** Lombok 1.18.36 fails on JDK 24 (`com.sun.tools.javac.code.TypeTag :: UNKNOWN`). A Temurin JDK 17 is at `C:\Users\pranj\maven-tmp\jdk-17.0.20.1+1`. Always build with it:
  - `$env:JAVA_HOME = "$env:USERPROFILE\maven-tmp\jdk-17.0.20.1+1"`
  - `cd backend ; .\mvnw.cmd -B --no-transfer-progress clean test`
- **Maven not on PATH.** Use committed wrapper `backend/mvnw.cmd`. (Standalone Maven also at `C:\Users\pranj\maven-tmp\apache-maven-3.9.9`.)
- **Docker commands are BLOCKED for the agent** by `~/.kiro/workspace-roots/608eba3af19df04d/permissions.yaml` (deny "docker *"), which is a Kiro-protected path the agent cannot edit. **The USER must run all docker commands.**
- `~/maven-tmp` (~300MB) is OUTSIDE the repo; do not commit. `backend/target/` is gitignored.
- PowerShell 5.1: no `&&` (use `;`). java/curl write to stderr so exit code may show 1 even on success — check output.

---

## 4. Completed

### Baseline
- Secrets removed from application.properties (env-var placeholders).
- Fixed compile break (missing @Value import in AuthServiceImpl).
- Email verification configurable (app.auth.require-email-verification, default true).
- MySQL-compatible CREATE INDEX in migrations. NOTE: this changes checksums of already-applied V1-V3 migrations — if prod DB already ran them, next deploy needs `flyway repair` OR move fix to a new forward migration. (Deploy status never confirmed.)

### Milestone 0 — DONE
- Book PUT/DELETE endpoints (delete blocks books with transaction history). Verified live: create->update->delete->404.
- Maven wrapper; pom finalName=library-management (matches Procfile).
- Frontend storage keys unified via getStorageKey().
- Docker: multi-stage backend/Dockerfile + root docker-compose.yml (MySQL 8 + backend, healthcheck, auto-restart). MySQL host port 3307. Email verification off for local stack.
- Fixed test config: application-test.properties used jwt.* but app reads app.jwt.*.

### Security fix — DONE
- 401->403 bug: authenticated USER on role-protected endpoint got 401 (frontend treats as session-expiry -> logout) instead of 403.
- Root cause: default AccessDeniedHandler sendError(403) -> servlet ERROR dispatch to /error -> SS6 re-checks as anonymous -> /error not permitted -> 401.
- Fix: JwtAccessDeniedHandler writes 403 ApiResponse JSON directly; SecurityConfig wires it and permits DispatcherType.ERROR/FORWARD.
- Verified via real-container test SecurityAuthorizationTest (RANDOM_PORT). MockMvc could NOT reproduce.

### Milestone 1 — DONE (concurrency signature)
- Reproduced the over-issue race with a 12-thread test (`TransactionConcurrencyTest`): on the OLD code 10/12 concurrent issues of a 1-copy book succeeded (assert exactly-1 failed with "but was: 10").
- Fix = optimistic locking: `@Version Long version` on `Book` + Flyway `V5__add_book_version_optimistic_lock.sql` (`version BIGINT NOT NULL DEFAULT 0`). Hibernate now emits `UPDATE ... WHERE id=? AND version=?`; the losing writer matches 0 rows and fails instead of over-issuing.
- `issueBook` no longer `@Transactional`; it retries up to `MAX_ISSUE_ATTEMPTS=5` via a `TransactionTemplate` with `PROPAGATION_REQUIRES_NEW` (fresh persistence context per attempt — otherwise OSIV's L1 cache hands back the stale entity and retry spins), with jittered backoff. The atomic decrement + loan insert stay one unit of work.
- Exhausted retries -> `OptimisticLockingFailureException` -> new `GlobalExceptionHandler` mapping to **409**.
- Rejected alternatives documented in `issueBook` javadoc: pessimistic `SELECT ... FOR UPDATE` (`@Lock(PESSIMISTIC_WRITE)`) and atomic conditional `UPDATE books SET available_copies = available_copies - 1 WHERE id=? AND available_copies > 0`.
- Green on the fix; full suite **6 tests pass** on JDK 17.
- The test runs on H2 (Docker is blocked for the agent). `@Version` is enforced at the Hibernate layer so H2 exercises the locking faithfully, but the H2 run does NOT test the V5 migration itself or MySQL row-lock behavior.
- CONFIRMED ON MYSQL (2026-08-30): user ran `docker compose up --build`; backend booted clean (verified over HTTP — `/api-docs` & `/swagger-ui.html` 200, `/api/v1/transactions` 401). Because the app runs Flyway + `ddl-auto=validate`, a clean boot proves V5 applied and the `books.version` column matches the `@Version` mapping on real MySQL.

### Milestone 2 — DONE (testing + CI)
- JaCoCo report + gate (0.30 BUNDLE instruction; **actual ~49%**) via `mvnw verify`. Excludes dto/entity/config/app.
- `TransactionServiceFineTest` — 5 pure-Mockito fine cases (before due=null, on-due boundary=null, 1 day=₹5, 10 days=₹50, double-return rejected).
- `integration/SchemaMigrationValidationMySQLTest` + `integration/TransactionConcurrencyMySQLTest` — Testcontainers MySQL 8, Flyway ON, `ddl-auto=validate`, `@Testcontainers(disabledWithoutDocker=true)` so they SKIP locally (no Docker for agent) and RUN in CI. New `application-mysqltest.properties`.
- Frontend: Vitest + React Testing Library (`vitest.config.ts`, `vitest.setup.ts`, `__tests__/` for dedupeBooks, useBooks, AuthProvider) — 8 tests. Scripts: `pnpm test:run`, `test:coverage`.
- `.github/workflows/ci.yml`: backend `mvnw verify` on Temurin 17 (Testcontainers run here), frontend type-check+Vitest+build on node22/pnpm10, docker image build.
- pom: added spring-boot-testcontainers, testcontainers junit-jupiter+mysql, httpclient5 (all test), jacoco 0.8.11.

### Milestone 3 — DONE (full-stack depth)
- **3a auth hardening (backend):** refresh token now ONLY in an HttpOnly cookie (`RefreshTokenCookieFactory`, secure/sameSite/path via `app.auth.refresh-cookie.*`; test profile secure=false/Lax, prod None/Secure). `/refresh` reads `@CookieValue` and ROTATES (old revoked, new issued); replay of a rotated token = reuse → `revokeAllByUser` → 401. New `/logout` revokes + clears cookie. `RefreshToken` → `@ManyToOne` (retain revoked lineage). `RefreshTokenServiceImpl.rotate` is `@Transactional(noRollbackFor=TokenRefreshException.class)` (else revocation rolls back). `AuthResponse` `@JsonInclude(NON_NULL)`. `AuthRefreshTokenFlowTest` (RANDOM_PORT, 4 tests, needs httpclient5 for POST-401).
- **3a auth (frontend):** same-origin **BFF proxy** — `next.config.mjs` rewrites `/api/:path*` → `${BACKEND_API_URL||NEXT_PUBLIC_API_URL||localhost:8080}`; `config.apiUrl=""`, `lib/auth.ts BASE_URL=""`; all fetch `credentials:"include"`; silent refresh POSTs `/auth/refresh` (cookie, no body) storing only the new access token; `logout()` calls backend; login shows `?expired=1` notice.
- **3c signature feature:** PDF receipts — `ReceiptService`+`Impl` (OpenPDF), `GET /api/v1/transactions/{id}/receipt` (ADMIN/LIBRARIAN, application/pdf), `getTransaction(id)`; frontend `downloadTransactionReceipt` blob + button in transaction detail modal. `ReceiptServiceImplTest`.
- **3b performance:** `perf/k6-catalog.js` (k6 login+catalog load test, p95/error thresholds) + `perf/README.md` (Lighthouse steps, empty result tables). NO fabricated numbers.

### Milestone 4 — DONE (presentation)
- README rewritten: badges (CI, coverage ~49%, Java 17, Spring Boot 3.2, Next 16), Engineering Highlights with links to actual files, one-command `docker compose up --build`, corrected stack (Next 16), updated endpoints/architecture (same-origin proxy), testing section.
- `RESUME_BULLETS.md`: defensible bullets + per-bullet interview talking points; blanks flagged for metrics needing measurement.

### Verified this session (JDK 17)
- Backend `mvnw verify`: **19 tests, 0 failures, 2 skipped** (Testcontainers MySQL skip without Docker), coverage gate met, BUILD SUCCESS.
- Frontend: `pnpm type-check` clean, `pnpm build` (13 routes), `pnpm test:run` **8 pass**.

---

## 5. Run the app (USER runs docker)

- `docker compose up -d`  (or `--build` to pick up code changes)
- `docker compose ps`  (db = healthy, backend = Up)
- API/Swagger: http://localhost:8080/swagger-ui.html
- MySQL host: localhost:3307 (library_user / library_pass / library_db)
- Promote admin: `docker exec -it libraryos-db mysql -ulibrary_user -plibrary_pass library_db -e "UPDATE users SET role='ADMIN' WHERE email='kiro-admin@example.com';"`
- Test admin: kiro-admin@example.com / Passw0rd!23
- Frontend: `cd frontend ; pnpm install ; pnpm dev`  (http://localhost:3000)
- NOTE: running container has pre-fix code until `docker compose up --build`.

---

## 6. Next — user verification & remaining polish

All five milestones (M0–M4) are IMPLEMENTED and committed on `resume-prep` (nothing pushed). What the agent could not do itself — do these to finish:

1. **Run the Testcontainers suite** (needs Docker): `cd backend ; .\mvnw.cmd verify`. Confirms the MySQL migration-validate + concurrency-on-MySQL tests pass (they SKIP without Docker locally, RUN in CI).
2. **Browser E2E of cookie auth** (agent has no browser): `docker compose up --build`, then `cd frontend ; pnpm dev`. Log in → confirm an HttpOnly `refresh_token` cookie is set (DevTools → Application → Cookies), let the 15-min access token lapse → confirm silent refresh rotates the cookie and requests keep working; log out → confirm the cookie is cleared. Local dev works because the browser talks same-origin (Next proxy).
3. **Push + watch CI**: push `resume-prep` and confirm the GitHub Actions run is green (badge in README resolves once on the default branch). Optionally open a PR into `main`.
4. **Capture real perf numbers** (`perf/README.md`): run `k6 run perf/k6-catalog.js` and Lighthouse, fill the tables, then fill the blanks in `RESUME_BULLETS.md`.
5. **Prod cookie env** (only if NOT using the same-origin proxy on Vercel): the refresh cookie defaults to `SameSite=None; Secure` — set `REFRESH_COOKIE_SECURE`/`REFRESH_COOKIE_SAMESITE` on the API and `BACKEND_API_URL` on the frontend as needed. Same-origin proxy (default) is the recommended path.

Optional future depth (not required): raise the JaCoCo gate as coverage grows, add refresh-token cleanup scheduling, more frontend component tests.

---

## 7. Key files

- RESUME_PROJECT_PLAN.md — original plan; RESUME_BULLETS.md — resume bullets + interview talking points
- ROADMAP.md — long-term product vision (not current focus); SESSION_HANDOFF.md — this file
- backend/.../service/impl/TransactionServiceImpl.java — concurrency-safe issueBook (optimistic lock + retry)
- backend/.../service/impl/RefreshTokenServiceImpl.java — rotation + reuse detection; security/RefreshTokenCookieFactory.java — HttpOnly cookie
- backend/.../controller/AuthController.java — login/register/refresh/logout cookie wiring
- backend/.../service/impl/ReceiptServiceImpl.java — OpenPDF receipts; TransactionController receipt endpoint
- backend/.../integration/*MySQLTest.java — Testcontainers ITs; test/.../AuthRefreshTokenFlowTest.java — cookie/rotation/reuse
- frontend/next.config.mjs (same-origin proxy), lib/api.ts + lib/auth.ts + context/auth-context.tsx — cookie auth flow
- .github/workflows/ci.yml — CI; perf/ — k6 + Lighthouse harness; docker-compose.yml / backend/Dockerfile — local stack

---

## 8. Resume in a new chat

All five milestones (M0–M4) are implemented on `resume-prep` (not pushed). See section 6 for the remaining USER verification steps (run Testcontainers via `mvnw verify`, browser-test the cookie auth flow, push + watch CI, capture k6/Lighthouse numbers).

Say: "Continue the LibraryOS resume project on branch resume-prep. Read SESSION_HANDOFF.md; M0–M4 are implemented. Build with JDK 17 at ~/maven-tmp/jdk-17.0.20.1+1; I run docker commands myself." — then point to whichever section-6 item (or new work) you want next.

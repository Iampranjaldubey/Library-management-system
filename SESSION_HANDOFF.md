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
- fix(circulation): prevent book over-issue via optimistic locking + regression test  <- HEAD

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

### Milestone 1 — DONE (concurrency signature) (HEAD)
- Reproduced the over-issue race with a 12-thread test (`TransactionConcurrencyTest`): on the OLD code 10/12 concurrent issues of a 1-copy book succeeded (assert exactly-1 failed with "but was: 10").
- Fix = optimistic locking: `@Version Long version` on `Book` + Flyway `V5__add_book_version_optimistic_lock.sql` (`version BIGINT NOT NULL DEFAULT 0`). Hibernate now emits `UPDATE ... WHERE id=? AND version=?`; the losing writer matches 0 rows and fails instead of over-issuing.
- `issueBook` no longer `@Transactional`; it retries up to `MAX_ISSUE_ATTEMPTS=5` via a `TransactionTemplate` with `PROPAGATION_REQUIRES_NEW` (fresh persistence context per attempt — otherwise OSIV's L1 cache hands back the stale entity and retry spins), with jittered backoff. The atomic decrement + loan insert stay one unit of work.
- Exhausted retries -> `OptimisticLockingFailureException` -> new `GlobalExceptionHandler` mapping to **409**.
- Rejected alternatives documented in `issueBook` javadoc: pessimistic `SELECT ... FOR UPDATE` (`@Lock(PESSIMISTIC_WRITE)`) and atomic conditional `UPDATE books SET available_copies = available_copies - 1 WHERE id=? AND available_copies > 0`.
- Green on the fix; full suite **6 tests pass** on JDK 17.
- CAVEAT: the test runs on H2 (Docker is blocked for the agent). `@Version` is enforced at the Hibernate layer so H2 exercises it faithfully, but this does NOT test the V5 migration itself or MySQL row-lock behavior. Confirm V5 + `ddl-auto=validate` boot cleanly on real MySQL via `docker compose up --build`. M2 ports the test to Testcontainers MySQL for the definitive proof.

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

## 6. Next — Milestone 2 (testing + CI)

M1 (concurrency) is done (see section 4). Next is proving rigor with a number and a green badge.

Plan:
1. Testcontainers MySQL with Flyway ENABLED for integration tests (tests the real schema + migrations, unlike the current H2 profile). First target: port `TransactionConcurrencyTest` to MySQL and add a test asserting `ddl-auto=validate` passes on a fresh migrated DB (this is what proves V5 + `@Version` are correct on MySQL — the H2 run can't).
2. Unit tests for `TransactionServiceImpl` fine logic: on-time (null fine), 1 day late, many days late, boundary at due date.
3. JaCoCo coverage report + CI gate (aim for a real 80%+).
4. GitHub Actions CI: build + test backend (pin JDK 17 — system JDK is 24 and Lombok 1.18.36 breaks on it), lint/type-check/test frontend, build Docker image. Add CI + coverage badges to README.

NOTE for Testcontainers: Docker is blocked for the agent, so the USER runs the Testcontainers suite locally / in CI. Keep the H2 profile for the agent-runnable fast path.

After M2: M3 = auth lifecycle hardening (HttpOnly refresh cookie, rotation + reuse detection) + perf numbers + ONE feature (CSV import / PDF receipts via OpenPDF / realtime SSE). M4 = README + resume bullets + GitHub polish.

---

## 7. Key files

- RESUME_PROJECT_PLAN.md — active plan (milestones, bullets, interview Q&A)
- ROADMAP.md — long-term product vision (not current focus)
- SESSION_HANDOFF.md — this file
- backend/.../service/impl/TransactionServiceImpl.java — M1 target
- backend/.../config/SecurityConfig.java — security + 401/403 fix
- backend/.../security/JwtAccessDeniedHandler.java — new 403 handler
- backend/.../controller/SecurityAuthorizationTest.java — real-container test pattern to reuse for M1
- docker-compose.yml / backend/Dockerfile — local stack

---

## 8. Resume in a new chat

Say: "Continue the LibraryOS resume project on branch resume-prep. Read SESSION_HANDOFF.md and RESUME_PROJECT_PLAN.md, then proceed with Milestone 1 (the concurrency race in issueBook). Build with JDK 17 at ~/maven-tmp/jdk-17.0.20.1+1; I will run docker commands myself since they are blocked for you."

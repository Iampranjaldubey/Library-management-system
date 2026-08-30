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
- fix(security): return 403 instead of 401 for authenticated-but-unauthorized requests  <- HEAD (6b13cfa)

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

### Security fix — DONE (HEAD)
- 401->403 bug: authenticated USER on role-protected endpoint got 401 (frontend treats as session-expiry -> logout) instead of 403.
- Root cause: default AccessDeniedHandler sendError(403) -> servlet ERROR dispatch to /error -> SS6 re-checks as anonymous -> /error not permitted -> 401.
- Fix: JwtAccessDeniedHandler writes 403 ApiResponse JSON directly; SecurityConfig wires it and permits DispatcherType.ERROR/FORWARD.
- Verified via real-container test SecurityAuthorizationTest (RANDOM_PORT). MockMvc could NOT reproduce. Full suite: 5 tests pass.

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

## 6. Next — Milestone 1 (signature interview story)

**Concurrency race in TransactionServiceImpl.issueBook():** read -> check availableCopies>0 -> decrement -> save with no locking. Two concurrent issues of the last copy both pass -> over-issue.

Plan:
1. Failing multi-threaded test (ExecutorService + CountDownLatch): N concurrent issues on a 1-copy book; assert exactly 1 succeeds. Prefer verifying against real MySQL (Testcontainers), since H2 locking differs.
2. Fix with optimistic locking: @Version on Book, catch OptimisticLockException, bounded retry.
3. Document rejected alternatives: pessimistic lock (@Lock PESSIMISTIC_WRITE / SELECT ... FOR UPDATE) and atomic conditional UPDATE ... WHERE available_copies > 0.
4. Keep the test as a regression guard.
Caveat: @Version adds a `version` column -> new Flyway V5 migration; Hibernate validate must still pass.

After M1: M2 = Testcontainers + JaCoCo + GitHub Actions CI (pin JDK 17). M3 = auth lifecycle hardening (HttpOnly refresh cookie) + perf numbers + ONE feature (CSV import / PDF receipts via OpenPDF / realtime SSE). M4 = README + resume bullets + GitHub polish.

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

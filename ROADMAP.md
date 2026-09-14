# LibraryOS — Product Roadmap

**From demo project to sellable product.**

- **Status date:** 2026-08-29
- **Current version:** 1.0.0 — single-tenant, pre-commercial
- **Target:** a commercially defensible SaaS ILS sold to libraries

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Positioning Strategy](#2-positioning-strategy)
3. [Phase 0 — Stabilise the Foundation](#phase-0--stabilise-the-foundation)
4. [Phase 1 — Multi-Tenancy](#phase-1--multi-tenancy)
5. [Phase 2 — Real Circulation](#phase-2--real-circulation)
6. [Phase 3 — Cataloguing & Standards](#phase-3--cataloguing--standards)
7. [Phase 4 — Commercial Layer](#phase-4--commercial-layer)
8. [Phase 5 — Trust & Operations](#phase-5--trust--operations)
9. [Pricing Model](#9-pricing-model)
10. [Timeline Summary](#10-timeline-summary)
11. [Risk Register](#11-risk-register)
12. [Immediate Next Steps](#12-immediate-next-steps)

---

## 1. Current State Assessment

### What exists and works

| Area | Status |
|------|--------|
| Backend architecture | Clean layering — `controller` → `service`/`impl` → `repository` → `entity` |
| Auth | JWT access (15 min) + refresh (7 days), BCrypt, email verification, password reset |
| RBAC | Three roles (ADMIN, LIBRARIAN, USER) via URL rules + `@PreAuthorize` |
| Schema management | Flyway V1–V4 with `ddl-auto=validate`, so Hibernate never mutates schema |
| API docs | springdoc OpenAPI / Swagger UI |
| Frontend | Next.js 16 + React 19 + TS, Tailwind v4, shadcn/ui, silent token refresh on 401 |
| Deployment | Backend on Railway, frontend on Vercel, MySQL on Railway |

The bones are good. Interface/impl separation, DTO request/response split, a generic `ApiResponse<T>` envelope, explicit `JOIN FETCH` to avoid lazy-loading traps, and server-computed transaction status are all sound decisions worth keeping.

### Blocking gaps

Three issues block a sale. None of them are features.

**1. It is single-tenant.**
One `users` table, one `books` table, no tenant boundary anywhere in schema or code. Two customers require two full deployments. This is the most expensive problem to defer — cost grows with every table and query added.

**2. No delivery pipeline or safety net.**

- No CI workflows, no Dockerfile, no Maven wrapper
- Two test files total (`AuthControllerTest`, `BookControllerTest`)
- `application-test.properties` sets `spring.flyway.enabled=false` with `ddl-auto=create-drop` on H2, so **migrations are never tested**. Flyway/entity drift will only surface in production.

**3. It does not speak "library".**
No MARC records, no item-level barcodes, no holds queue, no circulation policy engine, no library calendar, no OPAC, no offline mode. A librarian evaluating this identifies it as a student project within five minutes.

### Known defects found during analysis

| # | Severity | Issue |
|---|----------|-------|
| 1 | **Blocker** | `AuthServiceImpl` uses `@Value` without importing `org.springframework.beans.factory.annotation.Value` — the backend does not compile as committed |
| 2 | High | `PUT`/`DELETE /api/v1/books/{id}` are missing. `booksApi.update`/`delete`, the README, and `SecurityConfig` all assume they exist; `BookController` implements neither, and `BookService` has no update/delete methods |
| 3 | High | Hardcoded DB password and base64 JWT secret committed in `application.properties` |
| 4 | Medium | V4 orphans — `reservations` and `audit_logs` tables plus `transactions.renewal_count` exist with no entities, repositories, or code |
| 5 | Medium | `Procfile` references `target/library-management.jar`, but the pom produces `library-management-1.0.0.jar` (no `finalName` set) |
| 6 | Medium | Token stored in `localStorage` and a non-`HttpOnly` cookie — readable by any XSS |
| 7 | Low | JWT carries no role claims (empty claims map), so authorization requires a DB lookup per request |
| 8 | Low | jjwt 0.11.5 uses deprecated APIs (`setClaims`, `signWith(key, SignatureAlgorithm)`) |
| 9 | Low | `application-test.properties` defines unused `jwt.secret`/`jwt.expiration` keys; app reads `app.jwt.*` |
| 10 | Low | Storage keys inconsistent — `lib/api.ts` uses `getStorageKey()`, `auth-context.tsx` uses literal `"token"`/`"user"` |
| 11 | Low | Docs drift — READMEs describe "Next.js 14" and a smaller endpoint set than what is built |

### Competitive reality

[Koha is a mature open-source ILS with no license cost](https://rottenwifi.com/10-best-open-source-and-free-library-management-systems-in-2026/), active development, standards support, multi-branch capability, and commercial support options. Buyers of open-source ILS [pay only for hosting, support, and implementation](https://kohasupport.com/library-management-software/) rather than licensing.

**Implication:** competing on "we have a book catalogue" loses. You win on onboarding speed, UX, and one specific painful workflow that incumbents handle badly.

> Competitive sources rephrased for compliance with licensing restrictions.

---

## 2. Positioning Strategy

**Do not build a general-purpose ILS.** Pick a beachhead before writing code — it determines your data model.

### Recommended: Indian colleges and schools, sold on accreditation-ready reporting

Rationale:

- NAAC / AICTE / UGC library reporting is recurring, deadline-driven, and genuinely painful
- Institutions assemble those statistics by hand today, from spreadsheets or legacy software
- "One click, accreditation-format library report" is a wedge Koha does not have
- Regionally specific enough that global vendors ignore it
- You are positioned to understand this customer

Adjacent wins that compound in this market: UPI fine payments, WhatsApp notifications, GST-compliant invoicing, bilingual UI.

### Alternative: Western school libraries

Wedge shifts to student-information-system integration and reading-program tracking. Also viable — but choose one. The choice drives the data model, the reporting engine, and the integration surface.

### Positioning statement (fill in after customer interviews)

> For **[segment]** who struggle with **[specific recurring pain]**, LibraryOS is a cloud ILS that **[specific outcome]** — unlike **[incumbent]**, which **[specific failure]**.

---

## Phase 0 — Stabilise the Foundation

**Duration:** 1–2 weeks
**Goal:** the repo builds, tests run in CI, and no secrets are committed.

Do this before adding anything. Nothing else is safe until it is done.

### Tasks

- [ ] Add the missing `@Value` import in `AuthServiceImpl` — **compile blocker, fix first**
- [ ] Implement `PUT /api/v1/books/{id}` and `DELETE /api/v1/books/{id}` in `BookController` + `BookService`/`BookServiceImpl`
- [ ] Move DB password and JWT secret out of `application.properties` to env vars; rotate the leaked secret
- [ ] Add Maven wrapper (`mvnw`)
- [ ] Add multi-stage `Dockerfile` for the backend
- [ ] Add GitHub Actions CI: build, test, dependency vulnerability scan, Docker image build
- [ ] Fix `Procfile` jar name, or set `<finalName>` in the pom
- [ ] Migrate tests to Testcontainers MySQL with **Flyway enabled** — migrations must be exercised on every commit
- [ ] Add a smoke test asserting Flyway migrations and JPA entities agree (`ddl-auto=validate` passes)
- [ ] Decide on V4 orphans: implement reservations/audit/renewals, or drop the tables in a V5 migration
- [ ] Remove dead `jwt.*` keys from `application-test.properties`
- [ ] Unify storage-key access on `getStorageKey()` in `auth-context.tsx`
- [ ] Update both READMEs to match reality (Next.js 16, actual endpoint list)

### Exit criteria

`git clone` → `./mvnw verify` passes on a clean machine. CI is green. No secrets in git history.

---

## Phase 1 — Multi-Tenancy

**Duration:** 4–6 weeks
**Goal:** one deployment serves many libraries with provable data isolation.

Highest-value architectural change in this document. Cost grows exponentially with delay.

### Recommended approach

**Shared schema with a `tenant_id` discriminator**, using Hibernate 6's `@TenantId` (available in Spring Boot 3.2 / Hibernate 6.4) plus a `CurrentTenantIdentifierResolver` driven by a JWT claim.

Reserve **schema-per-tenant** for large or on-prem customers who contractually require physical isolation. Supporting both from day one is a mistake; design the abstraction so the second mode can be added later.

### Tasks

- [ ] Create `tenants` table: plan, status, branding, locale, timezone, contact, trial expiry
- [ ] Add `tenant_id` to every existing table via Flyway migration, with backfill for the current data
- [ ] Annotate entities with `@TenantId`; implement `CurrentTenantIdentifierResolver` + `MultiTenantConnectionProvider`
- [ ] Add `tenantId` claim to the JWT; resolve tenant per request in `JwtAuthenticationFilter`
- [ ] Add composite unique constraints — `(tenant_id, email)`, `(tenant_id, isbn)` — replacing the current global uniques
- [ ] **Write cross-tenant isolation integration tests.** Treat these as non-negotiable; a tenant leak is company-ending
- [ ] Tenant-aware Flyway strategy for per-tenant migrations
- [ ] Branch/location model within a tenant (libraries have multiple service points)

### Security hardening (same work window)

- [ ] Refresh-token rotation with reuse detection
- [ ] Move refresh token to an `HttpOnly`, `Secure`, `SameSite` cookie; stop storing it in `localStorage`
- [ ] Add role claims to the JWT to remove the per-request DB lookup
- [ ] Rate limiting on `/auth/**` (login, register, forgot-password)
- [ ] Account lockout with exponential backoff
- [ ] Password policy + breached-password check
- [ ] Upgrade jjwt 0.11.5 → 0.12.x, replace deprecated APIs
- [ ] Add `jti` + a revocation list so tokens can be invalidated on logout or role change
- [ ] Security headers: HSTS, CSP, X-Content-Type-Options
- [ ] Replace CORS allow-list hardcoding with per-tenant configured origins

### Exit criteria

Two tenants live in one database. An automated test proves tenant A cannot read tenant B's data through any endpoint.

---

## Phase 2 — Real Circulation

**Duration:** 8–10 weeks
**Goal:** circulation behaves the way a real library operates.

Current logic is far too naive: a hardcoded 7-day loan (`LOAN_PERIOD_DAYS`), a flat ₹5/day fine (`FINE_PER_DAY_RS`), and calendar-day arithmetic that charges patrons for days the library was closed.

### 2.1 Circulation policy engine

Replace the constants in `TransactionServiceImpl` with a table-driven matrix.

- [ ] Policy dimensions: patron category × item type × branch
- [ ] Configurable per policy: loan period, renewal limit, fine rate, grace period, fine cap, max concurrent loans, hold limit
- [ ] Policy resolution service with a documented precedence order
- [ ] Admin UI to manage policies

### 2.2 Library calendar

Librarians ask about this in the first demo.

- [ ] Holiday and closure calendar per branch
- [ ] Due dates skip closed days
- [ ] Fine accrual suspended on closed days
- [ ] Configurable open hours affecting same-day due times

### 2.3 Item-level records — **breaking change, do it before customers exist**

`Book` currently carries `totalCopies`/`availableCopies` as integers. Real libraries track individual physical copies.

- [ ] Split `Book` (bibliographic record) from `Item` (physical copy)
- [ ] `Item` fields: barcode, accession number, shelf location, call number, condition, acquisition date, price, status
- [ ] Migrate existing copy counts into generated `Item` rows
- [ ] Circulation operates on `Item`, not `Book`

### 2.4 Holds and reservations

- [ ] Hold queue with position, priority rules, and expiry
- [ ] Notify on availability; pickup shelf with expiry window
- [ ] Trap the next hold on check-in
- [ ] Wire up the existing `reservations` table from V4

### 2.5 Renewals

- [ ] Renewal endpoint honouring policy limits
- [ ] Block rules: item on hold for another patron, fines above threshold, item overdue beyond limit
- [ ] Wire up `transactions.renewal_count` from V4

### 2.6 Item lifecycle

- [ ] Lost, damaged, withdrawn, in-repair, in-transit states
- [ ] Replacement and processing charges
- [ ] Claims-returned handling for disputes

### 2.7 Fines and payments

- [ ] Grace periods and per-loan/per-patron caps
- [ ] Partial payments, waivers with reason codes and audit trail
- [ ] UPI / Razorpay integration for patron self-payment
- [ ] Receipt generation (OpenPDF is already a dependency)

### 2.8 Staff workflow quality

- [ ] **Barcode scanning** — USB scanners emit keystrokes, so this is mostly focus and input handling. Low effort, very high perceived value
- [ ] Rapid-fire check-in/check-out screens designed for keyboard-only operation
- [ ] **Offline circulation** — queue transactions locally and sync on reconnect. Libraries lose internet; this is a genuine differentiator
- [ ] Receipt printing (thermal printer support)

### Exit criteria

A real librarian can run a full day of circulation without touching a spreadsheet or asking you a question.

---

## Phase 3 — Cataloguing & Standards

**Duration:** 6–8 weeks
**Goal:** credibility with anyone employing a professional librarian.

- [ ] **MARC21 import/export** (ISO 2709 + MARCXML)
- [ ] **Z39.50 / SRU copy cataloguing** from national library targets
- [ ] ISBN lookup to auto-populate bibliographic records
- [ ] **Bulk import from CSV/Excel** — this is the migration path off incumbent systems, so it doubles as a sales tool
- [ ] Authority control for authors, subjects, series
- [ ] Spine label and barcode label printing (configurable templates)
- [ ] Stocktake / inventory mode with discrepancy reporting
- [ ] Dewey/LC call number support and shelf-order browse
- [ ] Serials and periodicals check-in (if targeting academic libraries)
- [ ] **SIP2** — required for self-checkout kiosks and RFID gates
- [ ] Acquisitions and budget tracking (academic requirement; defer for schools)

### Exit criteria

A librarian can migrate an existing 20,000-record catalogue in under a day, unassisted.

---

## Phase 4 — Commercial Layer

**Duration:** 6–8 weeks
**Goal:** software becomes a business.

### 4.1 Self-serve onboarding

- [ ] Signup → tenant provisioned → import wizard → first item catalogued, with zero involvement from you
- [ ] Guided setup: branches, policies, patron categories, branding
- [ ] Sample data for evaluation, one-click reset
- [ ] Trial expiry with conversion prompts

### 4.2 Billing and subscriptions

- [ ] Razorpay or Stripe integration
- [ ] Plan definitions, feature gating, usage metering (items, patrons, branches)
- [ ] Dunning and failed-payment recovery
- [ ] GST-compliant invoicing (India) with downloadable invoices
- [ ] Annual purchase-order flow — institutions rarely pay by card

### 4.3 Back-office console (for you)

- [ ] Tenant list with health, usage, plan, MRR
- [ ] Support impersonation, **fully audit-logged**
- [ ] Feature-flag rollout per tenant
- [ ] Churn and usage dashboards

### 4.4 Reports and analytics — your wedge

- [ ] **Accreditation-format exports (NAAC / AICTE / UGC)** — the differentiator
- [ ] Circulation statistics by period, category, branch, patron type
- [ ] Overdue and outstanding-fines reports
- [ ] Popular titles, dead stock, collection-development gap analysis
- [ ] Patron activity and engagement
- [ ] Scheduled report delivery by email
- [ ] Export to PDF (OpenPDF) and Excel

### 4.5 Notifications

- [ ] Email: due-soon, overdue escalation, hold available, fine receipt, welcome
- [ ] SMS / WhatsApp for the Indian market
- [ ] Per-tenant configurable templates and quiet hours
- [ ] Delivery tracking and bounce handling

### 4.6 Patron-facing OPAC

- [ ] Public catalogue search with facets and cover images
- [ ] Patron login: current loans, history, fines, renew, place holds
- [ ] Pay fines online
- [ ] Reading lists and saved searches
- [ ] Mobile-responsive; consider a PWA

### Exit criteria

A librarian can discover, trial, buy, onboard, and get value without you being in the loop.

---

## Phase 5 — Trust & Operations

**Duration:** ongoing — **start during Phase 1**
**Goal:** survive institutional procurement due diligence.

### Reliability

- [ ] Automated backups with a **tested restore**; documented RPO/RTO
- [ ] Disaster recovery runbook, rehearsed
- [ ] Database read replica and connection pooling under load
- [ ] Load testing against realistic circulation volume

### Observability

- [ ] Structured JSON logging with tenant and request correlation IDs
- [ ] Metrics (Micrometer → Prometheus/Grafana): latency, error rate, saturation
- [ ] Distributed tracing
- [ ] Error tracking (Sentry or equivalent)
- [ ] Uptime monitoring and a public status page
- [ ] On-call alerting

### Compliance and security

- [ ] Wire audit logging to the existing `audit_logs` table — mandatory for anything touching money
- [ ] **DPDP Act 2023** compliance (India) or GDPR (EU): consent, retention, erasure, portability
- [ ] **Minors' data** — school libraries raise the bar on retention, consent, and access control
- [ ] Third-party penetration test **before the first paying customer**
- [ ] Automated dependency and container scanning in CI
- [ ] Documented incident response process
- [ ] Data processing agreement and privacy policy

### Accessibility

- [ ] WCAG 2.1 AA for staff UI and OPAC — often mandatory in public-sector tenders
- [ ] Keyboard navigation and screen-reader testing

> Full WCAG compliance cannot be certified by automated tooling alone. It requires manual testing with assistive technologies and expert accessibility review.

### Customer-facing

- [ ] User documentation and in-app contextual help
- [ ] Video walkthroughs for common workflows
- [ ] Support ticketing with defined SLA tiers
- [ ] Changelog and release notes
- [ ] Training materials for library staff

---

## 9. Pricing Model

**Per-library annual subscription, tiered on collection size and branch count — not per-seat.**

Library staff headcount is small, and per-seat caps discourage the daily use that drives retention.

| Component | Approach |
|-----------|----------|
| Core subscription | Annual, tiered by items + branches |
| Data migration | One-time service fee |
| Training | One-time or annual package |
| On-prem / self-hosted | Premium tier for data-residency requirements |
| SMS / WhatsApp | Metered add-on, pass-through plus margin |

Early revenue and trust often come from migration and training services rather than the subscription itself. Do not undervalue them.

**Validate real numbers by asking five librarians what they pay today, before setting any price.** Note that ILS total cost of ownership includes hosting, support, and implementation, not just license fees — position against the full number, not the sticker price.

---

## 10. Timeline Summary

| Phase | Duration | Cumulative | Outcome |
|-------|----------|-----------|---------|
| 0 — Foundation | 1–2 wks | ~2 wks | Builds, tests, CI green, no secrets |
| 1 — Multi-tenancy | 4–6 wks | ~2 mo | One deployment, many libraries |
| 2 — Circulation | 8–10 wks | ~4.5 mo | **Pilot-ready** |
| 3 — Cataloguing | 6–8 wks | ~6.5 mo | Credible to professional librarians |
| 4 — Commercial | 6–8 wks | ~8.5 mo | Self-serve, billable |
| 5 — Trust & ops | ongoing | ~12 mo | Procurement-ready |

**Realistic expectation:** 12–18 months of focused work to a defensible commercial product. 6–8 months to a pilot-ready version.

> **Get a pilot library during Phase 2, not after Phase 5.** Place it in one friendly library for free in exchange for feedback and a testimonial. Everything in this document is a hypothesis until a real librarian uses it.

---

## 11. Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Koha is free and mature | Critical | Compete on onboarding, UX, and the accreditation wedge — never on feature parity |
| Multi-tenancy deferred | Critical | Do it in Phase 1. Cost grows exponentially with every table added |
| Cross-tenant data leak | Company-ending | Automated isolation tests as a merge gate; pen test before first customer |
| Long sales cycles in education | High | Target private institutions first; ride budget cycles; lead with a free pilot |
| Building features nobody asked for | High | Five customer interviews before Phase 2. Re-order this roadmap based on them |
| Solo-founder bandwidth | High | Ruthlessly cut Phase 3 scope; serials and acquisitions are deferrable |
| Item-model refactor after launch | High | Do the `Book`/`Item` split in Phase 2, before any customer data exists |
| Support load at scale | Medium | Invest in docs and self-serve onboarding in Phase 4 |
| Migration from incumbents blocks deals | Medium | Bulk import (Phase 3) is a sales tool, not a nice-to-have |

---

## 12. Immediate Next Steps

### This week

1. Fix the `@Value` import — the backend does not compile
2. Implement book update/delete endpoints
3. Rotate and externalise the committed secrets
4. Stand up CI with Testcontainers and Flyway enabled

### Before writing any Phase 2 code

**Interview five librarians.** Ask:

- What system do you use now, and what do you hate about it?
- What reports are you required to produce, and how do you produce them today?
- Walk me through your busiest hour at the circulation desk.
- What breaks or slows you down most often?
- What would you pay to make that stop?

That conversation will re-order this roadmap. It should.

### Open decisions

- [ ] Target market: Indian education, or Western school libraries?
- [ ] Solo or team? Materially changes phase sequencing
- [ ] Hosted-only, or hosted plus on-prem?

---

## Appendix — Architecture Evolution

### Current

```
Next.js (Vercel) ──HTTPS──► Spring Boot (Railway) ──► MySQL (Railway)
                             single tenant
```

### Target

```
                    ┌─────────────────────────────────┐
                    │  Next.js — staff UI + OPAC      │
                    │  (Vercel, per-tenant subdomain) │
                    └──────────────┬──────────────────┘
                                   │ HTTPS
                    ┌──────────────▼──────────────────┐
                    │  Spring Boot API                │
                    │  tenant resolution → policy     │
                    │  engine → circulation → audit   │
                    └──┬────────┬────────┬────────┬───┘
                       │        │        │        │
                 ┌─────▼──┐ ┌───▼───┐ ┌──▼───┐ ┌─▼──────┐
                 │ MySQL  │ │ Redis │ │ S3   │ │ Workers│
                 │ multi- │ │ cache │ │ files│ │ notify │
                 │ tenant │ │ +rate │ │ +bkp │ │ reports│
                 └────────┘ └───────┘ └──────┘ └────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
     Z39.50/SIP2   Payments      Email/SMS      Observability
     (standards)   (Razorpay)    (WhatsApp)     (metrics/logs)
```

---

## Sources

- [10 Best Free Open-Source Library Systems in 2026](https://rottenwifi.com/10-best-open-source-and-free-library-management-systems-in-2026/) — Koha maturity and market position
- [Library Management Software — Open Source, Free, and Cloud-Based ILS](https://kohasupport.com/library-management-software/) — open-source ILS cost structure
- [Total Cost of Ownership for a Library ILS](https://kohasupport.com/knowledge-base/total-cost-of-ownership-library-ils/) — TCO framing
- [Best Library Management Software in 2026](https://umatechnology.org/best-library-management-software-in-2026-pricing-reviews-demo/) — segment requirement differences

> Content from the above sources was rephrased for compliance with licensing restrictions.

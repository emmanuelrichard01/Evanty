# Architecture

This document describes the system architecture of Evanty. For the reasoning behind each major decision, see the Architecture Decision Records in [`docs/adr/`](adr/).

---

## System overview

```
Browser / Mobile Client
        │
        ▼
 Next.js 15 (Vercel)
 ┌──────────────────────────────────────────────┐
 │  App Router                                  │
 │  ├── RSC pages (data fetching in component)  │
 │  ├── Server Actions (thin mutation wrappers) │
 │  └── API routes /api/v1/* + /api/webhooks/*  │
 └──────────────┬───────────────────────────────┘
                │
                ▼
        Service Layer (lib/services/)
        Pure TypeScript. No framework imports.
        All business rules live here.
                │
        ┌───────┴────────┐
        ▼                ▼
  Repository Layer    Integration Layer
  (lib/repositories/) (lib/integrations/)
  Drizzle queries     Stripe, Paystack,
  only. No logic.     R2, Resend clients
        │
        ▼
  PostgreSQL (Neon)
  Primary data store

        │ (enqueues jobs)
        ▼
  Upstash Redis (BullMQ queue backend)
        │
        ▼
  BullMQ Worker (Railway)
  Long-running process.
  Handles: reservation expiry,
  email delivery, webhook retries.
```

---

## Layer responsibilities

### App Router layer

Next.js pages (RSC) are responsible for fetching data for rendering — they call repository or service functions directly in the component tree. This is the appropriate use of RSC: data fetching co-located with the UI that needs it.

Server Actions are thin wrappers: parse and validate input with Zod, call one service method, return the result or a typed error. No business logic.

API route handlers (`/api/v1/*`) follow the same pattern. They exist for cases where a REST API is more appropriate than a Server Action (external clients, Stripe/Paystack SDKs requiring redirect URLs).

Webhook handlers (`/api/webhooks/*`) are outside the versioned API. They parse the raw request body, verify the PSP signature, then delegate to `OrderService.processWebhook()`.

### Service layer

All business logic lives here. Services are plain TypeScript classes with no Next.js dependencies. This makes them fully unit-testable without starting an HTTP server.

Rules enforced in code review:
- No imports from `next/*`, `next/headers`, `next/navigation`
- No direct database queries (must go through a repository)
- No HTTP calls except through integration wrappers

### Repository layer

Drizzle ORM queries only. No business logic — repositories do not make decisions, they execute queries and return results. The atomic reservation UPDATE lives here because it is a data operation, but its invocation logic (when and whether to call it) belongs in `TicketService`.

### Integration layer

Thin typed wrappers around third-party SDKs. Each integration module exports a single configured client instance. This centralises credential handling and makes mocking straightforward in tests.

---

## Data flow: ticket purchase

The reservation-to-order flow is the critical path in the system.

```
1. User selects tickets
   └─ POST /api/v1/reservations
         └─ TicketService.reserve()
               └─ TicketRepository.atomicReserve()
                     └─ Single atomic UPDATE in PostgreSQL
                        WHERE (capacity - reserved - sold) >= quantity
                        (returns 0 rows if sold out → AppError TICKET_SOLD_OUT)

2. Reservation created (10-minute TTL)
   └─ BullMQ job enqueued: expire-reservation (delay: 10m)

3. POST /api/v1/checkout
   └─ OrderService.createCheckout({ psp, reservationId })
         └─ Stripe or Paystack SDK: create checkout session
         └─ Returns: { redirectUrl }
   └─ Client redirected to PSP checkout page

4. User completes payment (external — on Stripe/Paystack hosted page)

5. PSP posts webhook to /api/webhooks/{stripe|paystack}
   └─ Signature verified (HMAC)
   └─ OrderService.processWebhook({ event, payload })
         └─ Idempotency check: has this psp_reference been processed?
         └─ If payment success:
               - reservation status → 'converted'
               - order status → 'confirmed'
               - ticket_types: reserved--, sold++
               - tickets rows created, QR codes generated (signed JWTs)
               - email job enqueued: send-confirmation
         └─ If payment failure:
               - reservation status → 'expired'
               - ticket_types: reserved--  (inventory released)

6. BullMQ reservation expiry job fires (if payment never completed)
   └─ Checks: reservation still 'pending'?
   └─ If yes: reserved-- (inventory released), status → 'expired'
```

---

## Authentication and authorisation

Authentication is delegated to Clerk. Session tokens are validated by Clerk middleware on protected routes.

Authorisation is enforced in the service layer — not in middleware, not in route handlers. Every service method that performs a sensitive operation checks:

1. The `userId` from the validated session
2. The user's role in the relevant organisation (fetched from `org_members`)

Role hierarchy:

| Role | Can do |
|---|---|
| `owner` | Everything including delete org, transfer ownership |
| `admin` | Create/edit/delete events, manage ticket types, view all orders |
| `member` | View org events, perform check-in scans (Phase 2) |

Attendees (users who have purchased tickets) are not org members. They access only their own orders and tickets via user-scoped queries.

---

## Background jobs

The worker process runs separately from the Next.js application. It connects to the same Upstash Redis instance that the application writes jobs to.

| Queue | Job | Trigger | Action |
|---|---|---|---|
| `reservation-expiry` | `expire-reservation` | 10 minutes after reservation created | Release inventory if payment not completed |
| `email` | `send-confirmation` | Order confirmed | Generate ticket PDF, send via Resend |
| `email` | `send-reminder` | 24h before event | Reminder email with QR code link |
| `webhook-retry` | `retry-webhook` | PSP webhook delivery failure | Exponential backoff retry, up to 5 attempts |

Dead-lettered jobs (failed after all retries) alert to Slack and are visible in the BullMQ dashboard.

---

## Dual payment rails

Both Stripe and Paystack are supported. The abstraction lives in `OrderService.createCheckout()`:

```ts
async createCheckout(input: CreateCheckoutInput): Promise<{ redirectUrl: string }> {
  if (input.psp === 'stripe') {
    return this.createStripeCheckout(input);
  }
  return this.createPaystackCheckout(input);
}
```

Webhook verification differs between PSPs:

- **Stripe**: `stripe.webhooks.constructEvent(rawBody, signature, secret)` — throws if invalid
- **Paystack**: HMAC-SHA512 of raw body using the Paystack secret key, compared to `X-Paystack-Signature` header

Both converge on the same `OrderService.processWebhook()` method after verification. The `psp` field on the `orders` table records which rail was used for each transaction.

---

## Search

Public event discovery uses PostgreSQL full-text search via a generated `TSVECTOR` column on the `events` table. A GIN index on this column keeps FTS queries fast.

```sql
ALTER TABLE events
ADD COLUMN search_vector TSVECTOR
GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
) STORED;

CREATE INDEX idx_events_search ON events USING GIN (search_vector);
```

If search becomes a bottleneck (large event volume, multi-language queries, typo tolerance needed), Meilisearch can be added as a search replica fed via a Postgres trigger or a background sync job. This transition does not require schema changes to the primary database.

---

## Caching strategy

| Resource | Cache location | TTL / Invalidation |
|---|---|---|
| Event listing pages | Vercel CDN edge | Revalidated on publish/update via `revalidatePath()` |
| Individual event pages | Vercel CDN edge | Revalidated on event update or ticket type change |
| R2 assets (images) | Cloudflare CDN | 1 year, immutable (content-addressed UUID filenames) |
| Ticket availability | None — always live | Stale availability risks showing "available" when sold out |
| User session | Clerk managed | Clerk's session TTL |

**Ticket availability is never cached.** The cost of showing a stale "available" state is a degraded user experience (false hope, then a 409 error). The cost of a database query is acceptable.

---

## Infrastructure

| Component | Service | Notes |
|---|---|---|
| Next.js app | Vercel | Auto-scaling, edge network, preview deployments |
| BullMQ worker | Railway | Single long-running Node.js process |
| Database | Neon (PostgreSQL) | Serverless, autoscaling, branching for preview envs |
| Queue | Upstash Redis | Per-command pricing, serverless-compatible |
| File storage | Cloudflare R2 | S3-compatible, zero egress fees |
| Email | Resend | Transactional, 100 emails/day free |
| Error tracking | Sentry | Frontend + API, source maps uploaded at build |
| Logging | Axiom | Structured JSON, APL querying, Vercel log drain |
| Uptime | Better Uptime | 3-minute checks, status page, Slack + SMS alerts |

Preview deployments on Vercel use an isolated Neon database branch. They never connect to the production database.

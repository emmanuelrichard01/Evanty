# Evanty

Africa-native event management and ticketing platform. Built for West African organizers who need local payment rails, QR-based check-in, and production-grade reliability — not a Stripe-only, USD-denominated product built for a different market.

> **Portfolio project.** Every architectural decision in this codebase is documented and defensible. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/adr/`](docs/adr/) for the reasoning behind every major choice.

---

## What it does

- Organizers create events with multiple ticket tiers (GA, VIP, Early Bird, Free)
- Tickets are sold via **Stripe** (international/diaspora) or **Paystack** (domestic NG/GH)
- Inventory is managed with an atomic SQL reservation — zero oversell under any concurrent load
- Confirmed attendees receive a signed QR code ticket via email
- Organizers get a real-time dashboard with revenue, attendee lists, and CSV export
- Check-in operators scan QR codes at the door from a mobile-optimized interface (Phase 2)

---

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | RSC, Server Actions, streaming |
| Database | PostgreSQL via Neon | ACID transactions, relational integrity, relational categories schema |
| ORM | Drizzle ORM | Type-safe SQL, explicit queries, migrations |
| Auth | Clerk | Session management, webhook sync |
| Payments | Stripe + Paystack | International + domestic rails |
| Queue | BullMQ + Upstash Redis | Reservation expiry, background jobs |
| Storage | Cloudflare R2 | Direct client-side uploads via pre-signed URLs |
| Email | Resend + React Email | Transactional, composable templates |
| Error tracking | Sentry | Frontend + API error capture |
| Logging | Axiom | Structured logs with APL querying |

Full rationale for each choice: [`docs/adr/`](docs/adr/)

---

## Project structure

```
evanty/
├── app/
│   ├── (auth)/                 # Clerk auth routes
│   ├── (public)/               # Event discovery, public event pages
│   ├── (dashboard)/            # Organizer dashboard (protected)
│   ├── (checkin)/              # QR scan interface (Phase 2)
│   └── api/
│       ├── v1/                 # Versioned REST API
│       └── webhooks/           # Stripe + Paystack webhooks
├── lib/
│   ├── services/               # Business logic — no framework imports
│   ├── repositories/           # Drizzle queries — no business logic
│   ├── integrations/           # Stripe, Paystack, R2, Resend clients
│   ├── queue/                  # BullMQ producers + workers
│   ├── db/
│   │   ├── schema.ts           # Drizzle table definitions
│   │   └── index.ts            # Neon connection
│   └── validations/            # Zod schemas — shared server/client
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   └── shared/                 # App-specific composites
├── workers/                    # Long-running BullMQ worker process
├── docs/
│   ├── ARCHITECTURE.md
│   └── adr/                    # Architecture Decision Records
└── __tests__/
    ├── unit/                   # Vitest — service layer
    ├── integration/            # Vitest — API + DB
    └── e2e/                    # Playwright — full flows
```

---

## Local development

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) project (free tier is fine)
- [Clerk](https://clerk.com) application
- [Stripe](https://stripe.com) account (test mode)
- [Paystack](https://paystack.com) account (test mode)
- [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket
- [Upstash Redis](https://upstash.com) database

### Setup

```bash
git clone https://github.com/your-username/evanty.git
cd evanty
npm install
```

Copy the environment template and populate with your keys:

```bash
cp .env.example .env.local
```

Run database migrations:

```bash
npm run db:migrate
```

Start the development server:

```bash
npm run dev
```

Start the background worker (separate terminal):

```bash
npm run worker:dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See [`.env.example`](.env.example) for the full list with descriptions. Never commit `.env.local`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run worker:dev` | BullMQ worker in watch mode |
| `npm run db:generate` | Generate Drizzle migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run test` | Run Vitest unit + integration tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check (no emit) |

---

## Critical engineering decisions

### The ticket reservation flow

This is the most important engineering decision in the system. 100 concurrent users clicking "Buy" on the last ticket cannot result in 100 confirmed orders.

The solution is a single atomic SQL statement that checks availability and reserves in one operation:

```sql
UPDATE ticket_types
SET reserved = reserved + $quantity
WHERE id = $id
  AND (capacity - reserved - sold) >= $quantity
RETURNING id, (capacity - reserved - sold) AS remaining
```

If the WHERE clause fails to match (sold out), 0 rows are updated and the application returns a 409. No application-level check, no race condition. The database also has a CHECK constraint as a last-resort guard: `reserved + sold <= capacity`.

See [`docs/adr/001-postgresql-over-mongodb.md`](docs/adr/001-postgresql-over-mongodb.md) for the full rationale.

### Dual payment rails

Stripe and Paystack are both supported. The service layer abstracts PSP selection behind `OrderService.createCheckout({ psp, reservationId, returnUrl })`. Both PSPs write confirmed orders through the same webhook handler path, which is idempotent via an `idempotency_key` column.

---

## Testing

Before any public-facing deployment, three quality gates must pass:

1. **Unit tests** — `npm run test` — all service layer tests green
2. **E2E flows** — `npm run test:e2e` — purchase flow, sold-out behaviour, role enforcement
3. **Load test** — `k6 run tests/load/reservation-concurrency.js` — 100 concurrent reservations on 50-capacity event, zero oversells

See [`docs/TESTING.md`](docs/TESTING.md) for the full strategy.

---

## Deployment Guide

### Deploying to Vercel

Evanty is designed to be easily deployed on Vercel. Follow these steps to set up and deploy the project:

#### 1. Setup Neon PostgreSQL Database
- Create a project on [Neon Database](https://neon.tech).
- Retrieve your **Pooled Connection String** (it starts with `postgresql://` and usually contains `.pooler.eu-central-1.aws.neon.tech` or similar) to use as `DATABASE_URL`.

#### 2. Drizzle Database Push
Ensure your database tables are initialized. Run this command locally with your live database URL before triggering the Vercel build, or use Vercel's integrations:
```bash
DATABASE_URL="your-production-db-connection-string" npm run db:push
```

#### 3. Setup Clerk Authentication
- Create a project in [Clerk](https://clerk.com).
- Copy the **Publishable Key** and **Secret Key**.
- Configure the Redirect URLs in Clerk Dashboard or via environment variables:
  - Sign-in: `/sign-in`
  - Sign-up: `/sign-up`
- Create a Webhook in the Clerk Dashboard pointing to `https://your-vercel-domain.vercel.app/api/webhooks/clerk` and subscribe to `user.created`, `user.updated`, and `user.deleted` events. Copy the signing secret as `WEBHOOK_SECRET`.

#### 4. Setup Cloudflare R2 Bucket
- In the Cloudflare dashboard, go to **R2 Storage** and create a bucket named `evanty-uploads`.
- Generate R2 API tokens with read/write permissions.
- Save the Access Key, Secret Key, and Account ID.
- Enable the R2 public dev domain or set up a custom domain for your bucket, and set `NEXT_PUBLIC_R2_PUBLIC_URL` to this domain (e.g. `https://pub-xxxxxx.r2.dev`).

#### 5. Configure Vercel Environment Variables
Add the following environment variables in your Vercel Project Settings under **Settings > Environment Variables**:

| Variable Name | Description | Example/Value |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Your deployment root URL | `https://your-vercel-domain.vercel.app` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk private API key | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Route for Clerk sign-in | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Route for Clerk sign-up | `/sign-up` |
| `WEBHOOK_SECRET` | Clerk webhook signing secret | `whsec_...` |
| `DATABASE_URL` | Neon pooled connection URL | `postgresql://...` |
| `R2_ACCOUNT_ID` | Cloudflare account ID | `af8715160125348aca9...` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 key ID | `d3c8020ecab958a3...` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key | `39dbd85edb85edb...` |
| `R2_API_TOKEN` | Cloudflare R2 token | `cfut_QaDiBT...` |
| `R2_BUCKET_NAME` | R2 bucket name | `evanty-uploads` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public URL for R2 bucket | `https://pub-xxxxxx.r2.dev` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |

#### 6. GitHub Integration & CI/CD
- Connect your GitHub repository to Vercel.
- The repository includes a GitHub Action workflow in `.github/workflows/ci.yml` that will verify types, lint rules, and compile status automatically on each push and pull request.
- Once CI passes, Vercel will automatically build and publish your preview/production URL.

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Security

See [`SECURITY.md`](SECURITY.md) for the vulnerability reporting policy.

## License

MIT

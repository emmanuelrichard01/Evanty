# Contributing to Evanty

Thank you for your interest. This document covers the development workflow, code standards, and process for contributing to the project.

---

## Development workflow

### Branching

All work happens on branches off `main`. Branch naming convention:

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/short-description` | `feat/waitlist-management` |
| Bug fix | `fix/short-description` | `fix/reservation-expiry-race` |
| Chore | `chore/short-description` | `chore/update-drizzle` |
| ADR / docs | `docs/short-description` | `docs/adr-006-search-strategy` |

Never commit directly to `main`. Every change goes through a pull request.

### Before opening a PR

Run this sequence locally and make sure everything passes:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If you are changing database schema, also verify the migration:

```bash
npm run db:generate   # generates migration file
npm run db:migrate    # applies to your local dev DB
```

Review the generated SQL in `drizzle/` before committing it. Migrations must be backwards-compatible — the old application version must be able to run against the new schema while the deployment rolls out.

### Preview deployments

Every PR gets a Vercel preview deployment with an isolated Neon database branch. Test your changes in the preview environment, not just locally. The preview URL is posted as a PR comment.

---

## Code standards

### Service layer rule

Business logic belongs in `lib/services/`. Services must have zero imports from Next.js, `next/headers`, `next/navigation`, or any HTTP-specific module. This rule exists so services remain unit-testable without an HTTP server.

```ts
// ✓ correct — plain TypeScript
export class TicketService {
  async reserve(input: ReserveInput): Promise<Reservation> { ... }
}

// ✗ wrong — imports framework primitive
import { cookies } from 'next/headers';
export async function reserveTicket() { ... }
```

Server Actions and API route handlers are thin wrappers. They parse and validate input (Zod), call a service method, and return the result. No business logic in route handlers.

### Dependency Injection

Services should be designed with Dependency Injection (DI) in mind. Rather than instantiating repositories directly inside the service methods, inject them via the constructor. This makes testing significantly easier.

```ts
export class TicketService {
  constructor(private readonly ticketRepo: TicketRepository) {}
}
```

### Validation

All external input (API request bodies, form data, URL params) must be validated with a Zod schema before it reaches the service layer. Schemas live in `lib/validations/`. The same schema is reused on client and server where applicable.

### Monetary values

All money is stored and computed in the smallest currency unit (kobo for NGN, pesewas for GHS, cents for USD) as integers. Never use `float` or `number` for monetary arithmetic. Display formatting happens only at the presentation layer.

```ts
// ✓ correct
const priceKobo = 5000_00; // ₦5,000.00

// ✗ wrong — floating point precision loss
const priceNaira = 5000.00;
```

### Error handling

Services throw typed errors with machine-readable codes. API route handlers catch service errors and map them to HTTP responses. Never let unhandled exceptions surface as 500s with stack traces.

```ts
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown,
  ) {
    super(message);
  }
}

// usage
throw new AppError('TICKET_SOLD_OUT', 'No tickets remaining', 409);
```

### Logging

Use the structured logger wrapper, not `console.log`. Every log line must include `service`, `event`, and `traceId` at minimum.

```ts
import { logger } from '@/lib/logger';

logger.info({
  service: 'ticket-service',
  event: 'reservation.created',
  traceId: ctx.traceId,
  meta: { reservationId, ticketTypeId, quantity },
});
```

---

## Writing tests

### Unit tests (Vitest)

Every service method must have tests. Repository methods are mocked. Tests live in `__tests__/unit/`.

```ts
// __tests__/unit/ticket.service.test.ts
import { TicketService } from '@/lib/services/ticket.service';
import { mockTicketRepo } from '@/tests/mocks/ticket.repo.mock';

describe('TicketService.reserve()', () => {
  it('throws TICKET_SOLD_OUT when no inventory available', async () => {
    mockTicketRepo.atomicReserve.mockResolvedValue({ rowCount: 0 });
    await expect(service.reserve({ ticketTypeId: 'tt_1', quantity: 1 }))
      .rejects.toThrow('TICKET_SOLD_OUT');
  });
});
```

### Integration tests (Vitest + Neon branch)

API route handlers tested against a real database (your local or a Neon dev branch). Lives in `__tests__/integration/`. These tests use `fetch` against a locally running Next.js server started in test mode.

### E2E tests (Playwright)

Critical user journeys only — not every UI interaction. Lives in `__tests__/e2e/`. Run against the Vercel preview deployment in CI.

---

## Database migrations

### Rules for migrations

1. Always run `db:generate` and review the SQL output before committing
2. Migrations must be **additive** by default — add columns as nullable, backfill, then add NOT NULL constraint in a follow-up migration
3. Never drop a column or rename it in the same migration as the application code change — deploy schema change first, then the code change, then the cleanup
4. Test every migration on a Neon branch before running on production

### Running in production

Migrations run automatically in the Vercel `postbuild` hook via `db:migrate`. The CI pipeline will block deployment if the migration fails.

---

## Architecture decisions

If your change involves a significant technical choice (new dependency, different approach to an existing pattern, infrastructure change), write an ADR first.

ADRs live in `docs/adr/`. Copy the template from `docs/adr/000-template.md`, number sequentially, and open a PR for discussion before implementing.

ADRs document the decision, the alternatives considered, and the tradeoffs. They are not justifications written after the fact — write them before or during implementation, not after.

---

## Pull request process

1. Open a PR with a clear title and description referencing the relevant issue
2. Fill in the PR template — all sections are there for a reason
3. CI must pass (lint, typecheck, tests, build)
4. Preview deployment must be working and manually tested
5. If the PR touches the reservation flow, ticket inventory, or webhooks — include evidence of testing (k6 output, Postman screenshots, or Playwright trace)
6. Squash commits before merge unless the individual commits tell a meaningful story

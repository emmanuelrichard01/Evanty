# ADR-002: Drizzle ORM over Prisma

**Date:** 2025-09-01  
**Status:** Accepted  
**Deciders:** Emmanuel Moghalu

---

## Context

The application needs a database access layer that provides type safety, handles PostgreSQL-specific features, works well in a Next.js serverless environment, and produces legible, performant queries.

The two main contenders in the TypeScript/PostgreSQL ecosystem are Prisma and Drizzle ORM.

## Decision

Use **Drizzle ORM**.

## Alternatives considered

- **Prisma:** Larger ecosystem, excellent documentation, mature tooling. Rejected for the following reasons:
  - Prisma generates SQL that is not directly visible or controllable — it can produce surprising query plans on complex joins
  - Prisma's migration system (`prisma migrate`) uses a shadow database for migration diffing, which adds complexity in Neon's serverless branching model
  - Prisma's client requires a code generation step (`prisma generate`) as part of the build — an additional CI dependency
  - Prisma's bundle size is heavier, which matters in serverless/edge contexts
  - For a portfolio project where demonstrating SQL literacy matters, Drizzle's explicit query builder is a stronger signal than Prisma's abstraction

- **Kysely:** Pure query builder with excellent TypeScript inference. No migration system — would require a separate migration tool (e.g. `node-pg-migrate`). More boilerplate for simple CRUD. Drizzle provides equivalent type safety with a migration system included.

- **Raw `pg` / `postgres.js`:** Maximum control, no abstractions. Rejected because hand-writing SQL for all CRUD operations in a portfolio project is not the right use of time. Drizzle generates correct SQL while maintaining type safety.

## Consequences

### Positive
- Schema defined as TypeScript objects — types are inferred directly, no separate type generation step at runtime
- SQL output is predictable and readable — `db.select().from(events).where(eq(events.status, 'published'))` produces exactly the SELECT you'd expect
- Drizzle Kit handles migrations without a shadow database — compatible with Neon branching
- Lighter bundle than Prisma — important for Next.js serverless function cold starts
- The atomic reservation UPDATE can be written as a raw tagged template literal inside Drizzle: `db.execute(sql`UPDATE ... RETURNING ...`)` — still type-safe with explicit result typing

### Negative
- Smaller community and ecosystem than Prisma — fewer third-party integrations and Stack Overflow answers
- Drizzle's relation query API (`db.query.events.findMany({ with: { ticketTypes: true } })`) is newer and less battle-tested than Prisma's equivalent
- Drizzle Studio (local DB browser) is less polished than Prisma Studio

### Neutral
- Schema-in-code vs schema-in-Prisma-DSL: both require learning a specific syntax. Neither is objectively better.

## Implementation notes

- Schema definition lives in `lib/db/schema.ts` — all tables defined as Drizzle objects, exported for use in repositories
- Migrations generated via `drizzle-kit generate` and applied via `drizzle-kit migrate`
- The `db` instance (Neon + Drizzle) is initialised once in `lib/db/index.ts` and imported wherever needed — do not create multiple instances
- Use `db.transaction()` for multi-statement operations (e.g. confirming an order: update reservation, update inventory counters, insert order + order items + tickets)
- Use `db.execute(sql`...`)` for the atomic reservation UPDATE — raw SQL is appropriate when the query must be a specific form for correctness, not just performance

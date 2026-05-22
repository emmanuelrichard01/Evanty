# ADR-001: PostgreSQL over MongoDB

**Date:** 2025-09-01  
**Status:** Accepted  
**Deciders:** Emmanuel Moghalu

---

## Context

The application manages events, ticket types, orders, order items, tickets, users, and organisations. These entities have well-defined relationships: an event belongs to an organisation, an order belongs to a user and an event, an order has many order items, each order item references a ticket type, and confirmed orders produce individual ticket records.

The ticket purchase flow is the critical path. It requires:
1. Checking ticket availability
2. Reserving inventory atomically (no oversell under concurrent load)
3. Confirming the reservation as a paid order on webhook receipt
4. Releasing inventory if payment is abandoned

All three write operations must either all succeed or all be rolled back. This is a textbook relational, transactional workload.

The previous version of this project (a 2024 tutorial build) used MongoDB because it was the default choice in the tutorial. It was not chosen for any architectural reason.

## Decision

Use **PostgreSQL** hosted on **Neon** (serverless).

## Alternatives considered

- **MongoDB (Mongoose):** Document model is the wrong fit for this domain. Every meaningful query requires `$lookup` aggregations that simulate JOINs. Multi-document transactions are supported but bolt-on — they were added to MongoDB to address a known limitation. The ticket reservation requires an atomic `UPDATE ... WHERE ... RETURNING` — this is a SQL primitive that would require a transaction wrapping a read, check, and write in MongoDB. More code, more failure surface.

- **Supabase (PostgreSQL):** Valid choice. Rejected because Supabase bundles auth (Clerk is already the choice), real-time (not needed for MVP), and a UI console that adds vendor opinion on top of Postgres. Neon provides a clean serverless Postgres connection with branching support, which is more directly useful.

- **PlanetScale (MySQL):** MySQL-compatible with branching. Rejected because PlanetScale has foreign key constraints disabled by default (for their schema change workflow), which would eliminate a key data integrity mechanism. Also: PlanetScale discontinued their free tier in 2024.

- **SQLite (Turso):** Excellent for low-concurrency read-heavy workloads. The ticket reservation requires consistent cross-region writes with strong serialisation guarantees. SQLite's distributed story is weaker here than Postgres.

## Consequences

### Positive
- Native ACID multi-statement transactions for the reservation flow
- Real foreign key constraints with cascades — data integrity enforced at the database level
- CHECK constraints as a last-resort oversell guard: `reserved + sold <= capacity`
- `pg_trgm` and `tsvector` for full-text search without a separate search service
- Neon database branching gives every PR an isolated database environment
- SQL literacy demonstrated in the codebase — important for a data engineering portfolio

### Negative
- Schema migrations are required for every structural change (Drizzle Kit handles this, but it adds a step)
- More upfront schema design time compared to schemaless MongoDB
- Neon serverless has cold-start connection latency on the first query after idle periods (mitigated by PgBouncer pooled connections)

### Neutral
- Moving from Mongoose to Drizzle ORM — different mental model, neither objectively harder

## Implementation notes

- Use Neon's **pooled connection string** for all application queries to avoid exhausting connection limits from serverless function instances
- Use the **non-pooled connection string** only for Drizzle Kit migrations (which require a direct connection)
- The atomic reservation UPDATE is in `TicketRepository.atomicReserve()` — it must never be refactored into a read + application check + write sequence
- All monetary columns are `BIGINT` storing values in the smallest currency unit (kobo, pesewas, cents) — never `FLOAT` or `DECIMAL` for money

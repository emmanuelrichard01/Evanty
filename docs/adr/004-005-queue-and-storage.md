# ADR-004: BullMQ + Upstash Redis for background jobs

**Date:** 2025-09-01  
**Status:** Accepted  
**Deciders:** Emmanuel Moghalu

---

## Context

Three categories of work cannot be handled synchronously in an HTTP request:

1. **Reservation expiry** — when a user reserves tickets but never completes payment, the 10-minute hold must be released. This requires a delayed job that fires at a specific time in the future.
2. **Transactional email** — sending confirmation emails after order confirmation, reminder emails 24h before events. Email delivery can be slow and should not block the API response.
3. **Webhook retry** — if a PSP webhook fails to deliver (network error, our server being momentarily unavailable), we need exponential backoff retries to ensure orders are eventually confirmed.

Vercel serverless functions cannot run long-lived or scheduled processes. A background job system is required.

## Decision

Use **BullMQ** as the job queue library backed by **Upstash Redis**. The worker process runs separately on **Railway**.

## Alternatives considered

- **Vercel Cron + serverless functions:** Vercel's cron jobs run on a schedule (minimum every minute). This would handle scheduled email reminders but cannot implement precise delayed jobs (reservation expiry must fire at a specific moment, not on a schedule).
- **Inngest:** Event-driven background job platform. Serverless-native, good developer experience. Rejected because it adds a third-party vendor dependency for functionality that BullMQ + Redis handles well. Inngest would be the right choice if this scaled to requiring a managed background job platform.
- **AWS SQS + Lambda:** Overengineered for this scope. Adds significant infrastructure complexity.
- **pg-boss (PostgreSQL-backed queue):** Would use the existing Neon database as the queue backend. Simpler infrastructure. Rejected because high-frequency job polling would add unnecessary load to the primary database. Suitable for lower-volume workloads.

## Consequences

### Positive
- BullMQ handles delayed jobs, retries with exponential backoff, dead-letter queues, and job prioritisation natively
- Upstash Redis is serverless-friendly: per-command pricing, no persistent server cost, compatible with the Vercel deployment model
- Failed jobs are moved to a dead-letter queue and trigger Slack alerts — visibility into processing failures
- BullMQ dashboard can be added for job monitoring without additional infrastructure

### Negative
- Additional infrastructure component: Railway service for the worker process
- Additional monitoring responsibility: worker health must be tracked separately from the Next.js app
- Upstash Redis is an additional vendor dependency

### Neutral
- Worker process runs as a separate Node.js service — can be scaled independently if job volume increases

## Implementation notes

- Producer functions live in `lib/queue/producers.ts` — imported by services that enqueue jobs
- Worker files in `workers/` — started separately via `npm run worker`
- Upstash Redis connection string stored in `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables
- Reservation expiry job must be idempotent: the worker checks reservation status before releasing inventory. If the reservation was already converted (payment completed before TTL), the job is a no-op.

---
---

# ADR-005: Cloudflare R2 over Uploadthing

**Date:** 2025-09-01  
**Status:** Accepted  
**Deciders:** Emmanuel Moghalu

---

## Context

Event cover images need to be stored and served reliably. The application needs to accept file uploads from organizers, store them durably, and serve them via CDN to event pages.

The previous tutorial version used Uploadthing for file uploads because it provides a pre-built Next.js integration with minimal configuration.

## Decision

Use **Cloudflare R2** for file storage.

## Alternatives considered

- **Uploadthing:** Simple integration, purpose-built for Next.js. Rejected because:
  - Abstracts the upload flow completely — no opportunity to demonstrate real cloud storage integration in the portfolio
  - Pricing is per-file-transfer, which becomes expensive at scale
  - Vendor lock-in: leaving Uploadthing requires migrating all stored files
  - For a senior portfolio project, using a thin wrapper around S3-compatible storage and calling it "file uploads" is a missed opportunity

- **AWS S3:** Industry standard. Valid choice. Rejected in favour of R2 because R2 has no egress fees (S3 charges per GB transferred out). For a portfolio project serving images to users, egress-free is the cost-correct choice. R2 is S3-compatible — any S3 SDK works with R2 with a URL change.

- **Supabase Storage:** Integrates with Supabase's auth. Not relevant since auth is handled by Clerk. Adds a dependency on a Supabase project just for storage.

- **Vercel Blob:** Vercel's first-party storage. Convenient integration. More expensive than R2 at scale.

## Consequences

### Positive
- Zero egress fees — images served to event pages don't incur transfer costs
- S3-compatible: standard `@aws-sdk/client-s3` works with a `endpoint` override pointing to R2
- Cloudflare Images can be added later for on-the-fly image resizing without migrating storage
- Demonstrates real cloud storage integration: signed URL generation, direct-to-bucket uploads, CDN configuration

### Negative
- More implementation work than Uploadthing — must implement the signed URL flow manually
- Cloudflare account required (free tier is sufficient for portfolio use)

### Neutral
- Files are still served via Cloudflare's CDN — same performance story as any major CDN

## Implementation notes

**Upload flow:**

1. Client requests a pre-signed upload URL: `POST /api/v1/uploads/sign` — server generates a signed URL using the S3 SDK pointing at R2
2. Client uploads the file directly to R2 using the signed URL (PUT request)
3. Client sends the resulting R2 object key to the server: included in the event creation/update request body
4. Server constructs the public CDN URL from the object key and stores it in the database

**File naming:**

Object keys are random UUIDs: `covers/${uuid}.${ext}`. The original filename is never used as the storage key. This prevents path traversal attacks and filename collisions.

**MIME validation:**

The server validates the file type before generating the signed URL using the `file-type` npm package (magic byte inspection), not the `Content-Type` header provided by the client (which can be spoofed).

**CDN URL:**

Configure the R2 bucket with a custom domain via Cloudflare. Event cover URLs stored in the database are the Cloudflare CDN URL, not the R2 bucket URL directly.

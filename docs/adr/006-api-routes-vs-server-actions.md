# ADR-006: API Route Handlers vs Server Actions

**Date:** 2026-05-14  
**Status:** Accepted  

---

## Context

Next.js 14/15 App Router introduces Server Actions as the primary way to handle mutations from the client. However, Server Actions are not always the right tool for every backend operation, specifically when dealing with external integrations (like webhooks) or complex API requirements. We need a strict rule for when to use a Server Action versus an API Route Handler (`route.ts`).

## Decision

We will use **Server Actions strictly for first-party UI mutations** and **API Route Handlers (`/api/*`) strictly for third-party integrations, webhooks, and REST APIs**.

## Alternatives considered

- **Use API Routes for everything:** This was the pages router approach. Rejected because it requires manual state management, fetch calls, and `useState` boilerplate for simple form submissions which Server Actions solve elegantly.
- **Use Server Actions for everything:** Rejected because Server Actions cannot easily receive generic `POST` webhooks from providers like Stripe or Paystack. They are RPC calls tightly coupled to the Next.js frontend, expecting specific multipart/form-data payloads.

## Consequences

### Positive
- Forms and UI mutations benefit from progressive enhancement and less boilerplate using `useActionState` and `<form action={...}>`.
- Webhooks and third-party integrations (like the Cloudflare R2 presigned URL endpoint) have a standard REST interface (`/api/v1/...`).
- Clear boundary of concerns.

### Negative
- Developers must maintain two entry point patterns into the service layer depending on the caller context.

### Neutral
- Both Server Actions and API Routes are just thin wrappers. They must BOTH parse input with Zod and delegate the actual business logic to `lib/services/`.

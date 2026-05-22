# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| `main` (latest) | ✓ |
| Older branches | ✗ |

This is an actively developed portfolio project. Security fixes are applied to `main` only.

---

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities privately to: `security@[your-domain].com`

Include in your report:
- Description of the vulnerability and its potential impact
- Steps to reproduce or proof-of-concept
- Affected component (auth, payment flow, API endpoint, etc.)
- Your recommended fix, if you have one

You will receive an acknowledgement within 48 hours and a status update within 7 days.

---

## Security model

### Authentication

Authentication is handled by [Clerk](https://clerk.com). Session tokens are httpOnly cookies — they are never accessible to JavaScript. CSRF protection is included in Clerk's session model.

Webhook events from Clerk are verified using HMAC signatures via [Svix](https://svix.com) before any user data is written.

### Payment data

**No payment card data is stored or transmitted through this application.** All payment processing happens via Stripe or Paystack. This application handles only:
- Checkout session creation (redirect URLs)
- Webhook event verification and order status updates

Stripe webhooks are verified using `stripe.webhooks.constructEvent()` with the raw request body before any processing. Paystack webhooks are verified using HMAC-SHA512 against the `X-Paystack-Signature` header.

### Webhook Idempotency

Payment providers (Stripe, Paystack) can and will send the same webhook event multiple times due to network retries or generic "at-least-once" delivery guarantees. The `OrderService.processWebhook()` method enforces strict idempotency using the `idempotency_key` (derived from the webhook event ID) on the `orders` table. Duplicate events are acknowledged (HTTP 200) but safely ignored without triggering double-fulfillment or duplicate emails.

### Access control

Role-based access is enforced in the **service layer**, not just in the UI or route middleware. Every service method that modifies organizer data verifies:
1. The requesting user is authenticated (Clerk session)
2. The user has the required role in the organisation (from the `org_members` table)

Users can only access their own orders, tickets, and personal data. Attempting to access another user's order returns a 404 — not a 403 — to avoid leaking resource existence.

### Inventory integrity

The ticket reservation system uses a single atomic SQL UPDATE that combines the availability check and the reservation increment. A database-level CHECK constraint (`reserved + sold <= capacity`) acts as a last-resort guard against oversell even if application-level logic fails.

### Data storage

- All data in transit is encrypted via TLS (enforced by Vercel and Neon)
- Database credentials are stored as environment variables in Vercel — never in the codebase
- Uploaded files (event covers) are stored in Cloudflare R2 with random UUID keys — original filenames are never used as storage keys
- Passwords are never stored — authentication is fully delegated to Clerk (OAuth and passwordless)

### Environment variables

The following rules are enforced:
- No secrets appear in `NEXT_PUBLIC_` environment variables (which are bundled into client JavaScript)
- `.env.local` is in `.gitignore` and is never committed
- A pre-commit hook via `husky` blocks commits containing common secret patterns

### NDPR compliance

User data handling follows the Nigeria Data Protection Regulation:
- Personal data (name, email) is collected only for the purposes stated at registration
- Users can request deletion of their account — PII is removed from the `users` table; order records are anonymised (attendee fields nulled) rather than deleted for financial audit purposes
- Consent is collected at registration and stored with a timestamp

---

## Known limitations

- Rate limiting is implemented at the application layer (Upstash Ratelimit). A sufficiently large DDoS attack would require Vercel's edge-level WAF or Cloudflare protection, which is not configured in this portfolio deployment.
- File upload malware scanning is not implemented. Files are MIME-type validated (magic bytes, not Content-Type header) and size-limited, but not scanned with an antivirus engine. This is documented as a known gap for a production deployment.

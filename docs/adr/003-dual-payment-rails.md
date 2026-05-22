# ADR-003: Dual payment rails — Stripe and Paystack

**Date:** 2025-09-01  
**Status:** Accepted  
**Deciders:** Emmanuel Moghalu

---

## Context

Evanty targets event organisers and attendees in Nigeria and Ghana primarily, with secondary reach to diaspora communities internationally.

The Nigerian and Ghanaian payment landscape is distinct from the Western default:
- Local card payments and bank transfers are heavily dominated by **Paystack** (Nigeria) and its regional expansion
- International card payments (Visa/Mastercard for diaspora or international attendees) are better served by **Stripe**
- Many Nigerian users have cards that work on Paystack but are not Stripe-compatible due to international transaction restrictions on some Nigerian-issued cards
- Paystack supports USSD payment (dial-to-pay without internet) — not relevant for MVP but architecturally possible

A platform that only offers Stripe checkout will fail for a significant portion of its target market. A platform that only offers Paystack cannot serve diaspora or international attendees at a tech conference.

## Decision

Support both **Stripe** and **Paystack** as payment backends, abstracted behind a single `OrderService.createCheckout()` interface. The PSP used for each order is recorded on the `orders` table (`psp` column).

## Alternatives considered

- **Stripe only:** Simplest implementation. Rejected because Stripe's support for Nigerian domestic cards is inconsistent — many users get declines on Stripe that succeed on Paystack. This would directly damage the conversion rate for the primary target market.

- **Paystack only:** Strong domestic support. Rejected because international attendees (diaspora, foreign conference speakers) cannot use Paystack. The platform would be unusable for mixed-audience events.

- **Flutterwave:** Supports both domestic and international. Rejected over Paystack because Paystack has a better developer experience, more reliable webhooks, and cleaner documentation for the Nigerian market specifically. Flutterwave could be added as a third option in the future if needed.

- **Payment aggregator / abstraction service:** Services like Mono or a custom PSP router exist. Adds a third-party dependency and fee layer without sufficient benefit for this scope.

## Consequences

### Positive
- Full coverage of the target market: domestic NG/GH users (Paystack) and international/diaspora users (Stripe)
- Demonstrates real-world Africa-specific product thinking — the platform is meaningfully differentiated from Stripe-only competitors
- Resilience: if one PSP has an outage, orders can be routed to the other
- Webhook reliability improves: if Paystack webhooks fail, Stripe orders still confirm correctly, and vice versa

### Negative
- Two SDK integrations to maintain and keep updated
- Two webhook handler paths — each with their own signature verification logic
- Two test mode environments to configure (Stripe test keys + Paystack test keys)
- Two sets of dashboard/reconciliation reports to monitor for refunds and disputes
- QA must cover purchase flows for both PSPs

### Neutral
- Idempotency handling is required regardless of PSP count — the `idempotency_key` column on `orders` handles duplicate webhook delivery from either PSP

## Implementation notes

**Abstraction layer:**

```ts
// lib/services/order.service.ts
async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
  return input.psp === 'stripe'
    ? this.createStripeCheckout(input)
    : this.createPaystackCheckout(input);
}
```

**Webhook verification:**

Stripe uses `stripe.webhooks.constructEvent(rawBody, sig, secret)` — throws `WebhookSignatureVerificationError` on failure.

Paystack uses HMAC-SHA512: `createHmac('sha512', PAYSTACK_SECRET).update(rawBody).digest('hex')`, compared to the `x-paystack-signature` header.

Both webhook handlers call `OrderService.processWebhook()` after verification.

**Idempotency:**

The `orders` table has a `UNIQUE` constraint on `psp_reference`. A second webhook delivery for the same Stripe session or Paystack reference will fail on insert — the handler catches the unique constraint violation and returns 200 without reprocessing. This prevents double-confirmation.

**PSP selection UX:**

On the checkout page, users select between "Pay with Paystack (₦)" and "Pay with Stripe ($)". The selection is passed to `POST /api/v1/checkout` as the `psp` field. Default suggestion is based on the event's primary currency — NGN events default to Paystack, USD events to Stripe.

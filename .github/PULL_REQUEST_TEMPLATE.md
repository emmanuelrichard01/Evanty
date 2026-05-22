## What does this PR do?

<!-- One paragraph. What changed and why. Link the related issue if there is one. -->

Closes #

---

## Type of change

- [ ] Feature (new functionality)
- [ ] Bug fix (fixes broken behaviour)
- [ ] Refactor (no behaviour change)
- [ ] Chore (deps, config, tooling)
- [ ] Documentation

---

## Testing

<!-- What did you do to verify this works? Be specific. -->

- [ ] Unit tests added or updated (`npm run test`)
- [ ] Manually tested in Vercel preview deployment
- [ ] E2E test added or updated (`npm run test:e2e`)

**If this touches the reservation flow, ticket inventory, or webhooks:**

- [ ] Concurrent reservation test run — attach k6 output or describe manual concurrency test
- [ ] Webhook tested with Stripe/Paystack CLI event replay

**Manual test steps:**

1.
2.
3.

---

## Database changes

- [ ] No schema changes
- [ ] Migration generated with `db:generate` and reviewed
- [ ] Migration tested on a Neon branch before this PR

**If yes — is the migration backwards-compatible?** (old app version must run against new schema during rollout)

---

## Checklist

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] No secrets or credentials in this diff
- [ ] If adding a new dependency: justified in PR description (what it does, why not an existing dep)
- [ ] If this changes an architectural decision: ADR updated or new ADR opened

---

## Notes for reviewer

<!-- Anything specific you want eyes on. Tricky logic, performance concern, uncertainty about approach. -->

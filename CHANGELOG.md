# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### In progress
- Phase 1 core platform build

---

## [0.1.0] — Foundation

### Added
- Drizzle ORM schema: `users`, `organizations`, `org_members`, `events`, `ticket_types`, `reservations`, `orders`, `order_items`, `tickets`
- Clerk authentication integration with webhook sync (`/api/webhooks/clerk`)
- Organization creation and member management with role-based access (owner / admin / member)
- Cloudflare R2 signed URL upload flow for event cover images
- Neon PostgreSQL connection with PgBouncer pooling
- BullMQ + Upstash Redis queue configuration
- CI pipeline: lint → typecheck → unit tests → build on every PR
- Structured logger wrapper (Axiom integration)
- Sentry error tracking (frontend + API)
- Health check endpoint: `GET /api/health`
- Pre-commit hooks via Husky: secret scanning, lint-staged

---

<!-- Release links — update as versions ship -->
[Unreleased]: https://github.com/your-username/evanty/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-username/evanty/releases/tag/v0.1.0

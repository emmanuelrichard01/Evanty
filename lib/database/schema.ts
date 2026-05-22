import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  boolean, 
  integer, 
  bigint,
  primaryKey,
  check
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const orgMembers = pgTable('org_members', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // 'owner', 'admin', 'member'
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.orgId] }),
    roleCheck: check('role_check', sql`${table.role} IN ('owner', 'admin', 'member')`),
  };
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  coverUrl: text('cover_url'),
  location: text('location'),
  venueName: text('venue_name'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  timezone: text('timezone').default('Africa/Lagos'),
  status: text('status').default('draft'), // 'draft', 'published', 'cancelled', 'completed'
  categoryId: uuid('category_id').references(() => categories.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  // tsvector search_vector omitted for now, will handle FTS separately if needed
}, (table) => ({
  statusCheck: check('status_check', sql`${table.status} IN ('draft', 'published', 'cancelled', 'completed')`),
}));

export const ticketTypes = pgTable('ticket_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  priceKobo: bigint('price_kobo', { mode: 'number' }).notNull(),
  currency: text('currency').default('NGN'),
  capacity: integer('capacity').notNull(),
  reserved: integer('reserved').default(0).notNull(),
  sold: integer('sold').default(0).notNull(),
  saleStartsAt: timestamp('sale_starts_at', { withTimezone: true }),
  saleEndsAt: timestamp('sale_ends_at', { withTimezone: true }),
  isVisible: boolean('is_visible').default(true),
}, (table) => ({
  capacityCheck: check('capacity_check', sql`${table.reserved} + ${table.sold} <= ${table.capacity}`),
}));

export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  ticketTypeId: uuid('ticket_type_id').references(() => ticketTypes.id).notNull(),
  quantity: integer('quantity').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  status: text('status').default('pending'), // 'pending', 'converted', 'expired'
}, (table) => ({
  statusCheck: check('status_check', sql`${table.status} IN ('pending', 'converted', 'expired')`),
}));

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  psp: text('psp').notNull(), // 'stripe', 'paystack'
  pspReference: text('psp_reference').unique(),
  amountKobo: bigint('amount_kobo', { mode: 'number' }).notNull(),
  currency: text('currency').notNull(),
  status: text('status').default('pending'), // 'pending', 'confirmed', 'refunded', 'failed'
  idempotencyKey: text('idempotency_key').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pspCheck: check('psp_check', sql`${table.psp} IN ('stripe', 'paystack')`),
  statusCheck: check('status_check', sql`${table.status} IN ('pending', 'confirmed', 'refunded', 'failed')`),
}));

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  ticketTypeId: uuid('ticket_type_id').references(() => ticketTypes.id).notNull(),
  qrCode: text('qr_code').unique().notNull(),
  attendeeName: text('attendee_name'),
  attendeeEmail: text('attendee_email'),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  checkedInBy: uuid('checked_in_by').references(() => users.id),
});

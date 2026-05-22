import { db } from '@/lib/database';
import { events, categories, orgMembers, users } from '@/lib/database/schema';
import { eq, ilike, and, desc, count } from 'drizzle-orm';

export class EventRepository {
  async create(data: typeof events.$inferInsert) {
    const [event] = await db.insert(events).values(data).returning();
    return event;
  }

  async getById(id: string) {
    const [event] = await db.select({
      id: events.id,
      orgId: events.orgId,
      title: events.title,
      slug: events.slug,
      description: events.description,
      coverUrl: events.coverUrl,
      location: events.location,
      venueName: events.venueName,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      timezone: events.timezone,
      status: events.status,
      categoryId: events.categoryId,
      createdAt: events.createdAt,
      categoryName: categories.name,
      organizerId: users.id,
      organizerName: users.fullName,
    })
      .from(events)
      .leftJoin(categories, eq(events.categoryId, categories.id))
      .leftJoin(orgMembers, and(eq(events.orgId, orgMembers.orgId), eq(orgMembers.role, 'owner')))
      .leftJoin(users, eq(orgMembers.userId, users.id))
      .where(eq(events.id, id));
    return event;
  }

  async update(id: string, data: Partial<typeof events.$inferInsert>) {
    const [event] = await db.update(events).set(data).where(eq(events.id, id)).returning();
    return event;
  }

  async delete(id: string) {
    const [event] = await db.delete(events).where(eq(events.id, id)).returning();
    return event;
  }

  async getAll({ query, category, limit = 6, page = 1 }: { query?: string, category?: string, limit?: number, page?: number }) {
    const conditions = [];
    if (query) conditions.push(ilike(events.title, `%${query}%`));
    if (category && category !== 'All') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
      if (isUuid) {
        conditions.push(eq(events.categoryId, category));
      } else {
        conditions.push(eq(categories.name, category));
      }
    }

    const offset = (page - 1) * limit;

    const data = await db.select({
      id: events.id,
      orgId: events.orgId,
      title: events.title,
      slug: events.slug,
      description: events.description,
      coverUrl: events.coverUrl,
      location: events.location,
      venueName: events.venueName,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      timezone: events.timezone,
      status: events.status,
      categoryId: events.categoryId,
      createdAt: events.createdAt,
      categoryName: categories.name,
      organizerId: users.id,
      organizerName: users.fullName,
    })
      .from(events)
      .leftJoin(categories, eq(events.categoryId, categories.id))
      .leftJoin(orgMembers, and(eq(events.orgId, orgMembers.orgId), eq(orgMembers.role, 'owner')))
      .leftJoin(users, eq(orgMembers.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(events.startsAt))
      .limit(limit)
      .offset(offset);

    const [{ value: totalCount }] = await db.select({ value: count() })
      .from(events)
      .leftJoin(categories, eq(events.categoryId, categories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      data,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getByOrganizer(orgId: string, limit = 6, page = 1) {
    const offset = (page - 1) * limit;

    const data = await db.select({
      id: events.id,
      orgId: events.orgId,
      title: events.title,
      slug: events.slug,
      description: events.description,
      coverUrl: events.coverUrl,
      location: events.location,
      venueName: events.venueName,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      timezone: events.timezone,
      status: events.status,
      categoryId: events.categoryId,
      createdAt: events.createdAt,
      categoryName: categories.name,
      organizerId: users.id,
      organizerName: users.fullName,
    })
      .from(events)
      .leftJoin(categories, eq(events.categoryId, categories.id))
      .leftJoin(orgMembers, and(eq(events.orgId, orgMembers.orgId), eq(orgMembers.role, 'owner')))
      .leftJoin(users, eq(orgMembers.userId, users.id))
      .where(eq(events.orgId, orgId))
      .orderBy(desc(events.startsAt))
      .limit(limit)
      .offset(offset);

    const [{ value: totalCount }] = await db.select({ value: count() })
      .from(events)
      .leftJoin(categories, eq(events.categoryId, categories.id))
      .where(eq(events.orgId, orgId));

    return {
      data,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}

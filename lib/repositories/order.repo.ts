import { db } from '@/lib/database';
import { orders } from '@/lib/database/schema';
import { eq, and, desc, count, ilike } from 'drizzle-orm';

export class OrderRepository {
  async create(data: typeof orders.$inferInsert) {
    const [order] = await db.insert(orders).values(data).returning();
    return order;
  }

  async getById(id: string) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getByIdempotencyKey(key: string) {
    const [order] = await db.select().from(orders).where(eq(orders.idempotencyKey, key));
    return order;
  }

  async update(id: string, data: Partial<typeof orders.$inferInsert>) {
    const [order] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return order;
  }

  async getByEvent(eventId: string, searchString?: string) {
    // Basic implementation, would normally join users to search by buyer name
    // For now, returning orders directly
    const conditions = [eq(orders.eventId, eventId)];
    
    // If we need to search by buyer name, we'd need a join with users table.
    // Assuming simple query for now.
    const data = await db.select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt));
      
    return data;
  }

  async getByUser(userId: string, limit = 3, page = 1) {
    const offset = (page - 1) * limit;

    const data = await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ value: totalCount }] = await db.select({ value: count() })
      .from(orders)
      .where(eq(orders.userId, userId));

    return {
      data,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}

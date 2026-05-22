import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

export async function createUser(data: { clerkId: string; email: string; fullName: string; avatarUrl?: string }) {
  const [user] = await db.insert(users).values({
    clerkId: data.clerkId,
    email: data.email,
    fullName: data.fullName,
    avatarUrl: data.avatarUrl,
  }).returning();
  return user;
}

export async function updateUser(clerkId: string, data: { fullName: string; avatarUrl?: string }) {
  const [user] = await db.update(users)
    .set({
      fullName: data.fullName,
      avatarUrl: data.avatarUrl,
    })
    .where(eq(users.clerkId, clerkId))
    .returning();
  return user;
}

export async function deleteUser(clerkId: string) {
  const [user] = await db.delete(users)
    .where(eq(users.clerkId, clerkId))
    .returning();
  return user;
}

export async function getUserById(id: string) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

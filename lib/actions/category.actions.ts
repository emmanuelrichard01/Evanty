'use server';

import { db } from '@/lib/database';
import { categories } from '@/lib/database/schema';
import { asc } from 'drizzle-orm';
import { CreateCategoryParams } from '@/types';
import { AppError } from '@/lib/errors';

export async function createCategory({ categoryName }: CreateCategoryParams) {
  try {
    const [category] = await db.insert(categories).values({
      name: categoryName,
    }).returning();
    return JSON.parse(JSON.stringify(category));
  } catch (error) {
    throw new AppError('CREATE_CATEGORY_FAILED', 'Failed to create category', 500, error);
  }
}

export async function getAllCategories() {
  try {
    const data = await db.select().from(categories).orderBy(asc(categories.name));
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    throw new AppError('GET_CATEGORIES_FAILED', 'Failed to get categories', 500, error);
  }
}

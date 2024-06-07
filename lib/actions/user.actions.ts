'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/database';
import User, { IUser } from '@/lib/database/models/user.model';
import Order from '@/lib/database/models/order.model';
import Event from '@/lib/database/models/event.model';
import { handleError } from '@/lib/utils';
import { CreateUserParams, UpdateUserParams } from '@/types';
import { Types } from 'mongoose';

// Utility function to handle database connection
async function withDatabaseConnection<T>(fn: () => Promise<T>): Promise<T> {
  try {
    await connectToDatabase();
    return await fn();
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// Create a new user
export async function createUser(user: CreateUserParams): Promise<IUser | null> {
  return withDatabaseConnection(async () => {
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  });
}

// Get user by ID
export async function getUserById(userId: string): Promise<IUser | null> {
  return withDatabaseConnection(async () => {
    const user = await User.findById(userId).exec();
    if (!user) throw new Error('User not found');
    return JSON.parse(JSON.stringify(user));
  });
}

// Update user by clerk ID
export async function updateUser(clerkId: string, user: UpdateUserParams): Promise<IUser | null> {
  return withDatabaseConnection(async () => {
    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true }).exec();
    if (!updatedUser) throw new Error('User update failed');
    return JSON.parse(JSON.stringify(updatedUser));
  });
}

// Delete user by clerk ID
export async function deleteUser(clerkId: string): Promise<IUser | null> {
  return withDatabaseConnection(async () => {
    const userToDelete = await User.findOne({ clerkId }).exec();
    if (!userToDelete) throw new Error('User not found');


    // Unlink relationships
    await Promise.all([
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } }
      ).exec(),
      Order.updateMany({ _id: { $in: userToDelete.orders } }, { $unset: { buyer: 1 } }).exec(),
    ]);

    const deletedUser = await User.findByIdAndDelete(userToDelete._id).exec();
    revalidatePath('/');
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  });
}


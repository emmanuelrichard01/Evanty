'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/database';
import User, { IUser } from '@/lib/database/models/user.model';
import Order from '@/lib/database/models/order.model';
import Event from '@/lib/database/models/event.model';
import { handleError } from '@/lib/utils';
import { CreateUserParams, UpdateUserParams } from '@/types';

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
    const newUser = await User.create({
      ...user,
      firstName: user.firstName ?? '', // Default to empty string if null
      lastName: user.lastName ?? '', // Default to empty string if null
    });
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
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      {
        ...user,
        firstName: user.firstName ?? '', // Default to empty string if null
        lastName: user.lastName ?? '', // Default to empty string if null
      },
      { new: true }
    ).exec();
    if (!updatedUser) throw new Error('User update failed');
    return JSON.parse(JSON.stringify(updatedUser));
  });
}

// Delete user by clerk ID
export async function deleteUser(clerkId: string): Promise<IUser | null> {
  return withDatabaseConnection(async () => {
    const userToDelete = await User.findOne({ clerkId }).exec();
    if (!userToDelete) throw new Error('User not found');

    const userId = new Types.ObjectId(userToDelete._id); // Convert userId to ObjectId

    // Unlink relationships
    await Promise.all([
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userId } }
      ).exec(),
      Order.updateMany({ _id: { $in: userToDelete.orders } }, { $unset: { buyer: userId } }).exec(),
    ]);

    const deletedUser = await User.findByIdAndDelete(userToDelete._id).exec();
    revalidatePath('/');
    return deletedUser ? deletedUser.toObject() : null;
  });
}


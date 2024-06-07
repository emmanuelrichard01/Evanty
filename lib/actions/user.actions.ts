'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/database';
import User from '@/lib/database/models/user.model';
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
export async function createUser(user: CreateUserParams) {
  return withDatabaseConnection(async () => {
    try {
      const newUser = await User.create(user);
      return JSON.parse(JSON.stringify(newUser));
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('User creation failed');
    }
  });
}

// Get user by ID
export async function getUserById(userId: string) {
  return withDatabaseConnection(async () => {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      return JSON.parse(JSON.stringify(user));
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('User retrieval failed');
    }
  });
}

// Update user by clerk ID
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  return withDatabaseConnection(async () => {
    try {
      const updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });
      if (!updatedUser) throw new Error('User update failed');
      return JSON.parse(JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('User update failed');
    }
  });
}

// Delete user by clerk ID
export async function deleteUser(clerkId: string) {
  return withDatabaseConnection(async () => {
    try {
      const userToDelete = await User.findOne({ clerkId });
      if (!userToDelete) throw new Error('User not found');

      // Unlink relationships
      await Promise.all([
        Event.updateMany(
          { _id: { $in: userToDelete.events } },
          { $pull: { organizer: userToDelete._id } }
        ),
        Order.updateMany({ _id: { $in: userToDelete.orders } }, { $unset: { buyer: 1 } }),
      ]);

      const deletedUser = await User.findByIdAndDelete(userToDelete._id);
      revalidatePath('/');
      return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('User deletion failed');
    }
  });
}

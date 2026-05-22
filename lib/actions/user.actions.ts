'use server';

import { createUser as repoCreateUser, updateUser as repoUpdateUser, deleteUser as repoDeleteUser } from '@/lib/repositories/user.repo';
import { CreateUserParams, UpdateUserParams } from '@/types';

export async function createUser(user: CreateUserParams) {
  try {
    const newUser = await repoCreateUser({
      clerkId: user.clerkId,
      email: user.email,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      avatarUrl: user.photo,
    });
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    throw error;
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    const updatedUser = await repoUpdateUser(clerkId, {
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      avatarUrl: user.photo,
    });
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await repoDeleteUser(clerkId);
  } catch (error) {
    throw error;
  }
}

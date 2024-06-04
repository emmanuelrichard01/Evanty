// lib/authUtils.js
'use server'
import { auth } from '@clerk/nextjs';

export const getUserIdFromSession = async () => {
    const { sessionClaims } = auth();
    return sessionClaims?.userId || null;
};

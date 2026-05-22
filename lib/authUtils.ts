import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/database';
import { users, organizations, orgMembers } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getUserIdFromSession = async () => {
    const { sessionClaims, userId: clerkId } = await auth();
    const sessionUserId = sessionClaims?.userId as string | undefined;
    
    // Validate if session ID matches expected Postgres UUID format
    if (sessionUserId && UUID_REGEX.test(sessionUserId)) {
        return sessionUserId;
    }
    
    // Fallback: Lookup user in database by clerkId
    if (clerkId) {
        try {
            const [dbUser] = await db.select().from(users).where(eq(users.clerkId, clerkId));
            if (dbUser) {
                return dbUser.id;
            }

            // Sync user details from Clerk if authenticated but missing in local DB (dev environment fallback)
            const client = await clerkClient();
            const clerkUser = await client.users.getUser(clerkId);
            if (clerkUser) {
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
                const avatarUrl = clerkUser.imageUrl;

                if (email) {
                    const [newUser] = await db.insert(users).values({
                        clerkId,
                        email,
                        fullName,
                        avatarUrl,
                    }).returning();

                    if (newUser) {
                        // Attempt to update Clerk public metadata so future requests resolve fast
                        try {
                            await client.users.updateUserMetadata(clerkId, {
                                publicMetadata: {
                                    userId: newUser.id,
                                },
                            });
                        } catch (metaErr) {
                            console.error('Error updating Clerk metadata in session sync:', metaErr);
                        }
                        return newUser.id;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching/syncing user from DB in getUserIdFromSession:', error);
        }
    }
    
    return null;
};

export const getOrCreateUserOrg = async (userId: string): Promise<string> => {
    // 1. Check if user already has an organization membership
    const [existingMember] = await db
        .select()
        .from(orgMembers)
        .where(eq(orgMembers.userId, userId))
        .limit(1);

    if (existingMember) {
        return existingMember.orgId;
    }

    // 2. Query user details to set a nice organization name
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const orgName = user?.fullName ? `${user.fullName}'s Workspace` : 'Personal Workspace';
    
    // Generate a unique slug
    const baseSlug = user?.fullName
        ? user.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : 'workspace';
    const randSuffix = Math.random().toString(36).substring(2, 6);
    const orgSlug = `${baseSlug}-org-${randSuffix}`;

    // Insert new organization
    const [newOrg] = await db.insert(organizations).values({
        name: orgName,
        slug: orgSlug,
    }).returning();

    // Add user as owner of this new organization
    await db.insert(orgMembers).values({
        userId,
        orgId: newOrg.id,
        role: 'owner',
    });

    return newOrg.id;
};


// src/lib/auth/rbac.ts
import { auth } from "@clerk/nextjs/server";
import { User } from "@/lib/db/models/user.model";
import { UserRole, Permission, PERMISSIONS } from "./types";
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export const rolePermissions: Record<UserRole, Permission[]> = {
  ADMIN: [{ action: '*', resource: '*' }],
  ORGANIZER: [
    { action: PERMISSIONS.EVENTS.CREATE, resource: 'event' },
    { action: PERMISSIONS.EVENTS.UPDATE, resource: 'event' },
    { action: PERMISSIONS.EVENTS.DELETE, resource: 'event' },
    { action: PERMISSIONS.EVENTS.MANAGE_GUESTS, resource: 'guests' }
  ],
  CO_HOST: [
    { action: PERMISSIONS.EVENTS.UPDATE, resource: 'event' },
    { action: PERMISSIONS.EVENTS.MANAGE_GUESTS, resource: 'guests' }
  ],
  ATTENDEE: [
    { action: PERMISSIONS.EVENTS.READ, resource: 'event' }
  ]
};

export async function getUserRole(): Promise<UserRole> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Try cache first
  const cachedRole = await redis.get(`user_role:${userId}`);
  if (cachedRole) return cachedRole as UserRole;

  // If not in cache, check database
  const user = await User.findOne({ clerkId: userId }).select('role');
  if (!user) {
    // Create user if doesn't exist
    const newUser = await User.create({
      clerkId: userId,
      role: UserRole.ATTENDEE
    });
    return newUser.role;
  }

  // Cache the role for 1 hour
  await redis.setex(`user_role:${userId}`, 3600, user.role);
  return user.role;
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  try {
    const role = await getUserRole();
    const permissions = rolePermissions[role];

    return permissions.some(p => 
      (p.action === '*' && p.resource === '*') ||
      (p.action === permission.action && p.resource === permission.resource)
    );
  } catch {
    return false;
  }
}
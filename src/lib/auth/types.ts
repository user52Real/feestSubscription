export enum UserRole {
    ADMIN = 'ADMIN',
    ORGANIZER = 'ORGANIZER',
    CO_HOST = 'CO_HOST',
    ATTENDEE = 'ATTENDEE'
}
  
export interface Permission {
    action: string;
    resource: string;
}
  
export const PERMISSIONS = {
    EVENTS: {
      CREATE: 'events:create',
      READ: 'events:read',
      UPDATE: 'events:update',
      DELETE: 'events:delete',
      MANAGE_GUESTS: 'events:manage_guests'
    },
    ADMIN: {
      MANAGE_USERS: 'admin:manage_users',
      MANAGE_ROLES: 'admin:manage_roles'
    }
} as const;
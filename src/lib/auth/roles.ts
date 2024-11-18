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
  
export const rolePermissions: Record<UserRole, Permission[]> = {
    ADMIN: [
      { action: '*', resource: '*' }
    ],
    ORGANIZER: [
      { action: 'create', resource: 'event' },
      { action: 'update', resource: 'event' },
      { action: 'delete', resource: 'event' },
      { action: 'manage', resource: 'guests' },
      { action: 'export', resource: 'data' }
    ],
    CO_HOST: [
      { action: 'update', resource: 'event' },
      { action: 'manage', resource: 'guests' }
    ],
    ATTENDEE: [
      { action: 'view', resource: 'event' },
      { action: 'chat', resource: 'event' }
    ]
}
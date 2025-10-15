// Utilidades para manejo de roles
import { UserRole } from '../types/auth';

export const ROLE_LABELS = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.EXTERNAL]: 'Usuario Externo',
  [UserRole.COLLABORATOR]: 'Estudiante',
} as const;

export const ROLE_DESCRIPTIONS = {
  [UserRole.ADMIN]: 'Puede gestionar usuarios, proyectos y organizaciones',
  [UserRole.EXTERNAL]: 'Puede crear y gestionar sus propios proyectos',
  [UserRole.COLLABORATOR]: 'Puede ver y participar en proyectos académicos',
} as const;

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: [
    'manage_users',
    'manage_organizations',
    'manage_projects',
    'view_dashboard',
    'create_organizations',
    'delete_users',
    'update_user_status',
  ],
  [UserRole.EXTERNAL]: [
    'create_projects',
    'view_own_projects',
    'update_own_projects',
  ],
  [UserRole.COLLABORATOR]: [
    'view_academic_projects',
    'participate_in_projects',
    'view_academic_dashboard',
  ],
} as const;

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] || 'Rol Desconocido';
}

export function getRoleDescription(role: UserRole): string {
  return ROLE_DESCRIPTIONS[role] || 'Descripción no disponible';
}

export function getRolePermissions(role: UserRole): readonly string[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = getRolePermissions(userRole);
  return permissions.includes(permission);
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

export function isExternal(role: UserRole): boolean {
  return role === UserRole.EXTERNAL;
}

export function isCollaborator(role: UserRole): boolean {
  return role === UserRole.COLLABORATOR;
}

export function getRoleFromUrlParam(roleParam: string | null): UserRole | null {
  if (!roleParam) return null;
  
  const roleNumber = parseInt(roleParam, 10);
  
  if (roleNumber === UserRole.ADMIN) return UserRole.ADMIN;
  if (roleNumber === UserRole.EXTERNAL) return UserRole.EXTERNAL;
  if (roleNumber === UserRole.COLLABORATOR) return UserRole.COLLABORATOR;
  
  return null;
}

export function validateRole(role: UserRole): boolean {
  return Object.values(UserRole).includes(role);
}

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return '/create-organization';
    case UserRole.EXTERNAL:
      return '/dashboard/external';
    case UserRole.COLLABORATOR:
      return '/dashboard/academic';
    default:
      return '/dashboard';
  }
}
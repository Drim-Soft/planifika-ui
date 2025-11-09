// Utilidades para manejo de roles
import { UserRole } from '../types/auth';

export const ROLE_LABELS = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.EXTERNAL]: 'Usuario Externo',
  [UserRole.COLLABORATOR]: 'Estudiante',
  [UserRole.SUPERUSER]: 'Superusuario',
} as const;

export const ROLE_DESCRIPTIONS = {
  [UserRole.ADMIN]: 'Puede gestionar usuarios, proyectos y organizaciones',
  [UserRole.EXTERNAL]: 'Puede crear y gestionar sus propios proyectos',
  [UserRole.COLLABORATOR]: 'Puede ver y participar en proyectos académicos',
  [UserRole.SUPERUSER]: 'Acceso completo a proyectos, fases y tareas',
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
  [UserRole.SUPERUSER]: [
    'manage_all_projects',
    'manage_all_phases',
    'manage_all_tasks',
    'view_all_dashboards',
    'full_crud_access',
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

export function isSuperuser(role: UserRole): boolean {
  return role === UserRole.SUPERUSER;
}

export function getRoleFromUrlParam(roleParam: string | null): UserRole | null {
  if (!roleParam) return null;
  
  const roleNumber = parseInt(roleParam, 10);
  
  if (roleNumber === UserRole.ADMIN) return UserRole.ADMIN;
  if (roleNumber === UserRole.EXTERNAL) return UserRole.EXTERNAL;
  if (roleNumber === UserRole.COLLABORATOR) return UserRole.COLLABORATOR;
  if (roleNumber === UserRole.SUPERUSER) return UserRole.SUPERUSER;
  
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
    case UserRole.SUPERUSER:
      return '/dashboard/admin';
    default:
      return '/dashboard';
  }
}

// app/utils/roleUtils.ts

export const hasAdminProjectRole = (role: unknown, realRoleId?: number): boolean => {
  try {
    const adminIds = [21, 22, 23, 24];

    // Caso 1: rol real numérico (viene de la BD)
    if (typeof realRoleId === "number") {
      return adminIds.includes(realRoleId);
    }

    // Caso 2: rol numérico general
    if (typeof role === "number") {
      return adminIds.includes(role);
    }

    // Caso 3: texto u objeto (por si viene con nombre)
    const raw =
      typeof role === "string"
        ? role
        : (role as any)?.name ?? (role as any)?.rolename ?? "";
    const normalized = raw.trim().toLowerCase();
    return normalized.includes("administrador proyecto");
  } catch {
    return false;
  }
};

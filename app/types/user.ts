// Tipos para usuario y organización
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  photoUrl?: string;
  role: UserRole;
  status: UserStatus;
  organizationId?: number;
  supabaseUserId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRole {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

export interface UserStatus {
  id: number;
  name: string;
  description: string;
}

export interface Organization {
  id: number;
  name: string;
  nit: string;
  address?: string;
  phone?: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserOrganization {
  userId: number;
  organizationId: number;
  role: string;
  joinedAt: string;
}

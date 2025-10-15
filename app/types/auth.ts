// Tipos para autenticación y roles
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  photoUrl?: string;
  role: UserRole;
}

export interface SignupResponse {
  auth: {
    user: {
      id: string;
      email: string;
    };
    session?: {
      access_token: string;
      refresh_token: string;
    };
  };
  db: {
    iduser: number;
    name: string;
    photourl?: string;
    iduserstatus: number;
    idusertype: number;
    idorganization?: number;
    supabaseuserid: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
}

// Respuesta del endpoint /auth/me
export interface UserInfoResponse {
  userId: number;
  name: string;
  role: string;
  email: string;
  photoUrl?: string;
  idusertype: number;
  iduserstatus: number;
  idorganization?: number;
  userType?: number; // Agregar userType como campo opcional
}

export interface User {
  id: number;
  name: string;
  email: string;
  photoUrl?: string;
  role: UserRole;
  status: UserStatus;
  organizationId?: number;
  supabaseUserId: string;
}

export enum UserRole {
  ADMIN = 1,
  EXTERNAL = 2,
  COLLABORATOR = 3 // Estudiante/Colaborador
}

export enum UserStatus {
  ACTIVE = 1,
  DELETED = 2
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (data: SignupRequest) => Promise<SignupResponse>;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  externalLogin: (data: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  error: AuthError | null;
}

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../services/authService';
import { SignupRequest, SignupResponse, LoginRequest, LoginResponse, User, UserRole, UserInfoResponse, AuthError, AuthContextType } from '../types/auth';
import { getDefaultRouteForRole } from '../utils/roleUtils';

// Helper pequeño para formatear un email como nombre si backend no devuelve name
function formatEmailToName(email?: string | null): string {
  if (!email) return '';
  try {
    const local = email.split('@')[0];
    // Reemplazar puntos/underscores por espacios y capitalizar palabras
    const parts = local.split(/\.|_|-/).filter(Boolean);
    const name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    return name;
  } catch {
    return email;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('planifika_user');
        const storedToken = localStorage.getItem('planifika_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('planifika_user');
        localStorage.removeItem('planifika_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  const signup = async (data: SignupRequest): Promise<SignupResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.signup(data);
      
      // Crear objeto usuario desde la respuesta
      const newUser: User = {
        id: response.db.iduser,
        name: response.db.name,
        email: response.auth.user.email,
        photoUrl: response.db.photourl,
        role: data.role, // Usar el rol que se envió en la petición
        status: response.db.iduserstatus,
        organizationId: response.db.idorganization,
        supabaseUserId: response.db.supabaseuserid,
      };

      // Guardar en localStorage
      localStorage.setItem('planifika_user', JSON.stringify(newUser));
      if (response.auth.session?.access_token) {
        localStorage.setItem('planifika_token', response.auth.session.access_token);
      }

      setUser(newUser);

      // Redireccionar según el rol
      const defaultRoute = getDefaultRouteForRole(newUser.role);
      router.push(defaultRoute);

      return response;
    } catch (error) {
      const authError: AuthError = {
        message: error instanceof Error ? error.message : 'Error desconocido durante el registro',
        code: 'SIGNUP_ERROR'
      };
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(data);
      console.log('Login response:', response);
      
      // Obtener información del usuario
      let userInfo = await authService.getCurrentUser(response.access_token);
      console.log('=== DEBUG USER INFO ===');
      console.log('User info from /auth/me:', userInfo);
      console.log('userType field:', userInfo.userType);
      console.log('idusertype field:', userInfo.idusertype);
      console.log('role field:', userInfo.role);
      console.log('All userInfo keys:', Object.keys(userInfo));
      console.log('========================');
      
      // Si no tenemos el userType/idusertype, intentar obtenerlo por otros métodos
      if (!userInfo.userType && !userInfo.idusertype) {
        console.log('userType/idusertype not found, trying alternative methods...');
        
        // Intentar por Supabase ID
        if (response.user?.id) {
          try {
            console.log('Trying to get user info by Supabase ID:', response.user.id);
            const fullUserInfo = await authService.getUserBySupabaseId(response.user.id, response.access_token);
            console.log('Full user info by Supabase ID:', fullUserInfo);
            
            // Combinar la información
            userInfo = {
              ...userInfo,
              ...fullUserInfo,
              userType: fullUserInfo.userType || fullUserInfo.idusertype,
              idusertype: fullUserInfo.idusertype || fullUserInfo.userType
            };
          } catch (error) {
            console.warn('Could not get user info by Supabase ID:', error);
          }
        }
        
        // Si aún no tenemos el userType, intentar con /users/me
        if (!userInfo.userType && !userInfo.idusertype) {
          try {
            console.log('Trying to get user info with /users/me');
            const altUserInfo = await authService.getUserInfo(response.access_token);
            console.log('User info from /users/me:', altUserInfo);
            
            // Combinar la información
            userInfo = {
              ...userInfo,
              ...altUserInfo,
              userType: altUserInfo.userType || altUserInfo.idusertype,
              idusertype: altUserInfo.idusertype || altUserInfo.userType
            };
          } catch (error) {
            console.warn('Could not get user info with /users/me:', error);
          }
        }
        
        // Si aún no tenemos el userType, intentar por email
        if (!userInfo.userType && !userInfo.idusertype && userInfo.email) {
          try {
            console.log('Trying to get user info by email:', userInfo.email);
            const emailUserInfo = await authService.getUserByEmail(userInfo.email, response.access_token);
            console.log('User info from email lookup:', emailUserInfo);
            
            // Combinar la información
            userInfo = {
              ...userInfo,
              ...emailUserInfo,
              userType: emailUserInfo.userType || emailUserInfo.idusertype,
              idusertype: emailUserInfo.idusertype || emailUserInfo.userType
            };
          } catch (error) {
            console.warn('Could not get user info by email:', error);
          }
        }
      }
      
      // Determinar el role correcto
      const userRoleValue = userInfo.userType || userInfo.idusertype;
      console.log('Raw userRoleValue from backend:', userRoleValue);
      console.log('Type of userRoleValue:', typeof userRoleValue);
      
      // Mapear userType del backend a UserRole enum
      let finalRole: UserRole;
      if (userRoleValue !== undefined && userRoleValue !== null) {
        const roleNumber = Number(userRoleValue);
        // Mapear explícitamente los valores conocidos
        if (roleNumber === 1) {
          finalRole = UserRole.ADMIN;
        } else if (roleNumber === 2) {
          finalRole = UserRole.EXTERNAL;
        } else if (roleNumber === 3) {
          finalRole = UserRole.COLLABORATOR;
        } else if (roleNumber === 4) {
          finalRole = UserRole.SUPERUSER;
        } else {
          // Si es un valor desconocido, intentar cast directo
          finalRole = roleNumber as UserRole;
        }
      } else {
        // TEMPORAL: Asumir EXTERNAL (2) por defecto para usuarios que no son admin
        // Esto debería ser reemplazado por una consulta correcta al backend
        console.warn('⚠️  userType no encontrado en /auth/me - usando EXTERNAL como fallback');
        console.warn('🔧 PROBLEMA DEL BACKEND: El endpoint /auth/me debe devolver userType de la BD');
        finalRole = UserRole.EXTERNAL; // Usar EXTERNAL como fallback
      }
      
      // Crear objeto usuario
      const userData: User = {
        id: userInfo.userId || 0,
        name: userInfo.name || '',
        email: userInfo.email || '',
  photoUrl: (userInfo.photoUrl || '').trim(),
        role: finalRole,
        status: userInfo.iduserstatus || 1,
        organizationId: userInfo.idorganization || undefined,
        supabaseUserId: (userInfo.userId || 0).toString(),
      };
      
      console.log('Final user data:', userData);
      console.log('Final role value:', userData.role);

      // Guardar en localStorage
      localStorage.setItem('planifika_user', JSON.stringify(userData));
      localStorage.setItem('planifika_token', response.access_token);

      setUser(userData);

      // Redireccionar según el rol
      const defaultRoute = getDefaultRouteForRole(userData.role);
      router.push(defaultRoute);

      return response;
    } catch (error) {
      const authError: AuthError = {
        message: error instanceof Error ? error.message : 'Error desconocido durante el login',
        code: 'LOGIN_ERROR'
      };
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  const externalLogin = async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Iniciando login externo para estudiante...');
      const response = await authService.externalLogin(data);
      console.log('External login response:', response);
      
      console.log('=== VERIFICANDO RESPUESTA DE LOGIN ===');
      console.log('¿Tiene user?', response.user ? 'SÍ' : 'NO');
      console.log('¿Tiene access_token?', response.access_token ? 'SÍ' : 'NO');
      console.log('Response.user completo:', response.user);
      console.log('=====================================');
      
      // El backend ya devuelve los datos del usuario directamente en response.user
      // No necesitamos hacer una consulta adicional
      let userInfo: any = response.user;
      
      console.log('=== DATOS DEL USUARIO OBTENIDOS ===');
      console.log('userInfo:', userInfo);
      console.log('idUser:', userInfo?.idUser);
      console.log('name:', userInfo?.name);
      console.log('email:', userInfo?.email);
      console.log('photoUrl:', userInfo?.photoUrl);
      console.log('idUserType:', userInfo?.idUserType);
      console.log('idUserStatus:', userInfo?.idUserStatus);
      console.log('idOrganization:', userInfo?.idOrganization);
      console.log('===================================');
      
      // Verificar que tenemos los datos necesarios
      if (!userInfo || !userInfo.idUser) {
        console.error('=== ERROR: DATOS DE USUARIO INCOMPLETOS ===');
        console.error('userInfo:', userInfo);
        console.error('===========================================');
        throw new Error('No se obtuvieron los datos completos del usuario');
      }
      
      // Determinar el role correcto
      const userRoleValue = userInfo.idUserType;
      console.log('Raw userRoleValue from backend:', userRoleValue);
      
      let finalRole: UserRole;
      if (userRoleValue !== undefined && userRoleValue !== null) {
        const roleNumber = Number(userRoleValue);
        // Mapear explícitamente los valores conocidos
        if (roleNumber === 1) {
          finalRole = UserRole.ADMIN;
        } else if (roleNumber === 2) {
          finalRole = UserRole.EXTERNAL;
        } else if (roleNumber === 3) {
          finalRole = UserRole.COLLABORATOR;
        } else if (roleNumber === 4) {
          finalRole = UserRole.SUPERUSER;
        } else {
          // Si es un valor desconocido, intentar cast directo
          finalRole = roleNumber as UserRole;
        }
      } else {
        // Fallback para estudiantes externos
        finalRole = UserRole.COLLABORATOR;
      }
      

        // Usar el usuario y token retornados por el backend
        // El backend debe retornar: { user: { ... }, access_token: '...' }
        const backendUser = response.user as any;
        // Resolver ID de Planifika con múltiples variantes
        let resolvedId: number =
          backendUser?.idPlanifikaUser ||
          backendUser?.idUser ||
          backendUser?.iduser ||
          (typeof backendUser?.id === 'number' ? backendUser.id : 0) ||
          0;

        // Resolver supabaseUserId (UUID)
        const resolvedSupabaseUserId: string =
          backendUser?.supabaseUserId ||
          backendUser?.supabaseuserid ||
          (typeof backendUser?.id === 'string' ? backendUser.id : '') ||
          '';

        console.log('[externalLogin] backendUser recibido:', backendUser);
        console.log('[externalLogin] resolvedId inicial:', resolvedId, 'resolvedSupabaseUserId:', resolvedSupabaseUserId);

        // Si el ID de Planifika vino en 0, intentar recuperarlo por Supabase ID
        if ((!resolvedId || resolvedId === 0) && resolvedSupabaseUserId) {
          try {
            console.log('Intentando obtener id de Planifika por supabaseUserId:', resolvedSupabaseUserId);
            const fullUserInfo = await authService.getUserBySupabaseId(resolvedSupabaseUserId, response.access_token);
            resolvedId = fullUserInfo?.iduser || fullUserInfo?.idUser || fullUserInfo?.id || resolvedId || 0;
            console.log('[externalLogin] Resuelto id por Supabase ID:', resolvedId, 'fullUserInfo:', fullUserInfo);
          } catch (e) {
            console.warn('No se pudo resolver el id de Planifika por Supabase ID:', e);
          }
        }

        // Si aún no tenemos ID, intentar por email
        if ((!resolvedId || resolvedId === 0) && (backendUser?.email || data.email)) {
          try {
            const emailToQuery = backendUser?.email || data.email;
            console.log('Intentando obtener id de Planifika por email:', emailToQuery);
            const emailUserInfo = await authService.getUserByEmail(emailToQuery, response.access_token);
            resolvedId = emailUserInfo?.iduser || emailUserInfo?.idUser || emailUserInfo?.id || resolvedId || 0;
            console.log('[externalLogin] Resuelto id por email:', resolvedId, 'emailUserInfo:', emailUserInfo);
          } catch (e) {
            console.warn('No se pudo resolver el id de Planifika por email:', e);
          }
        }

        const userData: User = {
          id: resolvedId || 0,
          name: backendUser?.name || formatEmailToName(data.email),
          email: backendUser?.email || data.email,
          photoUrl: (backendUser?.photoUrl || '').trim(),
          role: finalRole,
          status: backendUser?.iduserstatus || backendUser?.idUserStatus || 1,
          organizationId: backendUser?.idorganization || backendUser?.idOrganization || undefined,
          supabaseUserId: resolvedSupabaseUserId || '0',
        };

        if (!userData.id || userData.id === 0) {
          console.warn('[externalLogin] ⚠️ El ID final del usuario sigue siendo 0. Revisa backend mapping de user.id/idUser.');
        } else {
          console.log('[externalLogin] ✅ ID final de usuario resuelto:', userData.id);
        }

        console.log('Final external user data:', userData);
        console.log('Final role value:', userData.role);

        // Guardar en localStorage
        localStorage.setItem('planifika_user', JSON.stringify(userData));
        localStorage.setItem('planifika_token', response.access_token);

        setUser(userData);

        // Redireccionar al dashboard académico
        router.push('/dashboard/academic');

        return response;
    } catch (error) {
      const authError: AuthError = {
        message: error instanceof Error ? error.message : 'Error desconocido durante el login externo',
        code: 'EXTERNAL_LOGIN_ERROR'
      };
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      console.log('Iniciando logout...');
      
      // Limpiar localStorage completamente
      localStorage.removeItem('planifika_user');
      localStorage.removeItem('planifika_token');
      
      // Limpiar cualquier otro dato relacionado con la sesión
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('planifika_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removido del localStorage: ${key}`);
      });
      
      // Limpiar estado
      setUser(null);
      setError(null);
      setIsLoading(false);
      
      console.log('Logout completado, redirigiendo...');
      
      // Redirigir a la página principal
      router.push('/');
    } catch (error) {
      console.error('Error durante logout:', error);
      // Aún así limpiar el estado local
      setUser(null);
      setError(null);
      router.push('/');
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Permite actualizar parcialmente el usuario en memoria/localStorage
  const updateUser = (partial: Partial<User>) => {
    setUser((prev: User | null) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial } as User;
      try {
        localStorage.setItem('planifika_user', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signup,
    login,
    externalLogin,
    logout,
    error,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

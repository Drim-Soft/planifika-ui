"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../services/authService';
import { SignupRequest, SignupResponse, LoginRequest, LoginResponse, User, UserRole, UserInfoResponse, AuthError, AuthContextType } from '../types/auth';
import { getDefaultRouteForRole } from '../utils/roleUtils';

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
      
      // SOLUCIÓN TEMPORAL: Si no tenemos userType del backend, usar un valor por defecto
      // TODO: Esto debe ser corregido en el backend - el endpoint /auth/me debe devolver userType
      let finalRole: UserRole;
      if (userRoleValue !== undefined && userRoleValue !== null) {
        finalRole = userRoleValue as UserRole;
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
        photoUrl: userInfo.photoUrl || '',
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
      
      // Para login externo, no intentar obtener info del usuario con /auth/me
      // porque el token de Supabase SIU no es compatible con ese endpoint
      // En su lugar, usar la información básica del email
      
      // Para login externo (estudiantes), forzar userType 3 (COLLABORATOR)
      const finalRole = UserRole.COLLABORATOR; // Siempre 3 para estudiantes
      console.log('Forzando role COLLABORATOR (3) para login externo de estudiante');
      
      // Función para convertir email prefix a nombre legible
      const formatEmailToName = (email: string): string => {
        const prefix = email.split('@')[0];
        if (!prefix) return 'Usuario Externo';
        
        // Convertir guiones bajos y puntos a espacios
        const formatted = prefix
          .replace(/[._]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        return formatted || 'Usuario Externo';
      };
      
      // Crear objeto usuario con información básica
      const userData: User = {
        id: 0, // ID temporal, se actualizará cuando se cree el usuario en la BD
        name: formatEmailToName(data.email), // Convertir email a nombre legible
        email: data.email,
        photoUrl: '',
        role: finalRole,
        status: 1, // ACTIVE
        organizationId: undefined,
        supabaseUserId: response.user?.id || '0',
      };
      
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

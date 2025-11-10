"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { getDefaultRouteForRole } from '../utils/roleUtils';

interface UseAuthRedirectOptions {
  redirectIfAuthenticated?: boolean;
  requiredRole?: UserRole;
  fallbackRoute?: string;
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { redirectIfAuthenticated = false, requiredRole, fallbackRoute = '/' } = options;

  useEffect(() => {
    if (!isLoading) {
      // Si está autenticado y se debe redirigir
      if (isAuthenticated && user && redirectIfAuthenticated) {
        const defaultRoute = getDefaultRouteForRole(user.role);
        router.push(defaultRoute);
        return;
      }

      // Si no está autenticado y se requiere autenticación
      if (!isAuthenticated && !redirectIfAuthenticated) {
        router.push('/pages/admin-login');
        return;
      }

      // Si está autenticado pero no tiene el rol requerido
      if (isAuthenticated && user && requiredRole && user.role !== requiredRole) {
        router.push(fallbackRoute);
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, redirectIfAuthenticated, requiredRole, fallbackRoute, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    hasRequiredRole: requiredRole ? user?.role === requiredRole : true
  };
}

"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import { hasPermission } from '../utils/roleUtils';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallbackRoute?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallbackRoute = '/'
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado, redirigir al login
      if (!isAuthenticated || !user) {
        router.push('/pages/admin-login');
        return;
      }

      // Si se requiere un rol específico
      if (requiredRole && user.role !== requiredRole) {
        router.push(fallbackRoute);
        return;
      }

      // Si se requiere un permiso específico
      if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
        router.push(fallbackRoute);
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, requiredPermission, fallbackRoute, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando acceso..." />
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Si no tiene el rol requerido, no mostrar nada (se redirigirá)
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  // Si no tiene el permiso requerido, no mostrar nada (se redirigirá)
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return null;
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return <>{children}</>;
}

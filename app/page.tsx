"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./contexts/AuthContext";
import { UserRole } from "./types/auth";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirigir usuarios autenticados según su rol
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === UserRole.SUPERUSER) {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard');
      }
    } else if (!isLoading && !isAuthenticated) {
      // Redirigir a login si no está autenticado
      router.push('/pages/student-login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Mostrar loading mientras se verifica la autenticación y se redirige
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo al login...</p>
      </div>
    </div>
  );
}

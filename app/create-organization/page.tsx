"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


export default function CreateOrganization() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  // Verificar autenticación y rol
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    if (!user) return;
    // Si es admin y ya tiene organización, no debe estar aquí
    if (user.role === UserRole.ADMIN && user.organizationId) {
      router.push('/dashboard/admin');
      return;
    }
    // Otros roles redirigidos fuera
    if (user.role !== UserRole.ADMIN) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Nota: Se removió la creación de organización aquí según solicitud.

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado o no es admin, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user || user.role !== UserRole.ADMIN) {
    return null;
  }

  // Si es admin y NO tiene organización, mostrar página informativa
  if (user.role === UserRole.ADMIN && !user.organizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">No tienes plan aún</h2>
          <p className="text-gray-600 mb-6">
            Para comenzar, necesitas seleccionar o crear un plan. Puedes ver los planes disponibles haciendo clic en el botón de abajo.
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 mb-4"
            onClick={() => {
              window.location.href = "https://traducianistic-immorally-harmony.ngrok-free.dev/plans";
            }}
          >
            Ver Planes
          </button>
        </div>
      </div>
    );
  }

  // Si es admin y ya tiene organización, mostrar el contenido normal (no debería llegar aquí por el guard, pero por si acaso)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Ya tienes una organización registrada.</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          onClick={() => router.push('/dashboard/admin')}
        >
          Ir al Dashboard
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth";
import { getRoleLabel } from "../utils/roleUtils";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CreateProject() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Verificar autenticación y rol
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/pages/admin-login');
      return;
    }

    if (user && user.role !== UserRole.EXTERNAL) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleCreateProject = async () => {
    setIsLoading(true);
    // Aquí se implementará la lógica para crear proyectos
    setTimeout(() => {
      setIsLoading(false);
      alert('Funcionalidad de crear proyecto en desarrollo');
    }, 1000);
  };

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando acceso..." />
      </div>
    );
  }

  // Si no está autenticado o no es usuario externo, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user || user.role !== UserRole.EXTERNAL) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo borroso */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#f3f4f6',
          filter: 'blur(2px)'
        }}
      ></div>
      
      {/* Contenido principal nítido */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🚀</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Crear Proyecto
              </h1>
              <p className="text-lg text-gray-600">
                Gestiona tus proyectos de manera eficiente
              </p>
            </div>

            {/* Información del usuario */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Usuario:</strong> {user.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Email: {user.email} | Rol: {getRoleLabel(user.role)}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  🚪 Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="space-y-6">
              
              {/* Información de permisos */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <div className="text-yellow-600 mr-2">ℹ️</div>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Permisos de Usuario Externo</p>
                    <p className="text-xs">
                      Como usuario externo, puedes crear y gestionar tus propios proyectos. 
                      No tienes acceso a funciones administrativas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón para crear proyecto */}
              <div className="text-center">
                <button
                  onClick={handleCreateProject}
                  disabled={isLoading}
                  className="w-full planifika-button-primary text-lg py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Creando proyecto...</span>
                    </div>
                  ) : (
                    '🚀 Crear Nuevo Proyecto'
                  )}
                </button>
              </div>

              {/* Lista de proyectos (placeholder) */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Mis Proyectos</h3>
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📁</div>
                  <p>No tienes proyectos creados aún</p>
                  <p className="text-sm">Usa el botón de arriba para crear tu primer proyecto</p>
                </div>
              </div>

            </div>

            {/* Enlaces adicionales */}
            <div className="mt-8 text-center">
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Volver al Inicio
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

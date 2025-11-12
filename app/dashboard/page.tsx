"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth";
import { getRoleLabel } from "../utils/roleUtils";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingTasks: 0
  });

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Redirigir según el rol del usuario (admin con organización va a dashboard/admin)
  useEffect(() => {
    if (!user) return;
    // Evitar redirigir si ya estamos en la ruta destino
    const go = (target: string) => {
      if (pathname === target) return; // Ya estamos donde queremos
      router.replace(target); // replace para evitar historial de saltos
    };
    if (user.role === UserRole.ADMIN) {
      go(user.organizationId ? '/dashboard/admin' : '/create-organization');
      return;
    }
    if (user.role === UserRole.EXTERNAL) {
      go('/dashboard/external');
      return;
    }
    if (user.role === UserRole.COLLABORATOR) {
      go('/dashboard/academic');
      return;
    }
    if (user.role === UserRole.SUPERUSER) {
      go('/dashboard/admin');
      return;
    }
  }, [user, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Se redirigirá automáticamente
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Image
                src="/assets/images/planifika_logo.png"
                alt="Planifika Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  <span className="text-yellow-500">Planifika</span>
                </h1>
                <p className="text-sm text-gray-600">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Foto de perfil */}
              {user.photoUrl ? (
                user.photoUrl.startsWith('http') ? (
                  <img
                    src={user.photoUrl}
                    alt="Foto de perfil"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                ) : (
                  <Image
                    src={user.photoUrl}
                    alt="Foto de perfil"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                )
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">?</div>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
              </div>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user.name}!
          </h2>
          <p className="text-gray-600">
            Aquí puedes gestionar tus proyectos y ver el progreso de tus actividades.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="text-2xl">📊</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="text-2xl">🚀</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="text-2xl">✅</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedProjects}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <div className="text-2xl">⏳</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secciones principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mis Proyectos */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Mis Proyectos</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📁</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes proyectos aún
                </h4>
                <p className="text-gray-600 mb-6">
                  Comienza creando tu primer proyecto académico.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                  Crear Proyecto
                </button>
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📈</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Sin actividad reciente
                </h4>
                <p className="text-gray-600">
                  Tu actividad aparecerá aquí cuando comiences a trabajar en proyectos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <div className="text-xl">➕</div>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Nuevo Proyecto</p>
                <p className="text-sm text-gray-600">Crear un proyecto académico</p>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <div className="text-xl">📋</div>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Ver Tareas</p>
                <p className="text-sm text-gray-600">Gestionar mis tareas</p>
              </div>
            </button>

            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <div className="text-xl">📊</div>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Reportes</p>
                <p className="text-sm text-gray-600">Ver estadísticas</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

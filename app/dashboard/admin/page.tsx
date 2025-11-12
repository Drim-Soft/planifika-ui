"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/auth";
import { projectService } from "../../services/projectService";
import { Project } from "../../types/project";
import SidebarProfile from "../../components/SidebarProfile";
import { userService } from "../../services/userService";
import { organizationService } from "../../services/organizationService";
import CreateProjectForm from "../../components/CreateProjectForm";
import ProjectDetailsModal from "../../components/ProjectDetailsModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ProjectEditModal from "../academic/components/ProjectEditModal";

// IDs de roles de administrador de proyecto para acceso completo
const ADMIN_PROJECT_ROLE_IDS = [21, 22, 23, 24];

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingAllProjects, setIsLoadingAllProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editProject, setEditProject] = useState<any>(null);
  const [deleteProject, setDeleteProject] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingProjects: 0
  });
  const [orgUserCount, setOrgUserCount] = useState<number | null>(null);
  const [isLoadingOrgUsers, setIsLoadingOrgUsers] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Guard de acceso: permitir SUPERUSER siempre; permitir ADMIN solo si tiene organización.
  // Evitar loops usando pathname y router.replace (no añade al historial).
  const pathname = usePathname();
  // Guard más estable: esperar a que termine carga y no saltar al dashboard genérico.
  const hasGuardRun = useRef(false);
  useEffect(() => {
    if (hasGuardRun.current) return; // correr una sola vez para evitar ruido en StrictMode
    if (isLoading) return; // esperar a carga inicial
    if (!user) return; // aún sin usuario

    const isSuper = user.role === UserRole.SUPERUSER;
    const hasOrg = typeof user.organizationId === 'number' ? user.organizationId > 0 : !!user.organizationId;
    const isAdmin = user.role === UserRole.ADMIN;
    const isAdminWithOrg = isAdmin && hasOrg;
    const needsOrgCreation = isAdmin && !hasOrg;

    console.log('[admin guard] role:', user.role, 'organizationId:', user.organizationId, 'hasOrg:', hasOrg, 'pathname:', pathname);

    if (needsOrgCreation && pathname !== '/create-organization') {
      hasGuardRun.current = true;
      router.replace('/create-organization');
      return;
    }

    // Redirigir roles que NO deberían estar aquí a sus dashboards específicos en vez de /dashboard para evitar bucles
    if (!isSuper && !isAdminWithOrg) {
      if (user.role === UserRole.EXTERNAL && pathname !== '/dashboard/external') {
        hasGuardRun.current = true;
        router.replace('/dashboard/external');
        return;
      }
      if (user.role === UserRole.COLLABORATOR && pathname !== '/dashboard/academic') {
        hasGuardRun.current = true;
        router.replace('/dashboard/academic');
        return;
      }
      // Si es algún rol desconocido, mandar al dashboard base solo una vez
      if (pathname !== '/dashboard') {
        hasGuardRun.current = true;
        router.replace('/dashboard');
        return;
      }
    }

    // Si es válido (super o admin con org) no hacemos nada y dejamos cargar.
    hasGuardRun.current = true;
  }, [user, isLoading, router, pathname]);

  // Cargar todos los proyectos (superusuario ve todos)
  const hasLoadedRef = (globalThis as any).__adminDashLoaded || { current: false };
  (globalThis as any).__adminDashLoaded = hasLoadedRef;

  useEffect(() => {
    const loadAllProjects = async () => {
      if (!user) return;

      try {
        setIsLoadingProjects(true);
        const projects = await projectService.getAllProjects();

        // Normalizar los proyectos para asegurar consistencia de IDs
        const normalized = projects.map((p: any) => ({
          ...p,
          IDProject: p.IDProject ?? p.idproject ?? p.id ?? p.projectId,
          IDMethodologyRef: p.IDMethodologyRef ?? p.idmethodologyRef,
          IDProjectStatusRef: p.IDProjectStatusRef ?? p.idprojectStatusRef,
          methodology: p.methodology
            ? {
                ...p.methodology,
                IDMethodology: p.methodology.IDMethodology ?? p.methodology.idmethodology,
              }
            : null,
          projectStatus: p.projectStatus
            ? {
                ...p.projectStatus,
                IDProjectStatus:
                  p.projectStatus.IDProjectStatus ?? p.projectStatus.idprojectStatus,
              }
            : null,
        }));

        const filteredProjects = normalized.filter(
          (p) => p.projectStatus?.name?.toLowerCase() !== "eliminado"
        );

        const uniqueProjects = filteredProjects.filter(
          (project, index, self) =>
            index === self.findIndex((p) => p.IDProject === project.IDProject)
        );

        // Superusuario siempre tiene acceso completo - asignar el primer rol de admin disponible
        const projectsWithFullAccess = uniqueProjects.map((proj) => ({
          ...proj,
          userRoleId: ADMIN_PROJECT_ROLE_IDS[0], // Asignar rol de admin para acceso completo
        }));

        setUserProjects(projectsWithFullAccess);
        setAllProjects(normalized);
      } catch (err) {
        console.error('Error loading projects:', err);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    if (isAuthenticated && user && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadAllProjects();
    }
  }, [isAuthenticated, user]);

  // Calcular estadísticas
  useEffect(() => {
    const total = userProjects.length;
    const active = userProjects.filter((p: Project) => p.projectStatus?.name === "En Progreso").length;
    const completed = userProjects.filter((p: Project) => p.projectStatus?.name === "Completado").length;
    const pending = userProjects.filter((p: Project) => p.projectStatus?.name === "Pendiente").length;

    setStats({
      totalProjects: total,
      activeProjects: active,
      completedProjects: completed,
      pendingProjects: pending
    });
  }, [userProjects]);

  // Cargar cantidad de usuarios de la organización
  useEffect(() => {
    const loadUsers = async () => {
      if (!user?.organizationId) return;
      try {
        setIsLoadingOrgUsers(true);
        const users = await organizationService.getUsersByOrganization(user.organizationId);
        setOrgUserCount(users?.length ?? 0);
      } catch (e) {
        console.warn('No se pudo cargar usuarios de la organización:', e);
        setOrgUserCount(0);
      } finally {
        setIsLoadingOrgUsers(false);
      }
    };
    loadUsers();
  }, [user?.organizationId]);

  // Abrir modal para crear nuevo proyecto
  const handleCreateNewProject = () => {
    setShowCreateModal(true);
  };

  const refreshUserProjects = async () => {
    if (!user) return;
    try {
      setIsLoadingProjects(true);
      const projects = await projectService.getAllProjects();
      
      // Normalizar igual que en el useEffect principal
      const normalized = projects.map((p: any) => ({
        ...p,
        IDProject: p.IDProject ?? p.idproject ?? p.id ?? p.projectId,
        IDMethodologyRef: p.IDMethodologyRef ?? p.idmethodologyRef,
        IDProjectStatusRef: p.IDProjectStatusRef ?? p.idprojectStatusRef,
        methodology: p.methodology
          ? {
              ...p.methodology,
              IDMethodology: p.methodology.IDMethodology ?? p.methodology.idmethodology,
            }
          : null,
        projectStatus: p.projectStatus
          ? {
              ...p.projectStatus,
              IDProjectStatus:
                p.projectStatus.IDProjectStatus ?? p.projectStatus.idprojectStatus,
            }
          : null,
      }));

      const filteredProjects = normalized.filter(
        (p) => p.projectStatus?.name?.toLowerCase() !== "eliminado"
      );

      const uniqueProjects = filteredProjects.filter(
        (project, index, self) =>
          index === self.findIndex((p) => p.IDProject === project.IDProject)
      );

      const projectsWithFullAccess = uniqueProjects.map((proj) => ({
        ...proj,
        userRoleId: ADMIN_PROJECT_ROLE_IDS[0], // Superusuario siempre tiene acceso completo
      }));

      setUserProjects(projectsWithFullAccess);
      setAllProjects(normalized);
    } catch (err) {
      console.error('Error refreshing projects:', err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completado":
        return "bg-green-100 text-green-800";
      case "En Progreso":
        return "bg-blue-100 text-blue-800";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard de superusuario...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Se redirigirá automáticamente
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarProfile dashboardHref="/dashboard/admin" roleLabel={user.role === UserRole.ADMIN ? 'Administrador' : undefined} />
      <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user.name}! 👑
          </h2>
          <p className="text-gray-600">
            {user.role === UserRole.ADMIN
              ? 'Panel administrativo - Gestión de tu organización y proyectos.'
              : 'Panel de superusuario - Gestión completa de proyectos, fases y tareas.'}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="text-2xl">👥</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Org</p>
                <p className="text-2xl font-bold text-gray-900">{isLoadingOrgUsers || orgUserCount === null ? '—' : orgUserCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="text-2xl">💼</div>
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
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
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
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingProjects}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón para crear proyecto */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Todos los Proyectos</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleCreateNewProject}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Nuevo Proyecto
              </button>
            </div>
          </div>
        </div>

        {/* Modal: crear nuevo proyecto */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowCreateModal(false)} />
            <div className="relative z-10 w-full max-w-2xl mx-4">
              <div className="bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-semibold">Crear Nuevo Proyecto</h4>
                  <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-800">Cerrar ×</button>
                </div>
                <CreateProjectForm
                  user={user}
                  onCreated={async (p: any) => {
                    setShowCreateModal(false);
                    await refreshUserProjects();
                  }}
                  onClose={() => setShowCreateModal(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Proyectos en tarjetas */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingProjects ? (
              <div className="col-span-full text-center py-8 text-gray-500">Cargando proyectos...</div>
            ) : userProjects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📁</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No hay proyectos aún
                </h4>
                <p className="text-gray-600 mb-6">
                  Comienza creando tu primer proyecto.
                </p>
                <button 
                  onClick={handleCreateNewProject}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Crear Proyecto
                </button>
              </div>
            ) : (
              userProjects.map((project) => (
                <div key={project.IDProject} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    {/* Header de la tarjeta */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {project.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {project.methodology?.name} - {project.projectStatus?.name}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.projectStatus?.name === "Completado" ? "bg-green-100 text-green-800" :
                        project.projectStatus?.name === "En Progreso" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {project.projectStatus?.name}
                      </span>
                    </div>

                    {/* Descripción */}
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Progreso */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">Progreso</span>
                        <span className="text-sm text-gray-600">{project.percentageProgress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (project.percentageProgress || 0) >= 80 ? "bg-green-500" :
                            (project.percentageProgress || 0) >= 50 ? "bg-blue-500" :
                            (project.percentageProgress || 0) >= 25 ? "bg-yellow-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${project.percentageProgress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Inicio:</span> {new Date(project.startDate).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Fin:</span> {new Date(project.endDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    {/* Presupuesto */}
                    {project.budget && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Presupuesto:</span> ${project.budget.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* Acciones - Superusuario siempre tiene acceso completo */}
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProject(project);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                      >
                        Ver Detalles
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditProject(project);
                        }}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteProject(project);
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modales de Proyecto */}
        {selectedProject && (
          <ProjectDetailsModal 
            project={selectedProject} 
            user={user} 
            onClose={() => setSelectedProject(null)} 
          />
        )}

        {editProject && (
          <ProjectEditModal 
            project={editProject} 
            onClose={() => { 
              setEditProject(null); 
              refreshUserProjects(); 
            }} 
          />
        )}

        {deleteProject && (
          <ConfirmDeleteModal
            project={deleteProject}
            onClose={() => setDeleteProject(null)}
            onConfirm={async () => {
              try {
                await projectService.deleteProject(deleteProject.IDProject ?? deleteProject.idproject);
                setUserProjects(prev => prev.filter(p => p.IDProject !== deleteProject.IDProject));
                setDeleteProject(null);
              } catch (err) {
                console.error('Error deleting project:', err);
              }
            }}
          />
        )}
      </main>
      </div>
    </div>
  );
}

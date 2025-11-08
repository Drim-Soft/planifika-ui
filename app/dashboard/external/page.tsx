"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/auth";
import { getRoleLabel, hasAdminProjectRole } from "../../utils/roleUtils";
import { projectService } from "../../services/projectService";
import { Project } from "../../types/project";
import SidebarProfile from "../../components/SidebarProfile";
import CreateProjectForm from "../../components/CreateProjectForm";
import ProjectDetailsModal from "../../components/ProjectDetailsModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ProjectEditModal from "../academic/components/ProjectEditModal";

export default function ExternalDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingAllProjects, setIsLoadingAllProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editProject, setEditProject] = useState<any>(null);
  const [deleteProject, setDeleteProject] = useState<any>(null);
  const [joiningProjectId, setJoiningProjectId] = useState<number | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  // Redirigir si no es usuario externo
  useEffect(() => {
    if (user && user.role !== UserRole.EXTERNAL) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Cargar proyectos del usuario (normalizar y obtener role por proyecto)
  useEffect(() => {
    const loadUserProjects = async () => {
      if (!user) return;

      try {
        setIsLoadingProjects(true);

        const projects = await projectService.getUserProjects(user.id);

        const normalized = projects.map((p: any) => ({
          ...p,
          IDProject: p.IDProject ?? p.idproject,
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

        const projectsWithRoles = await Promise.all(
          uniqueProjects.map(async (proj) => {
            try {
              const usersInProject = await projectService.getUsersInProject(proj.IDProject);
              const myUser = usersInProject.find((u: any) => u.iduser === user.id);
              return { ...proj, userRoleId: myUser?.idrole ?? null };
            } catch (err) {
              console.warn(`No se pudo cargar roles para proyecto ${proj.IDProject}`, err);
              return { ...proj, userRoleId: null };
            }
          })
        );

        setUserProjects(projectsWithRoles);
      } catch (err) {
        console.error('Error loading user projects:', err);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    if (isAuthenticated && user) {
      loadUserProjects();
    }
  }, [isAuthenticated, user]);

  // Calcular estadísticas
  useEffect(() => {
    const total = userProjects.length;
    const active = userProjects.filter(p => p.projectStatus?.name === "En Progreso").length;
    const completed = userProjects.filter(p => p.projectStatus?.name === "Completado").length;
    const pending = userProjects.filter(p => p.projectStatus?.name === "Pendiente").length;

    setStats({
      totalProjects: total,
      activeProjects: active,
      completedProjects: completed,
      pendingTasks: pending
    });
  }, [userProjects]);

  // Abrir modal para crear nuevo proyecto (reutiliza formulario)
  const handleCreateNewProject = () => {
    setShowCreateModal(true);
  };

  // Cargar todos los proyectos disponibles (para que el usuario externo pueda unirse)
  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoadingAllProjects(true);
        const projects = await projectService.getAllProjects();
        setAllProjects(projects);
      } catch (err) {
        console.error('Error loading all projects:', err);
      } finally {
        setIsLoadingAllProjects(false);
      }
    };

    if (isAuthenticated) loadAll();
  }, [isAuthenticated]);

  const refreshUserProjects = async () => {
    if (!user) return;
    try {
      setIsLoadingProjects(true);
      const projects = await projectService.getUserProjects(user.id);
      setUserProjects(projects);
    } catch (err) {
      console.error('Error refreshing user projects:', err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Manejar unirse a un proyecto
  const handleJoinProject = async (project: Project) => {
    if (!user || !project.IDProject) return;

    try {
      setJoiningProjectId(project.IDProject);

      // Intentar obtener el id de la metodología
      const methodologyId = project.methodology?.IDMethodology ?? (project as any).IDMethodologyRef;

      // Obtener roles disponibles por metodología
      let roles: any[] = [];
      if (methodologyId) {
        try {
          roles = await projectService.getRolesByMethodology(Number(methodologyId));
        } catch (err) {
          console.warn('No se pudieron obtener roles por metodología:', err);
        }
      }

      // También intentar obtener roles embebidos en el objeto de proyecto
      if (!roles || roles.length === 0) {
        roles = project.methodology?.roles || [];
      }

      // Buscar rol adecuado para estudiante/colaborador
      const preferNames = ['estudiante', 'student', 'colaborador', 'collaborator'];
      let chosenRole = roles.find((r: any) => {
        const name = (r.name || r.nombre || '').toString().toLowerCase();
        return preferNames.some(p => name.includes(p));
      });

      if (!chosenRole && roles.length > 0) {
        // Fallback al primer rol
        chosenRole = roles[0];
      }

      if (!chosenRole || !chosenRole.IDRole) {
        window.alert('No se pudo determinar un rol para unirse a este proyecto. Contacta al administrador.');
        return;
      }

      await projectService.assignUserToProject(Number(project.IDProject), user.id, Number(chosenRole.IDRole));

      window.alert(`Te has unido al proyecto "${project.name}" correctamente.`);

      // Refrescar proyectos del usuario
      await refreshUserProjects();
      // también refrescar lista global
      const all = await projectService.getAllProjects();
      setAllProjects(all);

    } catch (err) {
      console.error('Error joining project:', err);
      window.alert(err instanceof Error ? err.message : 'Error al unirse al proyecto');
    } finally {
      setJoiningProjectId(null);
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
          <p className="text-gray-600">Cargando dashboard externo...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Se redirigirá automáticamente
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarProfile />
      <div className="flex-1 flex flex-col min-w-0">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user.name}! 💼
          </h2>
          <p className="text-gray-600">
            Aquí puedes gestionar todos tus proyectos externos y colaboraciones de manera profesional.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón para abrir modal de proyectos disponibles */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Mis Proyectos Externos</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Unirse a un proyecto
              </button>
              <button 
                onClick={handleCreateNewProject}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Nuevo Proyecto
              </button>
            </div>
          </div>
        </div>

        {/* Modal: lista de proyectos para unirse */}
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowJoinModal(false)} />
            <div className="relative z-10 w-full max-w-5xl mx-4">
              <div className="bg-white rounded-lg shadow-lg p-6 max-h-[80vh] overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-semibold">Proyectos Disponibles</h4>
                  <button onClick={() => setShowJoinModal(false)} className="text-gray-500 hover:text-gray-800">Cerrar ×</button>
                </div>

                {isLoadingAllProjects ? (
                  <div className="text-center py-8 text-gray-500">Cargando proyectos disponibles...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allProjects
                      .filter(p => !userProjects.some(up => up.IDProject === p.IDProject))
                      .map((project) => (
                        <div key={project.IDProject} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h4>
                                <p className="text-sm text-gray-600 mb-2">{project.methodology?.name} - {project.projectStatus?.name}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.projectStatus?.name || '')}`}>
                                {project.projectStatus?.name}
                              </span>
                            </div>

                            <p className="text-gray-700 text-sm mb-4 line-clamp-2">{project.description}</p>

                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700">Progreso</span>
                                <span className="text-sm text-gray-600">{project.percentageProgress || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className={`${getProgressColor(project.percentageProgress || 0)} h-2 rounded-full`} style={{ width: `${project.percentageProgress || 0}%` }}></div>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleJoinProject(project)}
                                disabled={joiningProjectId === project.IDProject}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200 disabled:opacity-50"
                              >
                                {joiningProjectId === project.IDProject ? 'Uniendo...' : 'Unirse'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: crear nuevo proyecto (reutiliza CreateProjectForm) */}
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
                    // cerrar modal y refrescar proyectos del usuario
                    setShowCreateModal(false);
                    await refreshUserProjects();
                    const all = await projectService.getAllProjects();
                    setAllProjects(all);
                  }}
                  onClose={() => setShowCreateModal(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Proyectos en tarjetas */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProjects.map((project) => (
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

                  {/* Acciones */}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('External Ver Detalles click:', project);
                        setSelectedProject(project);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                    >
                      Ver Detalles
                    </button>
                    {hasAdminProjectRole(user?.role, (project as any)?.userRoleId) && (
                      <button
                        type="button"
                        onClick={() => {
                          console.log('External Editar click:', project);
                          setEditProject(project);
                        }}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Modales de Proyecto */}
        {selectedProject && (
          <ProjectDetailsModal project={selectedProject} user={user} onClose={() => setSelectedProject(null)} />
        )}

        {editProject && (
          <ProjectEditModal project={editProject} onClose={() => { setEditProject(null); refreshUserProjects(); }} />
        )}

        {deleteProject && (
          <div>
            {/* Reutilizar ConfirmDeleteModal si se quiere habilitar eliminación */}
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
          </div>
        )}
      </main>
      </div>
    </div>
  );
}

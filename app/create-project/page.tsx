"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth";
import { getRoleLabel, hasAdminProjectRole } from "../utils/roleUtils";
import LoadingSpinner from "../components/LoadingSpinner";
import { projectService } from "../services/projectService";
import { Project } from "../types/project";
import ProjectDetailsModal from "../components/ProjectDetailsModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ProjectEditModal from "../dashboard/academic/components/ProjectEditModal";

export default function CreateProject() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editProject, setEditProject] = useState<any>(null);
  const [deleteProject, setDeleteProject] = useState<any>(null);

  // Cargar proyectos del usuario
  useEffect(() => {
    const loadUserProjects = async () => {
      if (!user) return;

      try {
        setIsLoadingProjects(true);

        const projects = await projectService.getUserProjects(user.id);

        // Normalizar campos para asegurar compatibilidad con los modales
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

        // Cargar rol real del usuario en cada proyecto (para permisos)
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

  // Navegar a crear nuevo proyecto
  const handleCreateNewProject = () => {
    router.push('/create-project/new');
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
                ¡Hola, {user.name}! 👋
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
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="text-xs text-blue-600">
                    Rol: {getRoleLabel(user.role)}
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
                    <p className="font-medium mb-1">Gestión de Proyectos</p>
                    <p className="text-xs">
                      Como usuario externo, puedes crear y gestionar tus propios proyectos. 
                      Aquí puedes ver todos tus proyectos y crear nuevos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón para crear nuevo proyecto */}
              <div className="text-center">
                <button
                  onClick={handleCreateNewProject}
                  className="w-full planifika-button-primary text-lg py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  🚀 Crear Nuevo Proyecto
                </button>
              </div>

              {/* Lista de proyectos del usuario */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Mis Proyectos</h3>
                
                {isLoadingProjects ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="md" text="Cargando proyectos..." />
                  </div>
                ) : userProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📁</div>
                    <p>No tienes proyectos creados aún</p>
                    <p className="text-sm">Usa el botón de arriba para crear tu primer proyecto</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userProjects.map((project) => (
                      <div key={project.IDProject} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-1">{project.name}</h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              <span className="bg-blue-100 px-2 py-1 rounded">
                                📅 {new Date(project.startDate).toLocaleDateString()}
                              </span>
                              <span className="bg-green-100 px-2 py-1 rounded">
                                🎯 {project.methodology?.name}
                              </span>
                              <span className="bg-purple-100 px-2 py-1 rounded">
                                📊 {project.projectStatus?.name}
                              </span>
                              {project.budget && (
                                <span className="bg-yellow-100 px-2 py-1 rounded">
                                  💰 ${project.budget.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col gap-2 items-end">
                            <span className="text-sm text-gray-400">
                              Progreso: {project.percentageProgress || 0}%
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                console.log('Ver Detalles click (external):', project);
                                setSelectedProject(project);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors duration-200 mt-2"
                            >
                              Ver Detalles
                            </button>
                            {hasAdminProjectRole(user?.role, (project as any)?.userRoleId) && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    console.log('Editar click (external):', project);
                                    setEditProject(project);
                                  }}
                                  className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors duration-200"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => setDeleteProject(project)}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-2 rounded transition-colors duration-200"
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  projectService.getUserProjects(user.id).then(setUserProjects);
                }}
              />
            )}

            {deleteProject && (
              <ConfirmDeleteModal
                project={deleteProject}
                onClose={() => setDeleteProject(null)}
                onConfirm={() => {
                  projectService
                    .deleteProject(deleteProject.IDProject ?? deleteProject.idproject)
                    .then(() => {
                      setUserProjects(prev =>
                        prev.filter(p => p.IDProject !== deleteProject.IDProject)
                      );
                      setDeleteProject(null);
                    })
                    .catch(console.error);
                }}
              />
            )}

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

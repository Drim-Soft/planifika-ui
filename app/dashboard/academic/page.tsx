"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/auth";
import { getRoleLabel } from "../../utils/roleUtils";
import { projectService } from "../../services/projectService";
import { Project } from "../../types/project";
import ProjectDetailsModal from "../../components/ProjectDetailsModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ProjectEditModal from "./components/ProjectEditModal";




export default function AcademicDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingTasks: 0
  });
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editProject, setEditProject] = useState<any>(null);
  const [deleteProject, setDeleteProject] = useState<any>(null);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Redirigir si no es colaborador (estudiante)
  useEffect(() => {
    if (user && user.role !== UserRole.COLLABORATOR) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Cargar proyectos del usuario
  useEffect(() => {

    const loadUserProjects = async () => {
      if (!user) return;
      
      try {
        setIsLoadingProjects(true);
        
        const projects = await projectService.getUserProjects(user.id);
        console.log("Proyectos devueltos por API:", projects);

  
        const normalized = projects.map((p: any) => ({
          ...p,
          IDProject: p.IDProject ?? p.idproject,
          IDMethodologyRef: p.IDMethodologyRef ?? p.idmethodologyRef,
          IDProjectStatusRef: p.IDProjectStatusRef ?? p.idprojectStatusRef,
          methodology: p.methodology
            ? {
                ...p.methodology,
                IDMethodology: p.methodology.IDMethodology ?? p.methodology.idmethodology
              }
            : null,
          projectStatus: p.projectStatus
            ? {
                ...p.projectStatus,
                IDProjectStatus:
                  p.projectStatus.IDProjectStatus ?? p.projectStatus.idprojectStatus
              }
            : null
        }));

     
        const filteredProjects = normalized.filter(
          (p) => p.projectStatus?.name?.toLowerCase() !== "eliminado"
        );


        const uniqueProjects = filteredProjects.filter(
          (project, index, self) =>
            index === self.findIndex((p) => p.IDProject === project.IDProject)
        );

        setUserProjects(uniqueProjects);
                






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
    const total = projects.length;
    const active = projects.filter(p => p.status === "En Progreso").length;
    const completed = projects.filter(p => p.status === "Completado").length;
    const pending = projects.filter(p => p.status === "Pendiente").length;

    setStats({
      totalProjects: total,
      activeProjects: active,
      completedProjects: completed,
      pendingTasks: pending
    });
  }, [projects]);

  // Navegar a crear nuevo proyecto
  const handleCreateNewProject = () => {
    router.push('/dashboard/academic/create-project');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard académico...</p>
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
                <p className="text-sm text-gray-600">Dashboard Académico</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Estudiante</p>
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
            ¡Bienvenido, {user.name}! 🎓
          </h2>
          <p className="text-gray-600">
            Aquí puedes ver y gestionar todos tus proyectos académicos de manera organizada.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="text-2xl">📚</div>
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

        {/* Proyectos en tarjetas */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Mis Proyectos Académicos</h3>
            <button 
              onClick={handleCreateNewProject}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Nuevo Proyecto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Proyectos reales del usuario */}
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
                        onClick={() => setSelectedProject(project)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                      >
                        Ver Detalles
                      </button>

                      {typeof user?.role === "string" && user.role.toLowerCase().includes("administrador proyecto") && (
                        <button
                          onClick={() => setEditProject(project)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                        >
                          Editar
                        </button>
                      )}

                      {typeof user?.role === "string" && user.role.toLowerCase().includes("administrador proyecto") && (
                        <button
                          onClick={() => setDeleteProject(project)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>



                </div>
              </div>
            ))}




          </div>
        </div>

        {/* Actividad Reciente */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <div className="text-sm">✅</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Completaste el proyecto "Análisis de Datos con Python"
                      </p>
                      <p className="text-xs text-gray-500">Hace 2 días</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <div className="text-sm">📝</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Actualizaste el progreso de "Sistema de Gestión Académica"
                      </p>
                      <p className="text-xs text-gray-500">Hace 5 días</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <div className="text-sm">➕</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Creaste el proyecto "Aplicación Móvil de Tareas"
                      </p>
                      <p className="text-xs text-gray-500">Hace 1 semana</p>
                    </div>
                  </div>
                </div>
              </div>
            </div> {/* ← este cierra totalmente la sección de actividad reciente */}


            {/* =========================
                  Modales de Proyecto
              ========================= */}
            {selectedProject && (
              <ProjectDetailsModal
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
              />
            )}

            {editProject && (
              <ProjectEditModal
                project={editProject}
                onClose={() => setEditProject(null)}
                onSave={() => {
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



      </main>
    </div>
  );
}

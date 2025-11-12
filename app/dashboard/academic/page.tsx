"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarProfile from "../../components/SidebarProfile";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/auth";
import { getRoleLabel } from "../../utils/roleUtils";
import { projectService } from "../../services/projectService";
import { Project } from "../../types/project";
import ProjectDetailsModal from "../../components/ProjectDetailsModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import ProjectEditModal from "./components/ProjectEditModal";
import Pagination from "../../components/Pagination";

// ==========================
// Helpers globales de rol
// ==========================
const normalizeStr = (val: unknown) =>
  String(val ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const hasAdminProjectRole = (role: unknown, realRoleId?: number) => {
  try {
    // Caso 1: si tenemos el rol real obtenido de BD
    if (typeof realRoleId === "number") {
      const adminIds = [21, 22, 23, 24];
      return adminIds.includes(realRoleId);
    }

    // Caso 2: si es un número (viene del backend)
    if (typeof role === "number") {
      const adminIds = [21, 22, 23, 24];
      return adminIds.includes(role);
    }

    // Caso 3: si es texto u objeto
    const raw =
      typeof role === "string"
        ? role
        : (role as any)?.name ?? (role as any)?.rolename ?? "";
    const normalized = raw.trim().toLowerCase();
    return normalized.includes("administrador proyecto");
  } catch {
    return false;
  }
};


const getStatusName = (p: any) => (p?.projectStatus?.name as string) || "";


export default function AcademicDashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joiningProjectId, setJoiningProjectId] = useState<number | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoadingAllProjects, setIsLoadingAllProjects] = useState(false);
  const [joinSearchTerm, setJoinSearchTerm] = useState("");
  
  // Estados para paginación de "Mis Proyectos"
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(6); // 6 proyectos por página (2 filas de 3)
  
  // Estados para paginación de "Proyectos Disponibles" en el modal
  const [joinCurrentPage, setJoinCurrentPage] = useState(1);
  const [joinProjectsPerPage] = useState(9); // 9 proyectos por página en el modal (3 filas de 3)

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

// 🔐 rol por proyecto
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
      }catch (err) {
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
    if (!userProjects || userProjects.length === 0) return;

    const total = userProjects.length;
    const active = userProjects.filter(
      (p) =>
        p.projectStatus?.name?.trim().toLowerCase() === "en progreso"
    ).length;
    const completed = userProjects.filter(
      (p) =>
        p.projectStatus?.name?.trim().toLowerCase() === "completado"
    ).length;
    const pending = userProjects.filter(
      (p) =>
        p.projectStatus?.name?.trim().toLowerCase() === "pendiente"
    ).length;

    setStats({
      totalProjects: total,
      activeProjects: active,
      completedProjects: completed,
      pendingTasks: pending,
    });
  }, [userProjects]);

  // Cargar todos los proyectos disponibles
  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoadingAllProjects(true);
        const projects = await projectService.getAllProjects();
        console.log('Proyectos disponibles sin normalizar:', projects);
        
        // Normalizar los proyectos para asegurar consistencia de IDs
        const normalizedProjects = projects.map((p: any) => ({
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

        console.log('Proyectos disponibles normalizados:', normalizedProjects);
        setAllProjects(normalizedProjects);
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
    console.log('📌 Validando datos del proyecto:', {
      project: project,
      keys: Object.keys(project || {}),
      hasProject: !!project,
      hasIDProject: !!project?.IDProject,
      typeofProject: typeof project,
      projectId: project?.IDProject
    });

    // Validar que el proyecto existe
    if (!project) {
      console.error('❌ Error: Proyecto no definido');
      window.alert('Error: No se pudo obtener la información del proyecto');
      return;
    }

    // Validar que el usuario existe
    if (!user?.id) {
      console.error('❌ Error: Usuario no encontrado o sin ID');
      window.alert('Error: Usuario no identificado');
      return;
    }

    // Validar el ID del proyecto
    const projectId = project?.IDProject;
    if (!projectId) {
      console.error('❌ Error: ID del proyecto no encontrado:', {
        project: project,
        projectKeys: Object.keys(project),
        projectValues: Object.values(project)
      });
      window.alert('Error: No se pudo obtener el ID del proyecto');
      return;
    }

    try {
      console.log('🎯 Iniciando proceso de unión al proyecto:', {
        projectId: projectId,
        userId: user.id,
        projectName: project.name
      });
      
      setJoiningProjectId(projectId);

      // Usar el nuevo endpoint de join
      const response = await projectService.joinProject(projectId, user.id);
      
      console.log('✨ Respuesta recibida:', response);
      
      // Mostrar el mensaje de respuesta del servidor
      window.alert(response);

      // Cerrar el modal
      setShowJoinModal(false);

      // Recargar la página para actualizar todos los datos
      window.location.reload();

    } catch (err) {
      console.error('Error joining project:', err);
      window.alert(err instanceof Error ? err.message : 'Error al unirse al proyecto');
    } finally {
      setJoiningProjectId(null);
    }
  };

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
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarProfile hideEdit roleLabel="Estudiante" dashboardHref="/dashboard/academic" />
      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col min-w-0">
      <header className="bg-white shadow-sm border-b w-full">
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
  <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Unirse a un proyecto
              </button>
              <button 
                onClick={handleCreateNewProject}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Nuevo Proyecto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Proyectos reales del usuario */}
            {(() => {
              // Filtrar proyectos
              const filteredProjects = userProjects.filter(project =>
                project.name &&
                project.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
              );
              
              // Calcular índices de paginación
              const indexOfLastProject = currentPage * projectsPerPage;
              const indexOfFirstProject = indexOfLastProject - projectsPerPage;
              const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
              
              return currentProjects.map((project) => (
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
  {/* Ver Detalles */}
  <button
    onClick={() => setSelectedProject(project)}
    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
  >
    Ver Detalles
  </button>

  {/* Solo si es admin se muestran los botones de editar/eliminar */}
  {hasAdminProjectRole(user?.role, project?.userRoleId) && (
    <>
      <button
        onClick={() => {
          console.log("✏️ Editar proyecto", project.IDProject);
          setEditProject(project);
        }}
        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
      >
        Editar
      </button>

      <button
        onClick={() => {
          console.log("🗑️ Eliminar proyecto", project.IDProject);
          setDeleteProject(project);
        }}
        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200"
      >
        Eliminar
      </button>
    </>
  )}
</div>

                </div>
              </div>
            ));
            })()}
          </div>

          {/* Paginación para Mis Proyectos */}
          {(() => {
            const filteredProjects = userProjects.filter(project =>
              project.name &&
              project.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
            );
            const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
            
            return (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            );
          })()}
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

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar proyecto disponible..."
                    value={joinSearchTerm}
                    onChange={(e) => setJoinSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {isLoadingAllProjects ? (
                  <div className="text-center py-8 text-gray-500">Cargando proyectos disponibles...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(() => {
                        // Filtrar proyectos disponibles
                        const availableProjects = allProjects
                          .filter(p => !userProjects.some(up => (up.IDProject && p.IDProject) ? up.IDProject === p.IDProject : false))
                          .filter(p => p.projectStatus?.name?.toLowerCase() !== "eliminado")
                          .filter(project =>
                            project.name &&
                            project.name.toLowerCase().includes(joinSearchTerm.trim().toLowerCase())
                          );
                        
                        // Calcular índices de paginación para el modal
                        const indexOfLastJoinProject = joinCurrentPage * joinProjectsPerPage;
                        const indexOfFirstJoinProject = indexOfLastJoinProject - joinProjectsPerPage;
                        const currentJoinProjects = availableProjects.slice(indexOfFirstJoinProject, indexOfLastJoinProject);
                        
                        return currentJoinProjects.map((project) => (
                        <div key={project.IDProject || 'temp-' + Math.random()} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
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
                                onClick={() => {
                                  // Validación detallada del proyecto
                                  console.log('🔵 Validación pre-unión:', { 
                                    project: project,
                                    projectExists: !!project,
                                    projectType: typeof project,
                                    projectKeys: Object.keys(project || {}),
                                    projectId: project?.IDProject,
                                    projectName: project?.name,
                                    rawProject: JSON.stringify(project)
                                  });
                                  
                                  // Verificar que tenemos todos los campos necesarios
                                  if (!project || typeof project !== 'object') {
                                    console.error('🚫 Proyecto no es un objeto válido:', project);
                                    window.alert('Error: Datos del proyecto inválidos');
                                    return;
                                  }

                                  const rawProject = project as any; // Para acceder a posibles variaciones de ID
                                  const projectId = project.IDProject ?? 
                                                 rawProject.idproject ?? 
                                                 rawProject.id ?? 
                                                 rawProject.projectId;

                                  if (!projectId) {
                                    console.error('🚫 No se encontró un ID válido para el proyecto:', project);
                                    window.alert('Error: ID del proyecto no encontrado');
                                    return;
                                  }

                                  // Si llegamos aquí, el proyecto es válido
                                  const validProject: Project = {
                                    ...project,
                                    IDProject: projectId
                                  };
                                  
                                  handleJoinProject(validProject);
                                }}
                                disabled={joiningProjectId === project?.IDProject}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-200 disabled:opacity-50"
                              >
                                {joiningProjectId === project?.IDProject ? 'Uniendo...' : 'Unirse'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ));
                      })()}
                    </div>
                    
                    {/* Paginación para Proyectos Disponibles en el Modal */}
                    {(() => {
                      const availableProjects = allProjects
                        .filter(p => !userProjects.some(up => (up.IDProject && p.IDProject) ? up.IDProject === p.IDProject : false))
                        .filter(p => p.projectStatus?.name?.toLowerCase() !== "eliminado")
                        .filter(project =>
                          project.name &&
                          project.name.toLowerCase().includes(joinSearchTerm.trim().toLowerCase())
                        );
                      const totalJoinPages = Math.ceil(availableProjects.length / joinProjectsPerPage);
                      
                      return (
                        <Pagination
                          currentPage={joinCurrentPage}
                          totalPages={totalJoinPages}
                          onPageChange={(page) => setJoinCurrentPage(page)}
                        />
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}

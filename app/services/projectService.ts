import { Project, Methodology, ProjectStatus, CreateProjectRequest, Role } from '@/app/types/project';

// Simulación de datos para metodologías
const mockMethodologies: Methodology[] = [
  {
    IDMethodology: 1,
    name: 'Scrum',
    roles: [
      { IDRole: 1, methodology: {} as Methodology, name: 'Product Owner' },
      { IDRole: 2, methodology: {} as Methodology, name: 'Scrum Master' },
      { IDRole: 3, methodology: {} as Methodology, name: 'Developer' },
      { IDRole: 4, methodology: {} as Methodology, name: 'Tester' }
    ]
  },
  {
    IDMethodology: 2,
    name: 'Kanban',
    roles: [
      { IDRole: 5, methodology: {} as Methodology, name: 'Project Manager' },
      { IDRole: 6, methodology: {} as Methodology, name: 'Developer' },
      { IDRole: 7, methodology: {} as Methodology, name: 'QA Engineer' }
    ]
  },
  {
    IDMethodology: 3,
    name: 'PMBOK',
    roles: [
      { IDRole: 8, methodology: {} as Methodology, name: 'Project Manager' },
      { IDRole: 9, methodology: {} as Methodology, name: 'Team Lead' },
      { IDRole: 10, methodology: {} as Methodology, name: 'Analyst' },
      { IDRole: 11, methodology: {} as Methodology, name: 'Developer' }
    ]
  },
  {
    IDMethodology: 4,
    name: 'Cascada',
    roles: [
      { IDRole: 12, methodology: {} as Methodology, name: 'Project Manager' },
      { IDRole: 13, methodology: {} as Methodology, name: 'System Analyst' },
      { IDRole: 14, methodology: {} as Methodology, name: 'Developer' },
      { IDRole: 15, methodology: {} as Methodology, name: 'Tester' }
    ]
  }
];

// Simulación de estados de proyecto
const mockProjectStatuses: ProjectStatus[] = [
  { IDProjectStatus: 1, name: 'Planificación' },
  { IDProjectStatus: 2, name: 'En Progreso' },
  { IDProjectStatus: 3, name: 'En Revisión' },
  { IDProjectStatus: 4, name: 'Completado' },
  { IDProjectStatus: 5, name: 'Cancelado' }
];

// Simulación de proyectos creados (para persistencia local)
let mockProjects: Project[] = [];
let nextProjectId = 1;

class ProjectService {
  // Obtener todas las metodologías
  async getMethodologies(): Promise<Methodology[]> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockMethodologies];
  }

  // Obtener todos los estados de proyecto
  async getProjectStatuses(): Promise<ProjectStatus[]> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockProjectStatuses];
  }

  // Obtener roles por metodología
  async getRolesByMethodology(methodologyId: number): Promise<Role[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const methodology = mockMethodologies.find(m => m.IDMethodology === methodologyId);
    return methodology?.roles || [];
  }

  // Crear un nuevo proyecto
  async createProject(projectData: CreateProjectRequest, userId: number): Promise<Project> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validar que la metodología existe
    const methodology = mockMethodologies.find(m => m.IDMethodology === projectData.IDMethodologyRef);
    if (!methodology) {
      throw new Error('Metodología no encontrada');
    }

    // Validar que el estado existe
    const status = mockProjectStatuses.find(s => s.IDProjectStatus === projectData.IDProjectStatusRef);
    if (!status) {
      throw new Error('Estado de proyecto no encontrado');
    }

    // Crear el nuevo proyecto
    const newProject: Project = {
      IDProject: nextProjectId++,
      name: projectData.name,
      description: projectData.description,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      budget: projectData.budget || 0,
      cost: 0,
      percentageProgress: 0,
      percentageBudgetExecution: 0,
      methodology: methodology,
      projectStatus: status,
      IDMethodologyRef: projectData.IDMethodologyRef,
      IDProjectStatusRef: projectData.IDProjectStatusRef
    };

    // Agregar a la lista de proyectos
    mockProjects.push(newProject);

    // Simular asignación de rol al usuario (por defecto Project Manager o primer rol disponible)
    const defaultRole = methodology.roles?.[0];
    if (defaultRole) {
      console.log(`Usuario ${userId} asignado al rol ${defaultRole.name} en proyecto ${newProject.IDProject}`);
    }

    return newProject;
  }

  // Obtener proyectos del usuario
  async getUserProjects(userId: number): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // En una implementación real, esto filtraría por usuario
    // Por ahora retornamos todos los proyectos
    return [...mockProjects];
  }

  // Obtener un proyecto por ID
  async getProjectById(projectId: number): Promise<Project | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProjects.find(p => p.IDProject === projectId) || null;
  }

  // Actualizar un proyecto
  async updateProject(projectId: number, projectData: Partial<CreateProjectRequest>): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const projectIndex = mockProjects.findIndex(p => p.IDProject === projectId);
    if (projectIndex === -1) {
      throw new Error('Proyecto no encontrado');
    }

    const updatedProject = {
      ...mockProjects[projectIndex],
      ...projectData,
      IDProject: projectId
    };

    mockProjects[projectIndex] = updatedProject;
    return updatedProject;
  }

  // Eliminar un proyecto
  async deleteProject(projectId: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const projectIndex = mockProjects.findIndex(p => p.IDProject === projectId);
    if (projectIndex === -1) {
      return false;
    }

    mockProjects.splice(projectIndex, 1);
    return true;
  }

  // Simular error de red
  async simulateNetworkError(): Promise<never> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new Error('Error de conexión con el servidor');
  }
}

export const projectService = new ProjectService();

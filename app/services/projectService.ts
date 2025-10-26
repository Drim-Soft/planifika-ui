// Servicio para manejar proyectos del backend real
import { API_CONFIG_PROJECTS_PLANIFIKA, DEFAULT_API_HEADERS } from '../config/api';
import { Project, Methodology, ProjectStatus, CreateProjectRequest, Role } from '@/app/types/project';

class ProjectService {
  // Reutilizamos la misma función de request que en authService
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        ...DEFAULT_API_HEADERS,
        ...options.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG_PROJECTS_PLANIFIKA.TIMEOUT),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error del servidor: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Si no hay contenido (DELETE por ejemplo)
      if (response.status === 204) return {} as T;

      return await response.json();
    } catch (error) {
      console.error('Error al conectar con Projects API:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté en ${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}`);
      }

      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('La solicitud tardó demasiado tiempo. El servidor puede estar sobrecargado o no disponible.');
      }

      throw error;
    }
  }

  // =============================
  //  Endpoints del backend
  // =============================

  //  Obtener todas las metodologías
  async getMethodologies(): Promise<Methodology[]> {
    return this.request<Methodology[]>('/methodologies', { method: 'GET' });
  }

  //  Obtener todos los estados de proyecto
  async getProjectStatuses(): Promise<ProjectStatus[]> {
    return this.request<ProjectStatus[]>('/project-status', { method: 'GET' });
  }

  //  Obtener roles por metodología
  async getRolesByMethodology(methodologyId: number): Promise<Role[]> {
    return this.request<Role[]>(`/methodologies/${methodologyId}/roles`, { method: 'GET' });
  }

  //  Crear un proyecto
  async createProject(projectData: CreateProjectRequest, userId: number): Promise<Project> {
    console.log(" createProject() ejecutado");
    console.log(" BASE_URL:", API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL);
    console.log(" Payload:", { ...projectData, IDUser: userId });

    const payload = {
      ...projectData,
      IDUser: userId
    };

    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  //  Obtener todos los proyectos
  async getAllProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects', { method: 'GET' });
  }

  //  Obtener proyectos de un usuario
  async getUserProjects(userId: number): Promise<Project[]> {
    const allProjects = await this.getAllProjects();
    // Filtramos localmente mientras no tengamos endpoint dedicado
    return allProjects.filter(p => (p as any).createdBy === userId);
  }

  //  Obtener un proyecto por ID
  async getProjectById(projectId: number): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}`, { method: 'GET' });
  }

  //  Actualizar proyecto
  async updateProject(projectId: number, data: Partial<CreateProjectRequest>): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  //  Borrado lógico
  async deleteProject(projectId: number): Promise<void> {
    await this.request<void>(`/projects/${projectId}`, { method: 'DELETE' });
  }
}

export const projectService = new ProjectService();
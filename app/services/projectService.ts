// Servicio para manejar proyectos del backend real
import { API_CONFIG_PROJECTS_PLANIFIKA, DEFAULT_API_HEADERS } from '../config/api';
import { Project, Methodology, ProjectStatus, CreateProjectRequest, Role } from '@/app/types/project';

class ProjectService {
  // Reutilizamos la misma función de request que en authService con soporte de reintentos
  
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

  console.log('📡 Haciendo petición:', {
    url,
    method: options.method,
    headers: config.headers,
    body: options.body
  });

  const attempts = API_CONFIG_PROJECTS_PLANIFIKA.RETRY_ATTEMPTS || 1;
  const delayMs = API_CONFIG_PROJECTS_PLANIFIKA.RETRY_DELAY || 1000;

  let lastError: any = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const started = Date.now();
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

    // 🔧 NUEVO manejo robusto para respuestas
  if (response.status === 204) return {} as T;

    const text = await response.text();
    try {
      return JSON.parse(text); // Si es JSON válido
    } catch {
      return text as unknown as T; // Si es texto plano (como "Project logically deleted")
    }
    } catch (error) {
      lastError = error;
      const elapsed = Date.now() - started;
      const isTimeout = error instanceof Error && error.name === 'TimeoutError';
      const isNetwork = error instanceof TypeError && error.message.includes('fetch');
      console.warn(`⚠️ Intento ${attempt}/${attempts} fallido (${elapsed}ms):`, error);
      if (attempt < attempts) {
        await new Promise(r => setTimeout(r, delayMs * attempt)); // backoff simple
        continue;
      }
      // Clasificación final de error
      if (isNetwork) {
        throw new Error(`No se puede conectar con el servidor de proyectos (${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}). Verifica que esté levantado en el puerto correcto.`);
      }
      if (isTimeout) {
        throw new Error(`Timeout tras ${API_CONFIG_PROJECTS_PLANIFIKA.TIMEOUT}ms al consultar proyectos. El backend está lento o inalcanzable.`);
      }
      throw error;
    }
  }
  throw lastError || new Error('Fallo desconocido en request de proyectos');
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
    const base = API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL.replace(/\/projects$/, ""); 
    const url = `${base}/methodologies/${methodologyId}/roles`;

    console.log("🎯 getRolesByMethodology URL:", url);

    return this.request<Role[]>(url.replace(API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL, ""), {
      method: 'GET',
    });
  }
  //  Crear un proyecto
  async createProject(projectData: CreateProjectRequest, userId: number): Promise<Project> {
    console.log(" createProject() ejecutado");
    console.log(" BASE_URL:", API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL);

    const payload = {
      name: projectData.name,
      description: projectData.description,
      methodologyName: projectData.methodologyName,
      statusName: projectData.statusName,
      IDProjectStatus: projectData.IDProjectStatus, // Adding the status ID
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      userId: userId  // 👈 aquí aseguramos que se envíe al backend
    };

    console.log("Payload final enviado:", payload);

    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  //  Obtener todos los proyectos
  async getAllProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects', { method: 'GET' });
  }


  // Obtener proyectos de un usuario
  async getUserProjects(userId: number): Promise<Project[]> {
    return this.request<Project[]>(`/projects/user/${userId}`, { method: 'GET' });
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
  // Obtener usuarios asignados a un proyecto
  async getUsersInProject(projectId: number): Promise<any[]> {
    return this.request<any[]>(`/projects/${projectId}/users`, { method: 'GET' });
  }

  // Asignar usuario a proyecto con un rol
  async assignUserToProject(projectId: number, idUser: number, idRole: number): Promise<string> {
    return this.request<string>(`/projects/${projectId}/users`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ IDUser: idUser, IDRole: idRole }),
    });
  }

  // Unirse a un proyecto
  async joinProject(projectId: number, userId: number): Promise<string> {
    const endpoint = `/projects/${projectId}/join`;
    const url = `${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}${endpoint}`;
    
    console.log('🚀 Intentando unirse al proyecto:', { 
      projectId, 
      userId,
      url,
      baseUrl: API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL 
    });

    try {
      const response = await this.request<string>(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ IDUser: userId }),
      });
      console.log('✅ Respuesta del servidor:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en joinProject:', { 
        error, 
        url, 
        projectId, 
        userId 
      });
      throw error;
    }
  }

}

export const projectService = new ProjectService();
// Servicio para manejar las tareas del backend
import { API_CONFIG_PROJECTS_PLANIFIKA, DEFAULT_API_HEADERS } from '../config/api';
import { Task } from '@/app/types/task';

class TaskService {
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

      if (response.status === 204) return {} as T;

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text as unknown as T;
      }

    } catch (error) {
      console.error('Error al conectar con Tasks API:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté en ${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}`);
      }

      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('La solicitud tardó demasiado tiempo. El servidor puede estar sobrecargado o no disponible.');
      }

      throw error;
    }
  }

  // Obtener todas las tareas
  async getAllTasks(): Promise<Task[]> {
    return this.request<Task[]>('/tasks', { method: 'GET' });
  }

  // Obtener tareas por fase
  async getTasksByPhase(phaseId: number): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/phase?phaseId=${phaseId}`, { method: 'GET' });
  }

  // Obtener una tarea por ID
  async getTaskById(id: number): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, { method: 'GET' });
  }

  // Crear una tarea
  async createTask(data: Partial<Task>): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // Crear una tarea con archivo adjunto
  async createTaskWithFile(formData: FormData): Promise<Task> {
    const url = `${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}/tasks/create-with-file`;
    
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(API_CONFIG_PROJECTS_PLANIFIKA.TIMEOUT),
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
      
      return await response.json();
    } catch (error) {
      console.error('Error al crear tarea con archivo:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté en ${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}`);
      }
      
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('La solicitud tardó demasiado tiempo. El servidor puede estar sobrecargado o no disponible.');
      }
      
      throw error;
    }
  }

  // Actualizar una tarea existente
  async updateTask(id: number, data: Partial<Task>): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // Borrado lógico de una tarea
  async deleteTask(id: number): Promise<string> {
    return this.request<string>(`/tasks/${id}`, { method: 'DELETE' });
  }
}

export const taskService = new TaskService();

// Servicio para manejar estados de tareas
import { API_CONFIG_PROJECTS_PLANIFIKA, DEFAULT_API_HEADERS } from '../config/api';
import { TaskStatus } from '@/app/types/taskStatus';

class TaskStatusService {
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
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en ${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}`);
      }
      
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('La solicitud tardó demasiado tiempo. El servidor puede estar sobrecargado o no disponible.');
      }
      
      throw error;
    }
  }

  async getAllTaskStatuses(): Promise<TaskStatus[]> {
    return this.request<TaskStatus[]>('/task-status');
  }

  async getTaskStatusById(id: number): Promise<TaskStatus> {
    return this.request<TaskStatus>(`/task-status/${id}`);
  }

  async getTaskStatusByName(name: string): Promise<TaskStatus> {
    return this.request<TaskStatus>(`/task-status/name/${name}`);
  }
}

export const taskStatusService = new TaskStatusService();

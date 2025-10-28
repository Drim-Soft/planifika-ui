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

  // Función para mapear campos del backend al formato del frontend
  private mapTaskFromBackend(backendTask: any): Task {
    return {
      idTask: backendTask.idtask || backendTask.idTask,
      name: backendTask.name,
      description: backendTask.description,
      startDate: backendTask.startDate,
      endDate: backendTask.endDate,
      timeInvested: backendTask.timeInvested,
      percentageProgress: backendTask.percentageProgress,
      budget: backendTask.budget,
      cost: backendTask.cost,
      fileURL: backendTask.fileURL,
      score: backendTask.score,
      feedback: backendTask.feedback,
      phase: backendTask.phase ? {
        idPhase: backendTask.phase.idphase || backendTask.phase.idPhase,
        name: backendTask.phase.name
      } : undefined,
      taskStatus: backendTask.taskStatus ? {
        idTaskStatus: backendTask.taskStatus.idtaskStatus || backendTask.taskStatus.idTaskStatus,
        name: backendTask.taskStatus.name
      } : undefined,
      taskPriority: backendTask.taskPriority ? {
        idTaskPriority: backendTask.taskPriority.idtaskPriority || backendTask.taskPriority.idTaskPriority,
        name: backendTask.taskPriority.name
      } : undefined,
      user: backendTask.user ? {
        idUser: backendTask.user.iduser || backendTask.user.idUser,
        name: backendTask.user.name
      } : undefined,
      IDPhaseRef: backendTask.idphaseRef || backendTask.IDPhaseRef,
      IDTaskStatusRef: backendTask.idtaskStatusRef || backendTask.IDTaskStatusRef,
      IDTaskPriorityRef: backendTask.idtaskPriorityRef || backendTask.IDTaskPriorityRef,
      IDUserRef: backendTask.iduser || backendTask.IDUserRef
    };
  }

  // Obtener todas las tareas (incluyendo eliminadas)
  async getAllTasks(): Promise<Task[]> {
    const tasks = await this.request<any[]>('/tasks', { method: 'GET' });
    return tasks.map(task => this.mapTaskFromBackend(task));
  }

  // Obtener todas las tareas activas (sin eliminadas)
  async getAllActiveTasks(): Promise<Task[]> {
    const tasks = await this.request<any[]>('/tasks', { method: 'GET' });
    const mappedTasks = tasks.map(task => this.mapTaskFromBackend(task));
    return mappedTasks.filter(task => task.taskStatus?.name !== "Eliminado");
  }

  // Obtener tareas por fase
  async getTasksByPhase(phaseId: number): Promise<Task[]> {
    const tasks = await this.request<any[]>(`/tasks/phase/${phaseId}`, { method: 'GET' });
    // Mapear campos del backend al formato del frontend
    const mappedTasks = tasks.map(task => this.mapTaskFromBackend(task));
    // Filtrar tareas eliminadas - solo mostrar tareas activas
    return mappedTasks.filter(task => task.taskStatus?.name !== "Eliminado");
  }

  // Obtener una tarea por ID
  async getTaskById(id: number): Promise<Task> {
    const task = await this.request<any>(`/tasks/${id}`, { method: 'GET' });
    return this.mapTaskFromBackend(task);
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
    try {
      // Primero obtener la tarea actual para mantener los campos que no se están actualizando
      console.log("🔄 Obteniendo tarea actual para ID:", id);
      const currentTask = await this.getTaskById(id);
      console.log("✅ Tarea actual obtenida:", currentTask);
      
      // Crear un objeto Task completo combinando datos actuales con los nuevos
      const updatedTaskData = {
        ...currentTask,
        ...data,
        idTask: id // Asegurar que el ID se mantenga
      };
      
      console.log("📤 Datos completos para actualización:", updatedTaskData);
      
      return this.request<Task>(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTaskData),
      });
    } catch (error) {
      console.error("❌ Error en updateTask:", error);
      // Si hay error obteniendo la tarea actual, intentar actualización directa
      console.log("🔄 Intentando actualización directa sin obtener tarea actual");
      return this.request<Task>(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, idTask: id }),
      });
    }
  }

  // Actualizar una tarea con archivo adjunto
  async updateTaskWithFile(id: number, formData: FormData): Promise<Task> {
    const url = `${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}/tasks/${id}/upload-file`;
    
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
      console.error('Error al actualizar archivo de tarea:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté en ${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}`);
      }
      
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('La solicitud tardó demasiado tiempo. El servidor puede estar sobrecargado o no disponible.');
      }
      
      throw error;
    }
  }

  // Borrado lógico de una tarea
  async deleteTask(id: number): Promise<string> {
    return this.request<string>(`/tasks/${id}`, { method: 'DELETE' });
  }

  // Descargar archivo de una tarea
  async downloadTaskFile(taskId: number): Promise<Blob> {
    const url = `${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}/tasks/${taskId}/download-file`;
    
    const config: RequestInit = {
      method: 'GET',
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
      
      return await response.blob();
    } catch (error) {
      console.error('Error al descargar archivo de tarea:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté en ${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}`);
      }
      
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('La solicitud tardó demasiado tiempo. El servidor puede estar sobrecargado o no disponible.');
      }
      
      throw error;
    }
  }
}

export const taskService = new TaskService();

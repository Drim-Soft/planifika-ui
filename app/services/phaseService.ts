// Servicio para manejar las fases del backend real
import { API_CONFIG_PROJECTS_PLANIFIKA, DEFAULT_API_HEADERS } from '../config/api';
import { Phase } from '@/app/types/phase';

class PhaseService {
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
      console.error('Error al conectar con Phases API:', error);

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

  // Obtener todas las fases (incluye eliminadas)
  async getAllPhases(): Promise<Phase[]> {
    return this.request<Phase[]>('/phases', { method: 'GET' });
  }

  // Obtener todas las fases activas (excluye eliminadas)
  async getActivePhases(): Promise<Phase[]> {
    return this.request<Phase[]>('/phases/active', { method: 'GET' });
  }

  // Obtener una fase por ID
  async getPhaseById(id: number): Promise<Phase> {
    return this.request<Phase>(`/phases/${id}`, { method: 'GET' });
  }

  // Obtener fases por ID de proyecto (sin las eliminadas)
  async getPhasesByProject(projectId: number): Promise<Phase[]> {
    return this.request<Phase[]>(`/phases/project/${projectId}`, { method: 'GET' });
  }

  // Crear una fase
  async createPhase(data: Partial<Phase>): Promise<Phase> {
    return this.request<Phase>('/phases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // Actualizar una fase existente
  async updatePhase(id: number, data: Partial<Phase>): Promise<Phase> {
    return this.request<Phase>(`/phases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  // Borrado lógico de una fase
  async deletePhase(id: number): Promise<string> {
    return this.request<string>(`/phases/${id}`, { method: 'DELETE' });
  }
}

export const phaseService = new PhaseService();

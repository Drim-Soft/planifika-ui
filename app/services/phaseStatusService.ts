// Servicio para manejar los estados de fase del backend
import { API_CONFIG_PROJECTS_PLANIFIKA, DEFAULT_API_HEADERS } from '../config/api';
import { PhaseStatus } from '@/app/types/phaseStatus';

class PhaseStatusService {
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
      console.error('Error al conectar con PhaseStatus API:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté en ${API_CONFIG_PROJECTS_PLANIFIKA.BASE_URL}`);
      }

      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('La solicitud tardó demasiado tiempo. El servidor puede estar sobrecargado o no disponible.');
      }

      throw error;
    }
  }

  // Obtener todos los estados de fase
  // Nota: Este endpoint necesita ser implementado en el backend
  // Por ahora usamos datos mock basados en la estructura de la BD
  async getAllPhaseStatuses(): Promise<PhaseStatus[]> {
    // TODO: Implementar endpoint real en el backend
    // return this.request<PhaseStatus[]>('/phase-statuses', { method: 'GET' });
    
    // Datos mock basados en la estructura de la BD
    return Promise.resolve([
      { idPhaseStatus: 1, name: 'Activa' },
      { idPhaseStatus: 2, name: 'Completada' },
      { idPhaseStatus: 3, name: 'Eliminada' }
    ]);
  }

  // Obtener un estado de fase por ID
  async getPhaseStatusById(id: number): Promise<PhaseStatus> {
    const statuses = await this.getAllPhaseStatuses();
    const status = statuses.find(s => s.idPhaseStatus === id);
    if (!status) {
      throw new Error(`PhaseStatus with ID ${id} not found`);
    }
    return status;
  }
}

export const phaseStatusService = new PhaseStatusService();

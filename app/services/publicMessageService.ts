// Servicio para manejar mensajes públicos (comentarios de tareas)
import { API_CONFIG_PROJECTS_PLANIFIKA, DEFAULT_API_HEADERS } from '../config/api';
import { PublicMessage } from '@/app/types/publicMessage';

class PublicMessageService {
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

  async getAllPublicMessages(): Promise<PublicMessage[]> {
    return this.request<PublicMessage[]>('/public-messages');
  }

  async getPublicMessageById(id: number): Promise<PublicMessage> {
    return this.request<PublicMessage>(`/public-messages/${id}`);
  }

  async getPublicMessagesByTask(taskId: number): Promise<PublicMessage[]> {
    return this.request<PublicMessage[]>(`/public-messages/task/${taskId}`);
  }

  async getPublicMessagesByUser(userId: number): Promise<PublicMessage[]> {
    return this.request<PublicMessage[]>(`/public-messages/user/${userId}`);
  }

  async createPublicMessage(message: Omit<PublicMessage, 'idPublicMessage' | 'date'>): Promise<PublicMessage> {
    return this.request<PublicMessage>('/public-messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async updatePublicMessage(id: number, message: Partial<PublicMessage>): Promise<PublicMessage> {
    return this.request<PublicMessage>(`/public-messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(message),
    });
  }

  async deletePublicMessage(id: number): Promise<void> {
    return this.request<void>(`/public-messages/${id}`, {
      method: 'DELETE',
    });
  }
}

export const publicMessageService = new PublicMessageService();

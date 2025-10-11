// Servicio para manejar las operaciones de organizaciones con el backend
import { API_CONFIG } from '../config/api';

export interface Organization {
  id?: number;
  name: string;
  address: string;
  phone: string;
  photoURL: string;
  serviceType?: string;
  description?: string;
  createdAt?: string;
}

class OrganizationService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error del servidor: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      // Manejar errores de conexión específicamente
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en ${API_CONFIG.BASE_URL}`);
      }
      
      // Manejar errores de timeout
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('La solicitud tardó demasiado tiempo. El servidor puede estar sobrecargado o no disponible.');
      }
      
      throw error;
    }
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return this.request<Organization[]>('/organizations');
  }

  async getOrganizationById(id: number): Promise<Organization> {
    return this.request<Organization>(`/organizations/${id}`);
  }

  async createOrganization(organization: Omit<Organization, 'id'>): Promise<Organization> {
    return this.request<Organization>('/organizations', {
      method: 'POST',
      body: JSON.stringify(organization),
    });
  }

  async updateOrganization(id: number, organization: Omit<Organization, 'id'>): Promise<Organization> {
    return this.request<Organization>(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(organization),
    });
  }

  async deleteOrganization(id: number): Promise<void> {
    return this.request<void>(`/organizations/${id}`, {
      method: 'DELETE',
    });
  }

  async getUsersByOrganization(id: number): Promise<any[]> {
    return this.request<any[]>(`/organizations/${id}/users`);
  }
}

export const organizationService = new OrganizationService();

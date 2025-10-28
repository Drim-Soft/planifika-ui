// Servicio para manejar operaciones de usuario
import { API_CONFIG_USERS_PLANIFIKA, DEFAULT_API_HEADERS } from '../config/api';
import { UserProfile } from '../types/user';

class UserService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_CONFIG_USERS_PLANIFIKA.BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const config: RequestInit = {
    headers: {
      ...DEFAULT_API_HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}), 
      ...options.headers,
    },
    signal: AbortSignal.timeout(API_CONFIG_USERS_PLANIFIKA.TIMEOUT),
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
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en ${API_CONFIG_USERS_PLANIFIKA.BASE_URL}`);
    }

    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error('La solicitud tardó demasiado tiempo. El servidor puede estar sobrecargado o no disponible.');
    }

    throw error;
  }
}


  async getAllUsers(): Promise<UserProfile[]> {
    return this.request<UserProfile[]>('/users');
  }

  async getUserById(id: number): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${id}`);
  }

  async createUser(user: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    return this.request<UserProfile>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: number, user: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async updateUserStatus(id: number, status: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${id}/status/${status}`, {
      method: 'PATCH',
    });
  }

  async updateUserOrganization(id: number, organizationId: number): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${id}/organization/${organizationId}`, {
      method: 'PATCH',
    });
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Método para obtener usuarios por organización
  async getUsersByOrganization(organizationId: number): Promise<UserProfile[]> {
    return this.request<UserProfile[]>(`/organizations/${organizationId}/users`);
  }
}

export const userService = new UserService();

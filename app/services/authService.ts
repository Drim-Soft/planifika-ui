// Servicio para manejar autenticación con el backend
import { API_CONFIG_USERS_PLANIFIKA, DEFAULT_API_HEADERS } from '../config/api';
import { SignupRequest, SignupResponse, LoginRequest, LoginResponse, UserInfoResponse, AuthError } from '../types/auth';

class AuthService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG_USERS_PLANIFIKA.BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        ...DEFAULT_API_HEADERS,
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
      
      // Manejar errores de conexión específicamente
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en ${API_CONFIG_USERS_PLANIFIKA.BASE_URL}`);
      }
      
      // Manejar errores de timeout
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('La solicitud tardó demasiado tiempo. El servidor puede estar sobrecargado o no disponible.');
      }
      
      throw error;
    }
  }

  async signup(data: SignupRequest): Promise<SignupResponse> {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      photoUrl: data.photoUrl || null,
      userRole: data.role // Enviar el rol al backend
    };

    return this.request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
  const result = await this.request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (result.access_token) {
    localStorage.setItem('token', result.access_token);
  }

  return result;
}

  async getCurrentUser(accessToken: string): Promise<UserInfoResponse> {
    return this.request<UserInfoResponse>('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });
  }

  // Método para obtener información del usuario desde el backend
  async getUserById(userId: number): Promise<any> {
    return this.request<any>(`/users/${userId}`);
  }

  // Método para obtener información del usuario por su ID de Supabase
  async getUserBySupabaseId(supabaseUserId: string, accessToken: string): Promise<any> {
    return this.request<any>(`/users/supabase/${supabaseUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  // Método alternativo para obtener información del usuario
  async getUserInfo(accessToken: string): Promise<any> {
    return this.request<any>('/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  // Método para obtener información del usuario por email
  async getUserByEmail(email: string, accessToken: string): Promise<any> {
    return this.request<any>(`/users/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  // Método para actualizar el estado del usuario
  async updateUserStatus(userId: number, status: string): Promise<any> {
    return this.request<any>(`/users/${userId}/status/${status}`, {
      method: 'PATCH',
    });
  }

  // Método para eliminar usuario (soft delete)
  async deleteUser(userId: number): Promise<any> {
    return this.request<any>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Método para login externo (estudiantes)
  async externalLogin(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/external-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const authService = new AuthService();

// Servicio para la gestión de tickets de soporte
import { API_CONFIG_USERS_PLANIFIKA, DEFAULT_API_HEADERS } from '../config/api';
import { CreateTicketRequest, TicketResponse, UpdateTicketRequest } from '../types/ticket';

const API_BASE_URL = API_CONFIG_USERS_PLANIFIKA.BASE_URL;

class TicketService {
  /**
   * Crear un nuevo ticket de soporte
   */
  async createTicket(data: CreateTicketRequest): Promise<TicketResponse> {
    try {
      const token = localStorage.getItem('planifika_token');
      
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          ...DEFAULT_API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al crear ticket: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los tickets
   */
  async getAllTickets(): Promise<TicketResponse[]> {
    try {
      const token = localStorage.getItem('planifika_token');
      
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'GET',
        headers: {
          ...DEFAULT_API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener tickets: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting all tickets:', error);
      throw error;
    }
  }

  /**
   * Obtener un ticket por ID
   */
  async getTicketById(id: number): Promise<TicketResponse> {
    try {
      const token = localStorage.getItem('planifika_token');
      
      const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: 'GET',
        headers: {
          ...DEFAULT_API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener ticket: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting ticket by ID:', error);
      throw error;
    }
  }

  /**
   * Obtener tickets de un usuario específico
   */
  async getTicketsByUser(userId: number): Promise<TicketResponse[]> {
    try {
      const token = localStorage.getItem('planifika_token');
      
      const response = await fetch(`${API_BASE_URL}/tickets/user/${userId}`, {
        method: 'GET',
        headers: {
          ...DEFAULT_API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener tickets del usuario: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting tickets by user:', error);
      throw error;
    }
  }

  /**
   * Obtener tickets por estado
   */
  async getTicketsByStatus(statusId: number): Promise<TicketResponse[]> {
    try {
      const token = localStorage.getItem('planifika_token');
      
      const response = await fetch(`${API_BASE_URL}/tickets/status/${statusId}`, {
        method: 'GET',
        headers: {
          ...DEFAULT_API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener tickets por estado: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting tickets by status:', error);
      throw error;
    }
  }

  /**
   * Actualizar un ticket
   */
  async updateTicket(id: number, data: UpdateTicketRequest): Promise<TicketResponse> {
    try {
      const token = localStorage.getItem('planifika_token');
      
      const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: 'PUT',
        headers: {
          ...DEFAULT_API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al actualizar ticket: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  /**
   * Eliminar un ticket
   */
  async deleteTicket(id: number): Promise<{ status: number; detail: string }> {
    try {
      const token = localStorage.getItem('planifika_token');
      
      const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: 'DELETE',
        headers: {
          ...DEFAULT_API_HEADERS,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar ticket: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  }
}

export const ticketService = new TicketService();

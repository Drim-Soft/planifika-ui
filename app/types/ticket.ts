
export interface CreateTicketRequest {
  idPlanifikaUser: number;
  title: string;
  description: string;
}

export interface UpdateTicketRequest {
  idTicketStatus?: number;
  answer?: string;
  idDrimsoftUser?: number;
}

export interface TicketResponse {
  idTickets: number;
  idPlanifikaUser: number;
  idTicketStatus: number;
  ticketStatusName: string | null;
  title: string;
  description: string;
  answer: string | null;
  idDrimsoftUser: number | null;
}

export enum TicketStatus {
  PENDING = 1,
  IN_PROGRESS = 2,
  ANSWERED = 3,
  CLOSED = 4,
}

export const TicketStatusLabels: Record<TicketStatus, string> = {
  [TicketStatus.PENDING]: 'Pendiente',
  [TicketStatus.IN_PROGRESS]: 'En Progreso',
  [TicketStatus.ANSWERED]: 'Respondido',
  [TicketStatus.CLOSED]: 'Cerrado',
};

export const TicketStatusColors: Record<TicketStatus, string> = {
  [TicketStatus.PENDING]: 'bg-yellow-500',
  [TicketStatus.IN_PROGRESS]: 'bg-blue-500',
  [TicketStatus.ANSWERED]: 'bg-green-500',
  [TicketStatus.CLOSED]: 'bg-gray-500',
};

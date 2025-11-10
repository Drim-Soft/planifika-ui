export interface TaskStatus {
  idTaskStatus: number;
  name: string;
}

export interface TaskPriority {
  idTaskPriority: number;
  name: string;
}

export interface PublicMessage {
  idPublicMessage: number;
  idUser: number;
  idTask: number;
  content: string;
  date: string;
  userName?: string; // Campo adicional para mostrar el nombre del usuario
}

export interface PublicMessage {
  IDPublicMessage?: number;
  IDUser: number;
  IDTaskRef: number;
  content: string;
  date?: string;
  userName?: string; // Campo adicional para mostrar el nombre del usuario
}

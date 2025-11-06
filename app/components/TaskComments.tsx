"use client";

import { useState, useEffect } from 'react';
import { PublicMessage } from '@/app/types/publicMessage';
import { publicMessageService } from '@/app/services/publicMessageService';
import { userService } from '@/app/services/userService';
import { useAuth } from '@/app/contexts/AuthContext';

interface TaskCommentsProps {
  taskId: number;
  onCommentAdded?: () => void;
}

export default function TaskComments({ taskId, onCommentAdded }: TaskCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<PublicMessage[]>([]);
  const [userNames, setUserNames] = useState<Map<number, string>>(new Map());
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMenuId, setShowMenuId] = useState<number | null>(null);

  useEffect(() => {
    loadComments();
  }, [taskId]);

  // Función para cargar nombres de usuarios
  const loadUserNames = async (userIds: number[]) => {
    const newUserNames = new Map<number, string>();

    // Cargar nombres de usuarios que no sean el actual (el actual se usa directamente de user?.name)
    const userIdsToLoad = userIds.filter(id => id !== user?.id && id !== undefined && id !== null);
    
    if (userIdsToLoad.length === 0) {
      return; // No hay usuarios que cargar
    }
    
    const loadPromises = userIdsToLoad.map(async (userId) => {
      try {
        const userProfile = await userService.getUserById(userId);
        const userName = userProfile?.name || `Usuario ${userId}`;
        newUserNames.set(userId, userName);
      } catch (error) {
        console.error(`Error loading user ${userId}:`, error);
        // Si falla, usar placeholder
        newUserNames.set(userId, `Usuario ${userId}`);
      }
    });

    await Promise.all(loadPromises);
    
    // Actualizar el estado con todos los nombres cargados
    setUserNames(prev => {
      const combined = new Map(prev);
      newUserNames.forEach((name, id) => {
        combined.set(id, name);
      });
      return combined;
    });
  };

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const taskComments = await publicMessageService.getPublicMessagesByTask(taskId);
      setComments(taskComments);

      // Obtener IDs únicos de usuarios (excluyendo al usuario actual, ya que usamos user?.name directamente)
      const uniqueUserIds = [...new Set(taskComments.map(c => c.IDUser).filter(id => id !== undefined && id !== null && id !== user?.id))];
      
      // Cargar nombres de usuarios que no sean el actual
      if (uniqueUserIds.length > 0) {
        await loadUserNames(uniqueUserIds);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user?.id) return;

    try {
      setIsSubmitting(true);

      await publicMessageService.createPublicMessage({
        IDUser: user.id,
        IDTaskRef: taskId,
        content: newComment.trim(),
      });
      setNewComment('');
      await loadComments();
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Error al crear el comentario. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      await publicMessageService.updatePublicMessage(commentId, {
        content: editContent.trim(),
      });
      setEditingCommentId(null);
      setEditContent('');
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error al actualizar el comentario. Por favor, intenta nuevamente.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;

    try {
      await publicMessageService.deletePublicMessage(commentId);
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar el comentario. Por favor, intenta nuevamente.');
    }
  };

  const startEditing = (comment: PublicMessage) => {
    setEditingCommentId(comment.IDPublicMessage!);
    setEditContent(comment.content);
    setShowMenuId(null);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      let date: Date;
      
      // Si la fecha tiene zona horaria explícita, usarla directamente
      if (dateString.match(/[Z+-]\d{2}:?\d{2}$/)) {
        date = new Date(dateString);
      } else {
        // El backend envía LocalDateTime sin zona horaria
        // Asumimos que viene en UTC y necesitamos convertirla a hora de Colombia
        // Agregar 'Z' para indicar que es UTC
        const normalizedDate = dateString.includes('T') 
          ? dateString.trim() + 'Z'
          : dateString.trim() + 'T00:00:00Z';
        date = new Date(normalizedDate);
      }
      
      // Verificar que la fecha sea válida
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Convertir la fecha UTC a la zona horaria de Colombia (America/Bogota)
      // Colombia está en UTC-5, así que necesitamos formatear con la zona horaria correcta
      const formatter = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Formato de 24 horas
      });
      
      const formatted = formatter.format(date);
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Comentarios ({comments.length})</h4>
      
      {/* Lista de comentarios */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-gray-500">Cargando comentarios...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500">No hay comentarios aún.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.IDPublicMessage} className="bg-gray-50 rounded-lg p-3 relative">
              {editingCommentId === comment.IDPublicMessage ? (
                // Modo edición
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEditComment(comment.IDPublicMessage!)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Vista normal
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(() => {
                          const userId = comment.IDUser;
                          if (!userId) {
                            return user?.name || 'Usuario desconocido';
                          }
                          // Si es el usuario actual, usar su nombre directamente
                          if (user?.id === userId && user?.name) {
                            return user.name;
                          }
                          // Si no, usar el nombre cargado del servicio
                          const userName = userNames.get(userId);
                          return userName || `Usuario ${userId}`;
                        })()} • {formatDate(comment.date)}
                      </p>
                    </div>
                    {user?.id && comment.IDUser === user.id && (
                      <div className="relative">
                        <button
                          onClick={() => setShowMenuId(showMenuId === comment.IDPublicMessage ? null : comment.IDPublicMessage || null)}
                          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {showMenuId === comment.IDPublicMessage && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                              <button
                                onClick={() => startEditing(comment)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  setShowMenuId(null);
                                  handleDeleteComment(comment.IDPublicMessage!);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md"
                              >
                                Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Formulario para nuevo comentario */}
      <form onSubmit={handleSubmitComment} className="mt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}


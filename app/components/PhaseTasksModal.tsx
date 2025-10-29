"use client";

import { useEffect, useState } from "react";
import { taskService } from "../services/taskService";
import { phaseService } from "../services/phaseService";
import { Task } from "@/app/types/task";
import { Phase } from "@/app/types/phase";
import CreateTaskModal from "./CreateTaskModal";

interface PhaseTasksModalProps {
  phase: Phase;
  onClose: () => void;
  onPhaseUpdated?: (updatedPhase: Phase) => void;
  onPhaseDeleted?: (phaseId: number) => void;
}

export default function PhaseTasksModal({ phase, onClose, onPhaseUpdated, onPhaseDeleted }: PhaseTasksModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<number>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: phase.name,
    description: phase.description || '',
    startDate: phase.startDate || '',
    endDate: phase.endDate || '',
    budget: phase.budget || 0,
    cost: phase.cost || 0
  });

  // Función auxiliar para obtener el ID de la fase
  const getPhaseId = (): number | null => {
    // Incluir todas las variaciones posibles del campo ID
    const possibleIds = [
      (phase as any).idphase, // Campo real del backend (minúsculas)
      phase.IDPhase, // Campo del modelo Java
      phase.idPhase, // Compatibilidad con frontend
      (phase as any).id,
      (phase as any).phaseId,
      (phase as any).phase_id
    ];
    
    const validId = possibleIds.find(id => id !== null && id !== undefined && typeof id === 'number' && id > 0);
    return validId || null;
  };

  // Cargar tareas de la fase
  useEffect(() => {
    const loadTasks = async () => {
      const phaseId = getPhaseId();
      if (!phaseId) {
        console.log("⚠️ No se puede cargar tareas: ID de fase no válido");
        return;
      }
      
      try {
        setLoading(true);
        console.log("🔄 Cargando tareas para fase:", phaseId);
        const phaseTasks = await taskService.getTasksByPhase(phaseId);
        console.log("✅ Tareas cargadas:", phaseTasks.length);
        setTasks(phaseTasks);
      } catch (err) {
        console.error("❌ Error cargando tareas:", err);
        // En lugar de usar datos mock, mostrar lista vacía y permitir crear tareas
        setTasks([]);
        alert(`Error cargando tareas: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [phase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completada":
        return "bg-green-100 text-green-800";
      case "En Progreso":
        return "bg-blue-100 text-blue-800";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-800";
      case "Media":
        return "bg-yellow-100 text-yellow-800";
      case "Baja":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Funciones para manejar la edición y eliminación de fases
  const handleEditPhase = async () => {
    const phaseId = getPhaseId();
    
    if (!phaseId) {
      console.error("❌ No hay ID de fase para editar");
      alert("❌ Error: No se puede identificar la fase a editar");
      return;
    }
    
    try {
      setLoading(true);
      const updatedPhase = await phaseService.updatePhase(phaseId, editForm);
      
      onPhaseUpdated?.(updatedPhase);
      setIsEditing(false);
      alert("✅ Fase actualizada correctamente");
    } catch (error) {
      console.error("❌ Error actualizando fase:", error);
      alert(`❌ Error al actualizar la fase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhase = async () => {
    const phaseId = getPhaseId();
    
    if (!phaseId) {
      console.error("❌ No hay ID de fase para eliminar");
      alert("❌ Error: No se puede identificar la fase a eliminar");
      return;
    }
    
    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar la fase "${phase.name}"?\n\nEsta acción marcará la fase como eliminada (borrado lógico).`);
    
    if (!confirmDelete) {
      return;
    }
    
    try {
      setLoading(true);
      await phaseService.deletePhase(phaseId);
      
      onPhaseDeleted?.(phaseId);
      alert("✅ Fase eliminada correctamente");
      onClose();
    } catch (error) {
      console.error("❌ Error eliminando fase:", error);
      alert(`❌ Error al eliminar la fase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: phase.name,
      description: phase.description || '',
      startDate: phase.startDate || '',
      endDate: phase.endDate || '',
      budget: phase.budget || 0,
      cost: phase.cost || 0
    });
    setIsEditing(false);
  };

  // Función para manejar la creación de una nueva tarea
  const handleTaskCreated = (newTask: Task) => {
    console.log("➕ Nueva tarea creada, recargando lista...");
    reloadTasks(); // Recargar desde el backend
    setShowCreateTaskModal(false);
  };

  // Función para manejar la actualización de una tarea
  const handleTaskUpdated = (updatedTask: Task) => {
    console.log("📝 Tarea actualizada, recargando lista...");
    reloadTasks(); // Recargar desde el backend
    setShowEditTaskModal(false);
    setSelectedTask(null);
  };

  // Función para manejar la eliminación de una tarea
  const handleTaskDeleted = (taskId: number) => {
    console.log("🗑️ Tarea eliminada, recargando lista...");
    reloadTasks(); // Recargar desde el backend
    setShowEditTaskModal(false);
    setSelectedTask(null);
  };

  // Función para abrir modal de edición de tarea
  const handleEditTask = (task: Task) => {
    console.log("📝 Abriendo modal de edición para:", task.name);
    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  // Función para eliminar una tarea
  const handleDeleteTask = async (task: Task) => {
    if (!task.idTask) {
      alert("❌ No se puede identificar la tarea a eliminar");
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la tarea "${task.name}"?\n\nEsta acción marcará la tarea como eliminada (borrado lógico).`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      console.log("🗑️ Eliminando tarea:", task.idTask);
      
      await taskService.deleteTask(task.idTask);
      
      console.log("✅ Tarea eliminada correctamente");
      
      // Recargar la lista de tareas para mostrar que se eliminó
      reloadTasks();
      
    } catch (error) {
      console.error("❌ Error eliminando tarea:", error);
      alert(`❌ Error al eliminar la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para recargar las tareas
  const reloadTasks = async () => {
    const phaseId = getPhaseId();
    if (!phaseId) {
      console.log("⚠️ No se puede recargar tareas: ID de fase no válido");
      return;
    }
    
    try {
      console.log("🔄 Recargando tareas para fase:", phaseId);
      setLoading(true);
      const phaseTasks = await taskService.getTasksByPhase(phaseId);
      console.log("✅ Tareas recargadas:", phaseTasks.length);
      setTasks(phaseTasks);
    } catch (err) {
      console.error("❌ Error recargando tareas:", err);
      alert(`Error recargando tareas: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar archivo de una tarea
  const handleDownloadFile = async (taskId: number, fileName?: string) => {
    if (!taskId) {
      alert("❌ No hay archivo para descargar");
      return;
    }

    try {
      // Agregar tarea a la lista de descargas en progreso
      setDownloadingFiles((prev: Set<number>) => new Set(prev).add(taskId));
      
      console.log("📥 Descargando archivo de tarea:", taskId);
      
      const blob = await taskService.downloadTaskFile(taskId);
      
      // Crear URL del blob para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Usar el nombre del archivo si está disponible, sino un nombre genérico
      const downloadFileName = fileName || `tarea_${taskId}_archivo`;
      link.download = downloadFileName;
      
      // Simular click para iniciar descarga
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("✅ Archivo descargado correctamente");
      
    } catch (error) {
      console.error("❌ Error descargando archivo:", error);
      alert(`❌ Error al descargar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      // Remover tarea de la lista de descargas en progreso
      setDownloadingFiles((prev: Set<number>) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
        >
          ✖
        </button>

        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📋 Tareas de "{phase.name}"
            </h2>
            <p className="text-gray-500 text-sm">
              {phase.description || "Sin descripción"}
            </p>
          </div>
          
          {/* Botones de acción para la fase */}
          <div className="flex gap-2 ml-4">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-1"
                >
                  ✏️ Editar Fase
                </button>
                <button
                  onClick={handleDeletePhase}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-1"
                >
                  🗑️ Eliminar Fase
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditPhase}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-1"
                >
                  {loading ? "⏳" : "💾"} Guardar
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-1"
                >
                  ❌ Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Formulario de edición o información de la fase */}
        {isEditing ? (
          <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">✏️ Editar Fase</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Fase *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Nombre de la fase"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  rows={2}
                  placeholder="Descripción de la fase"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presupuesto ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.budget}
                  onChange={(e) => setEditForm({...editForm, budget: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.cost}
                  onChange={(e) => setEditForm({...editForm, cost: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-gray-500 font-medium">📊 Progreso</p>
              <p className="text-gray-800">{phase.percentageProgress || 0}%</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">📅 Inicio</p>
              <p className="text-gray-800">
                {phase.startDate ? new Date(phase.startDate).toLocaleDateString("es-ES") : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">🏁 Fin</p>
              <p className="text-gray-800">
                {phase.endDate ? new Date(phase.endDate).toLocaleDateString("es-ES") : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">📈 Estado</p>
              <span className={`px-2 py-1 rounded text-xs ${
                phase.phaseStatus?.name === 'Activa' ? 'bg-green-100 text-green-800' :
                phase.phaseStatus?.name === 'Completada' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {phase.phaseStatus?.name || "Sin estado"}
              </span>
            </div>
          </div>
        )}

        {/* Lista de tareas */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Tareas ({tasks.length})
            </h3>
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-lg transition-colors duration-200"
            >
              ➕ Nueva Tarea
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando tareas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay tareas creadas para esta fase</p>
              <p className="text-sm">Haz clic en "Nueva Tarea" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task: Task) => (
                <div key={task.idTask} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{task.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.taskStatus?.name || "")}`}>
                          {task.taskStatus?.name || "Sin estado"}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.taskPriority?.name || "")}`}>
                          {task.taskPriority?.name || "Sin prioridad"}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      )}

                      <div className="flex gap-4 text-xs text-gray-500 mb-3">
                        {task.user?.name && (
                          <span>👤 {task.user.name}</span>
                        )}
                        {task.startDate && (
                          <span>📅 Inicio: {new Date(task.startDate).toLocaleDateString("es-ES")}</span>
                        )}
                        {task.endDate && (
                          <span>📅 Fin: {new Date(task.endDate).toLocaleDateString("es-ES")}</span>
                        )}
                        {task.timeInvested && (
                          <span>⏱️ {task.timeInvested}h invertidas</span>
                        )}
                      </div>

                      {/* Progreso de la tarea */}
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">Progreso</span>
                          <span className="text-sm text-gray-600">{task.percentageProgress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(task.percentageProgress || 0)}`}
                            style={{ width: `${task.percentageProgress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Presupuesto y costo */}
                      {(task.budget || task.cost) && (
                        <div className="flex gap-4 text-xs text-gray-500">
                          {task.budget && (
                            <span>💰 Presupuesto: ${task.budget.toLocaleString()}</span>
                          )}
                          {task.cost && (
                            <span>💸 Costo: ${task.cost.toLocaleString()}</span>
                          )}
                        </div>
                      )}

                      {/* Archivo adjunto */}
                      {task.fileURL && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600">📎</span>
                              <div>
                                <div className="text-sm font-medium text-blue-900">
                                  {task.fileURL.split('/').pop() || 'archivo_adjunto'}
                                </div>
                                <div className="text-xs text-blue-600">
                                  Archivo adjunto disponible
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const fileName = task.fileURL?.split('/').pop() || `tarea_${task.idTask}_archivo`;
                                handleDownloadFile(task.idTask!, fileName);
                              }}
                              disabled={downloadingFiles.has(task.idTask!)}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-2 py-1 rounded text-xs transition-colors duration-200 flex items-center gap-1"
                            >
                              {downloadingFiles.has(task.idTask!) ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  Descargando...
                                </>
                              ) : (
                                <>
                                  ⬇️ Descargar
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditTask(task)}
                        disabled={loading}
                        className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs transition-all duration-200"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-xs transition-all duration-200"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal para crear nueva tarea */}
      {showCreateTaskModal && (
        <CreateTaskModal
          phaseId={getPhaseId() || 0}
          phaseName={phase.name}
          onClose={() => setShowCreateTaskModal(false)}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          onRefreshTasks={reloadTasks}
        />
      )}

      {/* Modal para editar tarea existente */}
      {showEditTaskModal && selectedTask && (
        <CreateTaskModal
          phaseId={getPhaseId() || 0}
          phaseName={phase.name}
          onClose={() => {
            setShowEditTaskModal(false);
            setSelectedTask(null);
          }}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          onRefreshTasks={reloadTasks}
          existingTask={selectedTask}
        />
      )}
    </div>
  );
}

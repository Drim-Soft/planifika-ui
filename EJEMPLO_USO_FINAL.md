// EJEMPLO DE USO DEL CreateTaskModal CON RECARGA AUTOMÁTICA

import CreateTaskModal from '@/app/components/CreateTaskModal';
import { taskService } from '@/app/services/taskService';
import { useState, useEffect } from 'react';

function TuComponentePadre() {
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [phaseId] = useState(1);
  const [phaseName] = useState("Fase de Desarrollo");

  // Función para cargar tareas desde el backend
  const loadTasks = async () => {
    try {
      console.log("🔄 Cargando tareas desde el backend...");
      const tasksData = await taskService.getTasksByPhase(phaseId);
      setTasks(tasksData);
      console.log("✅ Tareas cargadas:", tasksData.length);
    } catch (error) {
      console.error("❌ Error cargando tareas:", error);
    }
  };

  // Cargar tareas al montar el componente
  useEffect(() => {
    loadTasks();
  }, [phaseId]);

  // Función que se llama cuando se elimina una tarea
  const handleTaskDeleted = (taskId: number) => {
    console.log("🗑️ Tarea eliminada:", taskId);
    // No necesitamos hacer nada aquí porque onRefreshTasks se encarga
  };

  // Función que se llama cuando se actualiza una tarea
  const handleTaskUpdated = (updatedTask: Task) => {
    console.log("📝 Tarea actualizada:", updatedTask);
    // No necesitamos hacer nada aquí porque onRefreshTasks se encarga
  };

  // Función que se llama cuando se crea una tarea
  const handleTaskCreated = (newTask: Task) => {
    console.log("➕ Nueva tarea creada:", newTask);
    // No necesitamos hacer nada aquí porque onRefreshTasks se encarga
  };

  // Función para recargar la lista (CRÍTICA)
  const handleRefreshTasks = () => {
    console.log("🔄 Recargando lista de tareas...");
    loadTasks(); // Esta función recarga las tareas desde el backend
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    console.log("📝 Abriendo modal de edición para:", task.name);
    setSelectedTask(task);
    setShowModal(true);
  };

  return (
    <div>
      {/* Tu lista de tareas */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.idTask} className="flex items-center justify-between p-3 border rounded">
            <div>
              <h3>{task.name}</h3>
              <p>{task.description}</p>
            </div>
            <div>
              <button onClick={() => openEditModal(task)} className="bg-blue-600 text-white px-3 py-1 rounded mr-2">
                ✏️ Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botón para crear nueva tarea */}
      <button onClick={openCreateModal} className="bg-green-600 text-white px-4 py-2 rounded mt-4">
        ➕ Crear Nueva Tarea
      </button>

      {/* Modal */}
      {showModal && (
        <CreateTaskModal
          phaseId={phaseId}
          phaseName={phaseName}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          onRefreshTasks={handleRefreshTasks} // ← ESTA ES LA CLAVE
          existingTask={selectedTask}
        />
      )}
    </div>
  );
}

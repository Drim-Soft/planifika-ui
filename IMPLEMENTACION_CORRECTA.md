// IMPLEMENTACIÓN CORRECTA EN TU COMPONENTE PADRE

// 1. En tu componente que muestra la lista de tareas, implementa esto:

const [tasks, setTasks] = useState<Task[]>([]);

// Función para cargar tareas desde el backend
const loadTasks = async () => {
  try {
    const tasksData = await taskService.getTasksByPhase(phaseId);
    setTasks(tasksData);
    console.log("✅ Tareas recargadas:", tasksData.length);
  } catch (error) {
    console.error("❌ Error cargando tareas:", error);
  }
};

// Función que se llama cuando se elimina una tarea
const handleTaskDeleted = (taskId: number) => {
  console.log("🗑️ Tarea eliminada, recargando lista...");
  loadTasks(); // Esto recarga la lista desde el backend
};

// Función que se llama cuando se actualiza una tarea
const handleTaskUpdated = (updatedTask: Task) => {
  console.log("📝 Tarea actualizada, recargando lista...");
  loadTasks(); // Esto recarga la lista desde el backend
};

// Función que se llama cuando se crea una tarea
const handleTaskCreated = (newTask: Task) => {
  console.log("➕ Nueva tarea creada, recargando lista...");
  loadTasks(); // Esto recarga la lista desde el backend
};

// 2. Pasa estas funciones al CreateTaskModal:
<CreateTaskModal
  phaseId={phaseId}
  phaseName={phaseName}
  onClose={() => setShowModal(false)}
  onTaskCreated={handleTaskCreated}
  onTaskUpdated={handleTaskUpdated}
  onTaskDeleted={handleTaskDeleted}  // ← ESTA ES LA CLAVE
  existingTask={selectedTask}
/>

// 3. Para abrir el modal de edición:
const openEditModal = (task: Task) => {
  console.log("📝 Abriendo modal de edición para:", task.name);
  setSelectedTask(task);
  setShowModal(true);
};

// 4. Para abrir el modal de creación:
const openCreateModal = () => {
  console.log("➕ Abriendo modal de creación");
  setSelectedTask(null);
  setShowModal(true);
};

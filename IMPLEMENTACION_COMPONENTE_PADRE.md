// CÓMO IMPLEMENTAR EN TU COMPONENTE PADRE PARA QUE FUNCIONE LA ELIMINACIÓN

// En tu componente que usa CreateTaskModal, necesitas implementar esto:

const handleTaskDeleted = (taskId: number) => {
  console.log("Tarea eliminada:", taskId);
  
  // OPCIÓN 1: Recargar desde el backend (RECOMENDADO)
  loadTasks(); // Tu función que carga las tareas desde el backend
  
  // OPCIÓN 2: Actualizar el estado local directamente
  // setTasks(prev => prev.filter(task => task.idTask !== taskId));
};

const handleTaskUpdated = (updatedTask: Task) => {
  console.log("Tarea actualizada:", updatedTask);
  
  // OPCIÓN 1: Recargar desde el backend (RECOMENDADO)
  loadTasks(); // Tu función que carga las tareas desde el backend
  
  // OPCIÓN 2: Actualizar el estado local directamente
  // setTasks(prev => prev.map(task => 
  //   task.idTask === updatedTask.idTask ? updatedTask : task
  // ));
};

const handleTaskCreated = (newTask: Task) => {
  console.log("Nueva tarea creada:", newTask);
  
  // OPCIÓN 1: Recargar desde el backend (RECOMENDADO)
  loadTasks(); // Tu función que carga las tareas desde el backend
  
  // OPCIÓN 2: Actualizar el estado local directamente
  // setTasks(prev => [...prev, newTask]);
};

// Y pasar estas funciones al modal:
<CreateTaskModal
  phaseId={phaseId}
  phaseName={phaseName}
  onClose={() => setShowModal(false)}
  onTaskCreated={handleTaskCreated}
  onTaskUpdated={handleTaskUpdated}
  onTaskDeleted={handleTaskDeleted}
  existingTask={selectedTask}
/>

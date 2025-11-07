"use client";

import React, { useState, useEffect } from "react";
import { taskService } from "../services/taskService";
import { taskStatusService } from "../services/taskStatusService";
import { taskPriorityService } from "../services/taskPriorityService";
import { userService } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import { Task } from "@/app/types/task";
import { TaskStatus } from "@/app/types/taskStatus";
import { TaskPriority } from "@/app/types/taskPriority";
import { UserProfile } from "@/app/types/user";

interface CreateTaskModalProps {
  phaseId: number;
  phaseName: string;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: number) => void;
  onRefreshTasks?: () => void; // Función para recargar la lista de tareas
  existingTask?: Task; // Tarea existente para edición/visualización
}

export default function CreateTaskModal({ phaseId, phaseName, onClose, onTaskCreated, onTaskUpdated, onTaskDeleted, onRefreshTasks, existingTask }: CreateTaskModalProps) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [taskPriorities, setTaskPriorities] = useState<TaskPriority[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(false);
  const [taskFileInfo, setTaskFileInfo] = useState<{name: string, size: number, url: string} | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Función helper para convertir fecha del input (YYYY-MM-DD) a formato que evite problemas de zona horaria
  // El backend está interpretando las fechas como UTC y restando un día, así que compensamos agregando un día
  const formatDateForBackend = (dateString: string | undefined): string | undefined => {
    if (!dateString) return undefined;
    
    // Si la fecha ya está en formato ISO completo, extraer solo la parte de fecha
    if (dateString.includes('T')) {
      dateString = dateString.split('T')[0];
    }
    
    // Parsear la fecha YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(parts[2]);
      
      // Crear fecha en hora local y agregar un día para compensar el desfase del backend
      const localDate = new Date(year, month, day);
      localDate.setDate(localDate.getDate() + 1); // Agregar un día
      
      // Extraer componentes en hora local
      const adjustedYear = localDate.getFullYear();
      const adjustedMonth = String(localDate.getMonth() + 1).padStart(2, '0');
      const adjustedDay = String(localDate.getDate()).padStart(2, '0');
      
      return `${adjustedYear}-${adjustedMonth}-${adjustedDay}`;
    }
    
    // Si llegamos aquí, devolver la fecha original
    return dateString;
  };

  // Función helper para convertir fecha del backend a formato del input (YYYY-MM-DD)
  // Como el backend guardó un día menos, necesitamos restar un día para mostrar la fecha correcta
  const formatDateFromBackend = (dateString: string | Date | undefined): string => {
    if (!dateString) return '';
    
    // Convertir a string si es Date
    let dateStr = typeof dateString === 'string' ? dateString : dateString.toISOString();
    
    // Si la fecha ya está en formato ISO completo, extraer solo la parte de fecha
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    
    // Parsear la fecha YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JavaScript months are 0-indexed
      const day = parseInt(parts[2]);
      
      // Crear fecha en hora local y restar un día para compensar el desfase del backend
      const localDate = new Date(year, month, day);
      localDate.setDate(localDate.getDate() - 1); // Restar un día
      
      // Extraer componentes en hora local
      const adjustedYear = localDate.getFullYear();
      const adjustedMonth = String(localDate.getMonth() + 1).padStart(2, '0');
      const adjustedDay = String(localDate.getDate()).padStart(2, '0');
      
      return `${adjustedYear}-${adjustedMonth}-${adjustedDay}`;
    }
    
    // Si llegamos aquí, devolver la fecha original
    return dateStr;
  };
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    timeInvested: 0,
    percentageProgress: 0,
    budget: 0,
    cost: 0,
    score: 0,
    feedback: '',
    IDPhaseRef: phaseId,
    IDTaskStatusRef: 0, // Se establecerá dinámicamente
    IDTaskPriorityRef: 0, // Se establecerá dinámicamente
    IDUserRef: 0 // Se establecerá dinámicamente
  });

  // Cargar datos necesarios al abrir el modal (solo una vez)
  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones si el componente se desmonta
    
    const loadData = async () => {
      if (dataLoaded) {
        return;
      }
      
      try {
        setLoading(true);
        
        // Cargar estados de tarea desde el backend de proyectos
        const statuses = await taskStatusService.getAllTaskStatuses();
        // Asegurar que los IDs sean números - usar las propiedades correctas del backend
        const validatedStatuses = statuses.map(status => ({
          ...status,
          idTaskStatus: typeof (status as any).idtaskStatus === 'string' ? parseInt((status as any).idtaskStatus) : (status as any).idtaskStatus
        }));
        if (isMounted) {
          setTaskStatuses(validatedStatuses);
        }
        
        // Cargar prioridades de tarea desde el backend de proyectos
        const priorities = await taskPriorityService.getAllTaskPriorities();
        // Asegurar que los IDs sean números - usar las propiedades correctas del backend
        const validatedPriorities = priorities.map(priority => ({
          ...priority,
          idTaskPriority: typeof (priority as any).idtaskPriority === 'string' ? parseInt((priority as any).idtaskPriority) : (priority as any).idtaskPriority
        }));
        if (isMounted) {
          setTaskPriorities(validatedPriorities);
        }
        
        // Intentar cargar usuarios, pero manejar error 401
        try {
          const allUsers = await userService.getAllUsers();
          if (isMounted) {
            setUsers(allUsers);
          }
        } catch (userError) {
          // Usar usuario actual como fallback
          if (isMounted && user) {
            const currentUser: UserProfile = {
              id: user.id,
              name: user.name,
              email: user.email,
              photoUrl: user.photoUrl,
              status: user.status as any, // Convertir enum a objeto
              role: user.role as any, // Convertir enum a objeto
              organizationId: user.organizationId,
              supabaseUserId: user.supabaseUserId
            };
            setUsers([currentUser]);
          } else if (isMounted) {
            // Crear usuario mock si no hay usuario autenticado
            const mockUser: UserProfile = {
              id: 1,
              name: "Usuario Demo",
              email: "demo@example.com",
              photoUrl: undefined,
              status: { name: "Activo" } as any,
              role: { name: "Usuario" } as any,
              organizationId: 1,
              supabaseUserId: "demo-user"
            };
            setUsers([mockUser]);
          }
        }
        
        if (isMounted) {
          // Establecer valores por defecto dinámicamente
          let updatedFormData = { ...formData };
          
          if (validatedStatuses.length > 0) {
            // Buscar estado "Pendiente" o usar el primero
            const pendingStatus = validatedStatuses.find(s => s.name.toLowerCase().includes('pendiente')) || validatedStatuses[0];
            updatedFormData.IDTaskStatusRef = pendingStatus.idTaskStatus;
          }
          
          if (validatedPriorities.length > 0) {
            // Buscar prioridad "Media" o usar la segunda opción
            const mediumPriority = validatedPriorities.find(p => p.name.toLowerCase().includes('media')) || validatedPriorities[1] || validatedPriorities[0];
            updatedFormData.IDTaskPriorityRef = mediumPriority.idTaskPriority;
          }
          
          // Actualizar el estado del formulario con todos los valores por defecto
          setFormData(updatedFormData);
          setDataLoaded(true);
        }
        
      } catch (error) {
        if (isMounted) {
          // Usar datos mock solo si hay error en estados/prioridades
          const mockStatuses = [
            { idTaskStatus: 1, name: "Pendiente" },
            { idTaskStatus: 2, name: "En Progreso" },
            { idTaskStatus: 3, name: "Completada" }
          ];
          
          const mockPriorities = [
            { idTaskPriority: 1, name: "Alta" },
            { idTaskPriority: 2, name: "Media" },
            { idTaskPriority: 3, name: "Baja" }
          ];
          
          setTaskStatuses(mockStatuses);
          setTaskPriorities(mockPriorities);
          
          if (user) {
            const currentUser: UserProfile = {
              id: user.id,
              name: user.name,
              email: user.email,
              photoUrl: user.photoUrl,
              status: user.status as any, // Convertir enum a objeto
              role: user.role as any, // Convertir enum a objeto
              organizationId: user.organizationId,
              supabaseUserId: user.supabaseUserId
            };
            setUsers([currentUser]);
          }
          
          // Establecer valores por defecto con datos mock
          const mockFormData = {
            ...formData,
            IDTaskStatusRef: mockStatuses[0].idTaskStatus, // Pendiente
            IDTaskPriorityRef: mockPriorities[1] ? mockPriorities[1].idTaskPriority : mockPriorities[0].idTaskPriority // Media o primera disponible
          };
          
          setFormData(mockFormData);
          setDataLoaded(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user, dataLoaded]);

  // Establecer usuario por defecto cuando se carguen los usuarios
  useEffect(() => {
    if (users.length > 0 && formData.IDUserRef === 0) {
      setFormData((prev: typeof formData) => ({ ...prev, IDUserRef: users[0].id }));
    }
  }, [users]);

  // Establecer valores por defecto cuando se carguen los datos (solo en modo creación)
  useEffect(() => {
    if (dataLoaded && taskStatuses.length > 0 && taskPriorities.length > 0 && !isEditMode && !existingTask) {
      let needsUpdate = false;
      let updatedData = { ...formData };
      
      if (formData.IDTaskStatusRef === 0 || !taskStatuses.find((s: TaskStatus) => s.idTaskStatus === formData.IDTaskStatusRef)) {
        const pendingStatus = taskStatuses.find((s: TaskStatus) => s.name.toLowerCase().includes('pendiente')) || taskStatuses[0];
        updatedData.IDTaskStatusRef = pendingStatus.idTaskStatus;
        needsUpdate = true;
      }
      
      if (formData.IDTaskPriorityRef === 0 || !taskPriorities.find((p: TaskPriority) => p.idTaskPriority === formData.IDTaskPriorityRef)) {
        const mediumPriority = taskPriorities.find((p: TaskPriority) => p.name.toLowerCase().includes('media')) || taskPriorities[1] || taskPriorities[0];
        updatedData.IDTaskPriorityRef = mediumPriority.idTaskPriority;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        setFormData(updatedData);
      }
    }
  }, [dataLoaded, taskStatuses, taskPriorities, isEditMode, existingTask]);

  // Cargar datos de la tarea existente cuando estemos en modo de edición
  useEffect(() => {
    if (existingTask) {
      setIsEditMode(true);
      
      // Cargar datos del formulario inmediatamente con los valores de la tarea existente
      setFormData({
        name: existingTask.name || '',
        description: existingTask.description || '',
        startDate: formatDateFromBackend(existingTask.startDate),
        endDate: formatDateFromBackend(existingTask.endDate),
        timeInvested: existingTask.timeInvested || 0,
        percentageProgress: existingTask.percentageProgress || 0,
        budget: existingTask.budget || 0,
        cost: existingTask.cost || 0,
        score: existingTask.score || 0,
        feedback: existingTask.feedback || '',
        IDPhaseRef: phaseId,
        IDTaskStatusRef: existingTask.taskStatus?.idTaskStatus || 0,
        IDTaskPriorityRef: existingTask.taskPriority?.idTaskPriority || 0,
        IDUserRef: existingTask.IDUserRef || 0
      });
    } else {
      setIsEditMode(false);
    }
  }, [existingTask, phaseId]);

  // Actualizar datos del formulario cuando se carguen los estados y prioridades en modo de edición
  useEffect(() => {
    if (existingTask && dataLoaded && taskStatuses.length > 0 && taskPriorities.length > 0) {
      // Actualizar todos los campos de la tarea existente
      setFormData(prev => ({
        ...prev,
        name: existingTask.name || prev.name,
        description: existingTask.description || prev.description,
        startDate: formatDateFromBackend(existingTask.startDate),
        endDate: formatDateFromBackend(existingTask.endDate),
        timeInvested: existingTask.timeInvested || prev.timeInvested,
        percentageProgress: existingTask.percentageProgress || prev.percentageProgress,
        budget: existingTask.budget || prev.budget,
        cost: existingTask.cost || prev.cost,
        score: existingTask.score || prev.score,
        feedback: existingTask.feedback || prev.feedback,
        IDPhaseRef: phaseId,
        IDTaskStatusRef: existingTask.taskStatus?.idTaskStatus || prev.IDTaskStatusRef,
        IDTaskPriorityRef: existingTask.taskPriority?.idTaskPriority || prev.IDTaskPriorityRef,
        IDUserRef: existingTask.IDUserRef || prev.IDUserRef
      }));
    }
  }, [existingTask, dataLoaded, taskStatuses, taskPriorities, phaseId]);

  // Cargar información del archivo si existe una tarea
  useEffect(() => {
    if (existingTask && existingTask.fileURL) {
      // Extraer nombre del archivo de la URL
      const fileName = existingTask.fileURL.split('/').pop() || 'archivo_adjunto';
      setTaskFileInfo({
        name: fileName,
        size: 0, // No tenemos información del tamaño desde el backend
        url: existingTask.fileURL
      });
    }
  }, [existingTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("❌ El nombre de la tarea es obligatorio");
      return;
    }

    if (!formData.IDTaskStatusRef || formData.IDTaskStatusRef === 0) {
      alert("❌ Debe seleccionar un estado para la tarea");
      return;
    }

    if (!formData.IDTaskPriorityRef || formData.IDTaskPriorityRef === 0) {
      alert("❌ Debe seleccionar una prioridad para la tarea");
      return;
    }

    if (!formData.IDUserRef || formData.IDUserRef === 0) {
      alert("❌ Debe seleccionar un usuario para asignar la tarea");
      return;
    }

    try {
      setLoading(true);
      
      // Obtener nombres textuales de los IDs seleccionados
      const selectedStatus = taskStatuses.find((s: TaskStatus) => s.idTaskStatus === formData.IDTaskStatusRef);
      const selectedPriority = taskPriorities.find((p: TaskPriority) => p.idTaskPriority === formData.IDTaskPriorityRef);
      
      if (!selectedStatus) {
        alert("Debe seleccionar un estado válido para la tarea");
        return;
      }
      
      if (!selectedPriority) {
        alert("Debe seleccionar una prioridad válida para la tarea");
        return;
      }

      // Formatear fechas para evitar problemas de zona horaria
      const formattedStartDate = formatDateForBackend(formData.startDate);
      const formattedEndDate = formatDateForBackend(formData.endDate);

      if (isEditMode && existingTask) {
        // Modo de edición - actualizar tarea existente
        // Preparar datos para actualización
        const updateData = {
          name: formData.name,
          description: formData.description || undefined,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          timeInvested: formData.timeInvested || 0,
          percentageProgress: formData.percentageProgress || 0,
          budget: formData.budget || 0,
          cost: formData.cost || 0,
          score: formData.score || 0,
          feedback: formData.feedback || undefined,
          iduser: formData.IDUserRef, // Usar nombres del backend (minúsculas)
          idphaseRef: formData.IDPhaseRef,
          idtaskStatusRef: formData.IDTaskStatusRef,
          idtaskPriorityRef: formData.IDTaskPriorityRef
        };
        
        // Actualizar la tarea
        const updatedTask = await taskService.updateTask(existingTask.idTask!, updateData);
        
        // Si hay archivo seleccionado, subirlo por separado
        if (selectedFile) {
          const formDataWithFile = new FormData();
          formDataWithFile.append('file', selectedFile);
          
          await taskService.updateTaskWithFile(existingTask.idTask!, formDataWithFile);
        }
        
        // Notificar que la tarea fue actualizada
        if (onTaskUpdated) {
          onTaskUpdated(updatedTask);
        }
        
        // Recargar la lista de tareas para mostrar los cambios
        if (onRefreshTasks) {
          onRefreshTasks();
        }
        
        alert("✅ Tarea actualizada correctamente");
      } else {
        // Modo de creación - crear nueva tarea
        // Preparar datos según el formato esperado por el backend
        const taskData = {
          name: formData.name,
          description: formData.description || undefined,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          timeInvested: formData.timeInvested || 0,
          percentageProgress: formData.percentageProgress || 0,
          budget: formData.budget || 0,
          cost: formData.cost || 0,
          score: formData.score || 0,
          feedback: formData.feedback || undefined,
          phaseId: formData.IDPhaseRef, // ✅ Parámetro correcto según error del backend
          statusName: selectedStatus.name, // ✅ Nombre textual como requiere el backend
          priorityName: selectedPriority.name, // ✅ Nombre textual como requiere el backend
          userId: formData.IDUserRef // ✅ Parámetro correcto
        };
        
        // Si hay archivo seleccionado, usar el endpoint de creación con archivo
        if (selectedFile) {
          const formDataWithFile = new FormData();
          formDataWithFile.append('file', selectedFile);
          
          // Agregar campos con nombres correctos
          Object.keys(taskData).forEach(key => {
            const value = taskData[key as keyof typeof taskData];
            if (value !== null && value !== undefined) {
              formDataWithFile.append(key, value.toString());
            }
          });
          
          // Usar endpoint de creación con archivo
          const newTask = await taskService.createTaskWithFile(formDataWithFile);
          onTaskCreated(newTask);
        } else {
          // Crear la tarea sin archivo usando el endpoint correcto
          const newTask = await taskService.createTask(taskData);
          onTaskCreated(newTask);
        }
        
        // Recargar la lista de tareas para mostrar la nueva tarea
        if (onRefreshTasks) {
          onRefreshTasks();
        }
        
        alert("✅ Tarea creada correctamente");
      }
      
      // Cerrar el modal
      onClose();
      
    } catch (error) {
      alert(`❌ Error al ${isEditMode ? 'actualizar' : 'crear'} la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    // Validar que el valor no sea NaN para campos numéricos
    if (typeof value === 'number' && isNaN(value)) {
      return;
    }
    
    setFormData((prev: typeof formData) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleDownloadFile = async () => {
    if (!existingTask || !existingTask.idTask) {
      alert("❌ No hay archivo para descargar");
      return;
    }

    try {
      setDownloadingFile(true);
      
      const blob = await taskService.downloadTaskFile(existingTask.idTask);
      
      // Crear URL del blob para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Usar el nombre del archivo si está disponible, sino un nombre genérico
      const fileName = taskFileInfo?.name || `tarea_${existingTask.idTask}_archivo`;
      link.download = fileName;
      
      // Simular click para iniciar descarga
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      alert(`❌ Error al descargar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setDownloadingFile(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!existingTask || !existingTask.idTask) {
      alert("❌ No hay tarea para eliminar");
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la tarea "${existingTask.name}"?\n\nEsta acción marcará la tarea como eliminada (borrado lógico).`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      
      await taskService.deleteTask(existingTask.idTask);
      
      // Notificar que la tarea fue eliminada
      if (onTaskDeleted) {
        onTaskDeleted(existingTask.idTask);
      }
      
      // Recargar la lista de tareas para mostrar que se eliminó
      if (onRefreshTasks) {
        onRefreshTasks();
      }
      
      alert("✅ Tarea eliminada correctamente");
      
      // Cerrar el modal
      onClose();
      
    } catch (error) {
      alert(`❌ Error al eliminar la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
        >
          ✖
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {existingTask ? "📝 Editar Tarea" : "➕ Nueva Tarea"}
          </h2>
          <p className="text-gray-500 text-sm">
            {existingTask ? "Editar tarea existente" : "Crear nueva tarea"} para la fase: <strong>{phaseName}</strong>
          </p>
        </div>

        {/* Mostrar formulario directamente */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Tarea *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                placeholder="Nombre de la tarea"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black placeholder:text-gray-500"
                rows={3}
                placeholder="Descripción de la tarea"
                style={{ color: '#000000' }}
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
              />
            </div>
          </div>

          {/* Estado y Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                value={formData.IDTaskStatusRef || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  
                  // Buscar el estado por ID o por nombre si el ID no es válido
                  let selectedStatus;
                  if (value && !isNaN(parseInt(value))) {
                    selectedStatus = taskStatuses.find((s: TaskStatus) => s.idTaskStatus === parseInt(value));
                  } else {
                    // Si el valor es un nombre, buscar por nombre
                    selectedStatus = taskStatuses.find((s: TaskStatus) => s.name === value);
                  }
                  
                  if (selectedStatus) {
                    // Usar la propiedad correcta según el objeto encontrado
                    const statusId = selectedStatus.idTaskStatus || (selectedStatus as any).idtaskStatus;
                    handleInputChange('IDTaskStatusRef', statusId);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                required
              >
                <option value="" disabled>
                  Seleccione un estado
                </option>
                {taskStatuses.map((status: TaskStatus) => (
                  <option key={status.idTaskStatus} value={status.idTaskStatus}>
                    {status.name}
                  </option>
                ))}
              </select>
              {formData.IDTaskStatusRef === 0 && (
                <p className="text-red-500 text-xs mt-1">⚠️ Debe seleccionar un estado</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad *
              </label>
              <select
                value={formData.IDTaskPriorityRef || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  
                  // Buscar la prioridad por ID o por nombre si el ID no es válido
                  let selectedPriority;
                  if (value && !isNaN(parseInt(value))) {
                    selectedPriority = taskPriorities.find((p: TaskPriority) => p.idTaskPriority === parseInt(value));
                  } else {
                    // Si el valor es un nombre, buscar por nombre
                    selectedPriority = taskPriorities.find((p: TaskPriority) => p.name === value);
                  }
                  
                  if (selectedPriority) {
                    // Usar la propiedad correcta según el objeto encontrado
                    const priorityId = selectedPriority.idTaskPriority || (selectedPriority as any).idtaskPriority;
                    handleInputChange('IDTaskPriorityRef', priorityId);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                required
              >
                <option value="" disabled>
                  Seleccione una prioridad
                </option>
                {taskPriorities.map((priority: TaskPriority) => (
                  <option key={priority.idTaskPriority} value={priority.idTaskPriority}>
                    {priority.name}
                  </option>
                ))}
              </select>
              {formData.IDTaskPriorityRef === 0 && (
                <p className="text-red-500 text-xs mt-1">⚠️ Debe seleccionar una prioridad</p>
              )}
            </div>
          </div>

          {/* Usuario asignado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario Asignado
            </label>
            <select
              value={formData.IDUserRef || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !isNaN(parseInt(value))) {
                  handleInputChange('IDUserRef', parseInt(value));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
            >
              {users.map((user: UserProfile) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Progreso y tiempo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progreso (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.percentageProgress}
                onChange={(e) => handleInputChange('percentageProgress', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo Invertido (horas)
              </label>
              <input
                type="number"
                min="0"
                value={formData.timeInvested}
                onChange={(e) => handleInputChange('timeInvested', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                placeholder="0"
              />
            </div>
          </div>

          {/* Presupuesto y costo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
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
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Subida de archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo Adjunto
            </label>
            <div className="space-y-2">
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
              />
              {selectedFile && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                  📎 Archivo seleccionado: <strong>{selectedFile.name}</strong> 
                  <span className="text-gray-500 ml-2">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Formatos permitidos: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, ZIP, RAR (máx. 10MB)
              </p>
            </div>
          </div>

          {/* Archivo existente de la tarea */}
          {existingTask && taskFileInfo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Archivo Actual de la Tarea
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">📎</span>
                    <div>
                      <div className="text-sm font-medium text-blue-900">
                        {taskFileInfo.name}
                      </div>
                      <div className="text-xs text-blue-600">
                        Archivo adjunto existente
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadFile}
                    disabled={downloadingFile}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 flex items-center gap-1"
                  >
                    {downloadingFile ? (
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
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-between pt-6 border-t">
            {/* Botón de eliminar (solo en modo de edición) */}
            {isEditMode && existingTask && (
              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    🗑️ Eliminar Tarea
                  </>
                )}
              </button>
            )}
            
            {/* Botones principales */}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditMode ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  <>
                    {isEditMode ? "💾 Actualizar Tarea" : "➕ Crear Tarea"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

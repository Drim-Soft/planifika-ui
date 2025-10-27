"use client";

import { useState, useEffect } from "react";
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
}

export default function CreateTaskModal({ phaseId, phaseName, onClose, onTaskCreated }: CreateTaskModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [taskPriorities, setTaskPriorities] = useState<TaskPriority[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
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
        console.log("🔄 Datos ya cargados, omitiendo carga duplicada");
        return;
      }
      
      try {
        setLoading(true);
        console.log("🔄 Cargando datos para crear tarea...");
        
        // Cargar estados de tarea desde el backend de proyectos
        console.log("📊 Cargando estados de tarea...");
        const statuses = await taskStatusService.getAllTaskStatuses();
        console.log("✅ Estados cargados:", statuses);
        // Asegurar que los IDs sean números - usar las propiedades correctas del backend
        const validatedStatuses = statuses.map(status => ({
          ...status,
          idTaskStatus: typeof (status as any).idtaskStatus === 'string' ? parseInt((status as any).idtaskStatus) : (status as any).idtaskStatus
        }));
        if (isMounted) {
          setTaskStatuses(validatedStatuses);
        }
        
        // Cargar prioridades de tarea desde el backend de proyectos
        console.log("⚡ Cargando prioridades de tarea...");
        const priorities = await taskPriorityService.getAllTaskPriorities();
        console.log("✅ Prioridades cargadas:", priorities);
        // Asegurar que los IDs sean números - usar las propiedades correctas del backend
        const validatedPriorities = priorities.map(priority => ({
          ...priority,
          idTaskPriority: typeof (priority as any).idtaskPriority === 'string' ? parseInt((priority as any).idtaskPriority) : (priority as any).idtaskPriority
        }));
        if (isMounted) {
          setTaskPriorities(validatedPriorities);
        }
        
        // Intentar cargar usuarios, pero manejar error 401
        console.log("👥 Intentando cargar usuarios...");
        try {
          const allUsers = await userService.getAllUsers();
          if (isMounted) {
            console.log("✅ Usuarios cargados:", allUsers);
            setUsers(allUsers);
          }
        } catch (userError) {
          console.warn("⚠️ Error cargando usuarios (401 - no autenticado):", userError);
          // Usar usuario actual como fallback
          if (isMounted && user) {
            const currentUser: UserProfile = {
              id: user.id,
              name: user.name,
              email: user.email,
              photoUrl: user.photoUrl,
              idUserStatus: user.status,
              idUserType: user.role,
              idOrganization: user.organizationId,
              supabaseUserID: user.supabaseUserId
            };
            setUsers([currentUser]);
            console.log("✅ Usando usuario actual como fallback:", currentUser);
          } else if (isMounted) {
            setUsers([]);
          }
        }
        
        if (isMounted) {
          // Establecer valores por defecto dinámicamente
          let updatedFormData = { ...formData };
          
          if (validatedStatuses.length > 0) {
            // Buscar estado "Pendiente" o usar el primero
            const pendingStatus = validatedStatuses.find(s => s.name.toLowerCase().includes('pendiente')) || validatedStatuses[0];
            updatedFormData.IDTaskStatusRef = pendingStatus.idTaskStatus;
            console.log("🎯 Estado por defecto:", pendingStatus, "ID:", pendingStatus.idTaskStatus);
          }
          
          if (validatedPriorities.length > 0) {
            // Buscar prioridad "Media" o usar la segunda opción
            const mediumPriority = validatedPriorities.find(p => p.name.toLowerCase().includes('media')) || validatedPriorities[1] || validatedPriorities[0];
            updatedFormData.IDTaskPriorityRef = mediumPriority.idTaskPriority;
            console.log("🎯 Prioridad por defecto:", mediumPriority, "ID:", mediumPriority.idTaskPriority);
          }
          
          // Actualizar el estado del formulario con todos los valores por defecto
          setFormData(updatedFormData);
          setDataLoaded(true);
          console.log("✅ Todos los datos cargados correctamente");
          console.log("📋 FormData actualizado:", updatedFormData);
          console.log("🔍 Estado seleccionado:", updatedFormData.IDTaskStatusRef);
          console.log("🔍 Prioridad seleccionada:", updatedFormData.IDTaskPriorityRef);
        }
        
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
        
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
              idUserStatus: user.status,
              idUserType: user.role,
              idOrganization: user.organizationId,
              supabaseUserID: user.supabaseUserId
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
          console.log("✅ Datos mock cargados con valores por defecto");
          console.log("🔍 Estado mock seleccionado:", mockFormData.IDTaskStatusRef);
          console.log("🔍 Prioridad mock seleccionada:", mockFormData.IDTaskPriorityRef);
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
      setFormData(prev => ({ ...prev, IDUserRef: users[0].id }));
      console.log("🎯 Usuario por defecto establecido:", users[0]);
    }
  }, [users]);

  // Establecer valores por defecto cuando se carguen los datos
  useEffect(() => {
    if (dataLoaded && taskStatuses.length > 0 && taskPriorities.length > 0) {
      console.log("🔄 Estableciendo valores por defecto después de cargar datos");
      console.log("🔍 Estado actual:", formData.IDTaskStatusRef);
      console.log("🔍 Prioridad actual:", formData.IDTaskPriorityRef);
      
      let needsUpdate = false;
      let updatedData = { ...formData };
      
      if (formData.IDTaskStatusRef === 0 || !taskStatuses.find(s => s.idTaskStatus === formData.IDTaskStatusRef)) {
        const pendingStatus = taskStatuses.find(s => s.name.toLowerCase().includes('pendiente')) || taskStatuses[0];
        updatedData.IDTaskStatusRef = pendingStatus.idTaskStatus;
        needsUpdate = true;
        console.log("🎯 Estado por defecto establecido:", pendingStatus);
      }
      
      if (formData.IDTaskPriorityRef === 0 || !taskPriorities.find(p => p.idTaskPriority === formData.IDTaskPriorityRef)) {
        const mediumPriority = taskPriorities.find(p => p.name.toLowerCase().includes('media')) || taskPriorities[1] || taskPriorities[0];
        updatedData.IDTaskPriorityRef = mediumPriority.idTaskPriority;
        needsUpdate = true;
        console.log("🎯 Prioridad por defecto establecida:", mediumPriority);
      }
      
      if (needsUpdate) {
        setFormData(updatedData);
        console.log("✅ Valores por defecto actualizados:", updatedData);
        console.log("🔍 Nuevo estado:", updatedData.IDTaskStatusRef);
        console.log("🔍 Nueva prioridad:", updatedData.IDTaskPriorityRef);
      }
    }
  }, [dataLoaded, taskStatuses, taskPriorities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🔍 Validando formulario:", formData);
    
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
      console.log('🔍 Buscando estado con ID:', formData.IDTaskStatusRef);
      console.log('🔍 Estados disponibles:', taskStatuses);
      const selectedStatus = taskStatuses.find(s => s.idTaskStatus === formData.IDTaskStatusRef);
      console.log('✅ Estado encontrado:', selectedStatus);
      
      console.log('🔍 Buscando prioridad con ID:', formData.IDTaskPriorityRef);
      console.log('🔍 Prioridades disponibles:', taskPriorities);
      const selectedPriority = taskPriorities.find(p => p.idTaskPriority === formData.IDTaskPriorityRef);
      console.log('✅ Prioridad encontrada:', selectedPriority);
      
      if (!selectedStatus) {
        alert("Debe seleccionar un estado válido para la tarea");
        return;
      }
      
      if (!selectedPriority) {
        alert("Debe seleccionar una prioridad válida para la tarea");
        return;
      }

      // Preparar datos según el formato esperado por el backend
      const taskData = {
        name: formData.name,
        description: formData.description || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        timeInvested: formData.timeInvested || 0,
        percentageProgress: formData.percentageProgress || 0,
        budget: formData.budget || 0,
        cost: formData.cost || 0,
        score: formData.score || 0,
        feedback: formData.feedback || null,
        phaseId: formData.IDPhaseRef, // ✅ Parámetro correcto según error del backend
        statusName: selectedStatus.name, // ✅ Nombre textual como requiere el backend
        priorityName: selectedPriority.name, // ✅ Nombre textual como requiere el backend
        userId: formData.IDUserRef // ✅ Parámetro correcto
      };
      
      console.log("📤 Datos preparados para el backend:", taskData);
      console.log("🔍 Estado seleccionado:", selectedStatus);
      console.log("🔍 Prioridad seleccionada:", selectedPriority);
      console.log("🔍 statusName:", selectedStatus.name);
      console.log("🔍 priorityName:", selectedPriority.name);
      
      // Si hay archivo seleccionado, usar el endpoint de creación con archivo
      if (selectedFile) {
        console.log("📎 Creando tarea con archivo:", selectedFile.name);
        const formDataWithFile = new FormData();
        formDataWithFile.append('file', selectedFile);
        
        // Agregar campos con nombres correctos
        Object.keys(taskData).forEach(key => {
          const value = taskData[key as keyof typeof taskData];
          if (value !== null && value !== undefined) {
            formDataWithFile.append(key, value.toString());
          }
        });
        
        console.log("📤 FormData keys:", Array.from(formDataWithFile.keys()));
        console.log("📤 FormData values:");
        for (let [key, value] of formDataWithFile.entries()) {
          console.log(`  ${key}: ${value}`);
        }
        
        // Usar endpoint de creación con archivo
        const newTask = await taskService.createTaskWithFile(formDataWithFile);
        onTaskCreated(newTask);
      } else {
        console.log("📝 Creando tarea sin archivo");
        
        // Crear la tarea sin archivo usando el endpoint correcto
        const newTask = await taskService.createTask(taskData);
        onTaskCreated(newTask);
      }
      
      // Mostrar mensaje de éxito
      alert("✅ Tarea creada correctamente");
      
      // Cerrar el modal
      onClose();
      
    } catch (error) {
      console.error("Error creando tarea:", error);
      alert(`❌ Error al crear la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    console.log(`🔄 Actualizando campo ${field}:`, value, typeof value);
    console.log(`🔍 Valor anterior de ${field}:`, formData[field as keyof typeof formData]);
    
    // Validar que el valor no sea NaN para campos numéricos
    if (typeof value === 'number' && isNaN(value)) {
      console.warn(`⚠️ Valor inválido para ${field}:`, value);
      return;
    }
    
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`📋 FormData actualizado:`, updated);
      console.log(`✅ Nuevo valor de ${field}:`, updated[field as keyof typeof updated]);
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
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
            ➕ Nueva Tarea
          </h2>
          <p className="text-gray-500 text-sm">
            Crear nueva tarea para la fase: <strong>{phaseName}</strong>
          </p>
        </div>

        {loading && !dataLoaded ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando datos del backend...</p>
            <p className="text-sm text-gray-400 mt-2">Estados, prioridades y usuarios</p>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <span className="text-sm">✅</span>
              <span className="text-sm font-medium">Datos cargados correctamente</span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Estados: {taskStatuses.length} | Prioridades: {taskPriorities.length} | Usuarios: {users.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Estado seleccionado: {formData.IDTaskStatusRef || 'No seleccionado'} | Prioridad seleccionada: {formData.IDTaskPriorityRef || 'No seleccionada'} | Usuario: {formData.IDUserRef || 'No seleccionado'}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {formData.IDTaskStatusRef === 0 && "⚠️ Estado no establecido"} 
              {formData.IDTaskPriorityRef === 0 && "⚠️ Prioridad no establecida"}
            </div>
          </div>
        )}
        
        {dataLoaded && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Debug info */}
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
              <div>🔍 Debug - Estado actual: {formData.IDTaskStatusRef}</div>
              <div>🔍 Debug - Prioridad actual: {formData.IDTaskPriorityRef}</div>
              <div>🔍 Debug - Estados disponibles: {taskStatuses.map(s => `${s.idTaskStatus}:${s.name}`).join(', ')}</div>
              <div>🔍 Debug - Prioridades disponibles: {taskPriorities.map(p => `${p.idTaskPriority}:${p.name}`).join(', ')}</div>
            </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                rows={3}
                placeholder="Descripción de la tarea"
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
                  console.log('🔄 Estado seleccionado - ID:', value);
                  console.log('🔄 Estado seleccionado - Nombre:', e.target.selectedOptions[0]?.text);
                  
                  // Buscar el estado por ID o por nombre si el ID no es válido
                  let selectedStatus;
                  if (value && !isNaN(parseInt(value))) {
                    selectedStatus = taskStatuses.find(s => s.idTaskStatus === parseInt(value));
                    console.log('✅ Estado encontrado por ID:', selectedStatus);
                  } else {
                    // Si el valor es un nombre, buscar por nombre
                    selectedStatus = taskStatuses.find(s => s.name === value);
                    console.log('✅ Estado encontrado por nombre:', selectedStatus);
                  }
                  
                  if (selectedStatus) {
                    // Usar la propiedad correcta según el objeto encontrado
                    const statusId = selectedStatus.idTaskStatus || (selectedStatus as any).idtaskStatus;
                    console.log('✅ Actualizando IDTaskStatusRef a:', statusId);
                    handleInputChange('IDTaskStatusRef', statusId);
                  } else {
                    console.log('❌ Estado no encontrado para valor:', value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                required
              >
                <option value="" disabled>
                  Seleccione un estado
                </option>
                {taskStatuses.map((status) => (
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
                  console.log('🔄 Prioridad seleccionada - ID:', value);
                  console.log('🔄 Prioridad seleccionada - Nombre:', e.target.selectedOptions[0]?.text);
                  
                  // Buscar la prioridad por ID o por nombre si el ID no es válido
                  let selectedPriority;
                  if (value && !isNaN(parseInt(value))) {
                    selectedPriority = taskPriorities.find(p => p.idTaskPriority === parseInt(value));
                    console.log('✅ Prioridad encontrada por ID:', selectedPriority);
                  } else {
                    // Si el valor es un nombre, buscar por nombre
                    selectedPriority = taskPriorities.find(p => p.name === value);
                    console.log('✅ Prioridad encontrada por nombre:', selectedPriority);
                  }
                  
                  if (selectedPriority) {
                    // Usar la propiedad correcta según el objeto encontrado
                    const priorityId = selectedPriority.idTaskPriority || (selectedPriority as any).idtaskPriority;
                    console.log('✅ Actualizando IDTaskPriorityRef a:', priorityId);
                    handleInputChange('IDTaskPriorityRef', priorityId);
                  } else {
                    console.log('❌ Prioridad no encontrada para valor:', value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
                required
              >
                <option value="" disabled>
                  Seleccione una prioridad
                </option>
                {taskPriorities.map((priority) => (
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
                console.log('🔄 Usuario seleccionado:', value);
                if (value && !isNaN(parseInt(value))) {
                  handleInputChange('IDUserRef', parseInt(value));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
            >
              {users.map((user) => (
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

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t">
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
                  Creando...
                </>
              ) : (
                <>
                  ➕ Crear Tarea
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

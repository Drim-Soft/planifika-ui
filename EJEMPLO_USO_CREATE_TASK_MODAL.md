# Ejemplo de Uso del CreateTaskModal con Descarga de Archivos

## Funcionalidades Agregadas

El componente `CreateTaskModal` ahora incluye:

1. **Soporte para edición de tareas existentes** - Puede recibir una tarea existente como prop
2. **Descarga de archivos** - Permite descargar archivos adjuntos de tareas existentes
3. **Interfaz dinámica** - Cambia entre modo "crear" y "editar" según el contexto

## Uso para Crear Nueva Tarea

```tsx
import CreateTaskModal from '@/app/components/CreateTaskModal';

// Crear nueva tarea
<CreateTaskModal
  phaseId={123}
  phaseName="Fase de Desarrollo"
  onClose={() => setShowModal(false)}
  onTaskCreated={(task) => {
    console.log('Tarea creada:', task);
    // Actualizar lista de tareas
  }}
/>
```

## Uso para Editar Tarea Existente

```tsx
import CreateTaskModal from '@/app/components/CreateTaskModal';

// Editar tarea existente (con archivo adjunto)
<CreateTaskModal
  phaseId={123}
  phaseName="Fase de Desarrollo"
  existingTask={taskData} // Tarea existente con archivo
  onClose={() => setShowModal(false)}
  onTaskCreated={(updatedTask) => {
    console.log('Tarea actualizada:', updatedTask);
    // Actualizar lista de tareas
  }}
/>
```

## Estructura de la Tarea Existente

La prop `existingTask` debe tener la siguiente estructura:

```typescript
interface Task {
  idTask: number;
  name: string;
  description?: string;
  fileURL?: string; // URL del archivo adjunto
  // ... otros campos
}
```

## Funcionalidades de Descarga

### 1. Detección Automática de Archivos
- El componente detecta automáticamente si la tarea tiene un archivo adjunto
- Muestra información del archivo en una sección especial

### 2. Botón de Descarga
- Botón azul con ícono de descarga
- Estado de carga durante la descarga
- Manejo de errores con mensajes informativos

### 3. Información del Archivo
- Nombre del archivo extraído de la URL
- Indicador visual de archivo existente
- Diseño consistente con el resto del modal

## Endpoints del Backend Utilizados

### Descarga de Archivo
```
GET /tasks/{taskId}/download-file
```

**Respuesta:** Blob del archivo

**Manejo de Errores:**
- Error 404: Archivo no encontrado
- Error 500: Error del servidor
- Timeout: Solicitud tardó demasiado tiempo

## Estados del Componente

### Estados de Descarga
- `downloadingFile`: Indica si se está descargando un archivo
- `taskFileInfo`: Información del archivo de la tarea existente

### Estados de UI
- Título dinámico: "Nueva Tarea" vs "Editar Tarea"
- Botón dinámico: "Crear Tarea" vs "Actualizar Tarea"
- Sección de archivo existente solo visible cuando hay archivo

## Ejemplo Completo de Implementación

```tsx
import { useState } from 'react';
import CreateTaskModal from '@/app/components/CreateTaskModal';

function TaskManager() {
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleTaskSaved = (task: Task) => {
    console.log('Tarea guardada:', task);
    // Actualizar estado local o refetch datos
    setShowModal(false);
    setEditingTask(null);
  };

  return (
    <div>
      {/* Botón para crear nueva tarea */}
      <button onClick={() => setShowModal(true)}>
        Nueva Tarea
      </button>

      {/* Botón para editar tarea existente */}
      <button onClick={() => handleEditTask(existingTask)}>
        Editar Tarea
      </button>

      {/* Modal */}
      {showModal && (
        <CreateTaskModal
          phaseId={123}
          phaseName="Fase de Desarrollo"
          existingTask={editingTask || undefined}
          onClose={handleCloseModal}
          onTaskCreated={handleTaskSaved}
        />
      )}
    </div>
  );
}
```

## Notas Importantes

1. **Compatibilidad**: El componente es completamente compatible con el uso anterior (sin `existingTask`)
2. **Archivos**: Solo muestra la sección de descarga si la tarea tiene un `fileURL`
3. **Errores**: Maneja errores de descarga con mensajes informativos
4. **Performance**: Descarga archivos solo cuando el usuario hace clic en el botón
5. **Seguridad**: Usa el endpoint seguro del backend para descargas

## Mejoras Futuras Sugeridas

1. **Vista previa de archivos**: Mostrar preview de imágenes o PDFs
2. **Múltiples archivos**: Soporte para múltiples archivos por tarea
3. **Historial de archivos**: Mostrar historial de cambios de archivos
4. **Validación de tipos**: Validar tipos de archivo antes de mostrar descarga

# Correcciones de Problemas en Gestión de Tareas

## Problemas Identificados y Solucionados

### ❌ **Problema 1: Al guardar no se muestra la nueva tarea**

**Causa**: 
- El endpoint de consulta de tareas por fase tenía una URL incorrecta
- El componente usaba datos mock cuando había errores de conexión

**Solución**:
```typescript
// Antes (incorrecto)
async getTasksByPhase(phaseId: number): Promise<Task[]> {
  return this.request<Task[]>(`/tasks/phase?phaseId=${phaseId}`, { method: 'GET' });
}

// Después (correcto)
async getTasksByPhase(phaseId: number): Promise<Task[]> {
  return this.request<Task[]>(`/tasks/phase/${phaseId}`, { method: 'GET' });
}
```

**Cambios en PhaseTasksModal.tsx**:
- Eliminados datos mock que ocultaban errores reales
- Mejorado el manejo de errores con alertas informativas
- Agregado logging detallado para debugging

### ❌ **Problema 2: Al actualizar se borra la información de la tarea**

**Causa**: 
- El endpoint PUT del backend espera un objeto Task completo
- Estábamos enviando solo los campos modificados (datos parciales)
- Campo incorrecto: `IDUser` en lugar de `IDUserRef`

**Solución**:
```typescript
// Antes (incorrecto)
async updateTask(id: number, data: Partial<Task>): Promise<Task> {
  return this.request<Task>(`/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// Después (correcto)
async updateTask(id: number, data: Partial<Task>): Promise<Task> {
  // Primero obtener la tarea actual para mantener los campos que no se están actualizando
  const currentTask = await this.getTaskById(id);
  
  // Crear un objeto Task completo combinando datos actuales con los nuevos
  const updatedTaskData = {
    ...currentTask,
    ...data,
    idTask: id // Asegurar que el ID se mantenga
  };
  
  return this.request<Task>(`/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTaskData),
  });
}
```

**Corrección en CreateTaskModal.tsx**:
```typescript
// Antes (incorrecto)
IDUser: formData.IDUserRef,

// Después (correcto)
IDUserRef: formData.IDUserRef,
```

### ❌ **Problema 3: Al borrar no funciona correctamente**

**Causa**: 
- El endpoint de eliminación estaba funcionando, pero había problemas de recarga
- Falta de logging para debugging

**Solución**:
- Mejorado el logging en todas las operaciones CRUD
- Verificado que el endpoint DELETE funciona correctamente
- Agregado manejo de errores más robusto

## Cambios Técnicos Realizados

### 1. **taskService.ts**
- ✅ Corregida URL del endpoint `getTasksByPhase`
- ✅ Mejorada función `updateTask` para enviar objeto completo
- ✅ Agregado logging detallado

### 2. **PhaseTasksModal.tsx**
- ✅ Eliminados datos mock que ocultaban errores
- ✅ Mejorado manejo de errores con alertas informativas
- ✅ Agregado logging detallado en `reloadTasks`
- ✅ Mejorada función `loadTasks` inicial

### 3. **CreateTaskModal.tsx**
- ✅ Corregido campo `IDUser` → `IDUserRef` en datos de actualización
- ✅ Mantenido logging existente para debugging

## Flujo Corregido de Operaciones

### ✅ **Crear Tarea**:
1. Usuario llena formulario y hace clic en "Crear Tarea"
2. Se envía POST a `/tasks` con datos correctos
3. Se recarga automáticamente la lista desde `/tasks/phase/{phaseId}`
4. La nueva tarea aparece en la lista

### ✅ **Actualizar Tarea**:
1. Usuario hace clic en "✏️ Editar"
2. Se abre modal con datos existentes
3. Usuario modifica campos necesarios
4. Se obtiene la tarea actual completa del backend
5. Se combinan datos actuales con modificaciones
6. Se envía PUT a `/tasks/{id}` con objeto completo
7. Se recarga automáticamente la lista
8. Los cambios se reflejan en la vista

### ✅ **Eliminar Tarea**:
1. Usuario hace clic en "🗑️ Eliminar"
2. Se muestra confirmación
3. Se envía DELETE a `/tasks/{id}`
4. Se recarga automáticamente la lista
5. La tarea eliminada desaparece de la vista

## Endpoints del Backend Utilizados

### ✅ **Consultar tareas por fase**:
```
GET /tasks/phase/{phaseId}
```

### ✅ **Crear tarea**:
```
POST /tasks
Content-Type: application/json
Body: { name, description, phaseId, statusName, priorityName, userId, ... }
```

### ✅ **Actualizar tarea**:
```
PUT /tasks/{id}
Content-Type: application/json
Body: { objeto Task completo }
```

### ✅ **Eliminar tarea**:
```
DELETE /tasks/{id}
```

### ✅ **Crear tarea con archivo**:
```
POST /tasks/create-with-file
Content-Type: multipart/form-data
```

### ✅ **Subir archivo a tarea existente**:
```
POST /tasks/{taskId}/upload-file
Content-Type: multipart/form-data
```

## Verificación de Funcionamiento

Para verificar que todo funciona correctamente:

1. **Crear una nueva tarea**:
   - Debe aparecer inmediatamente en la lista
   - No debe usar datos mock

2. **Editar una tarea existente**:
   - Los datos deben cargarse correctamente en el formulario
   - Al guardar, los cambios deben persistir
   - No debe borrarse información

3. **Eliminar una tarea**:
   - Debe mostrar confirmación
   - Debe desaparecer de la lista después de confirmar
   - Debe funcionar el borrado lógico

## Logging para Debugging

Se agregó logging detallado en todas las operaciones:

```typescript
console.log("🔄 Cargando tareas para fase:", phaseId);
console.log("✅ Tareas cargadas:", phaseTasks.length);
console.log("📝 Actualizando tarea existente:", existingTask.idTask);
console.log("📤 Datos de actualización:", updateData);
console.log("🗑️ Eliminando tarea:", task.idTask);
```

Esto permite identificar fácilmente dónde ocurren problemas en el flujo de datos.

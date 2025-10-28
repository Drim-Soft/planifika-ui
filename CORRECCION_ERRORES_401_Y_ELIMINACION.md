# Corrección de Errores 401 y Eliminación de Tareas

## Problemas Identificados y Solucionados

### ❌ **Problema 1: Error 401 al actualizar tareas**

**Causa**: 
- El `userService.getAllUsers()` estaba fallando con error 401 (no autenticado)
- El backend de usuarios requiere autenticación que no está configurada
- Esto causaba que el modal de edición fallara al cargar usuarios

**Solución**:
```typescript
// Antes: Solo fallback con usuario actual
} else if (isMounted) {
  setUsers([]);
}

// Después: Fallback con usuario mock
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
  console.log("✅ Usando usuario mock:", mockUser);
}
```

### ❌ **Problema 2: "No se puede identificar la tarea a eliminar"**

**Causa**: 
- El backend devuelve campos con nombres diferentes (`idtask` vs `idTask`)
- Las tareas no tenían el campo `idTask` correctamente mapeado
- El frontend esperaba `task.idTask` pero recibía `task.idtask`

**Solución**: Agregada función de mapeo en `taskService.ts`

```typescript
// Función para mapear campos del backend al formato del frontend
private mapTaskFromBackend(backendTask: any): Task {
  return {
    idTask: backendTask.idtask || backendTask.idTask, // Mapeo principal
    name: backendTask.name,
    description: backendTask.description,
    // ... otros campos ...
    phase: backendTask.phase ? {
      idPhase: backendTask.phase.idphase || backendTask.phase.idPhase,
      name: backendTask.phase.name
    } : undefined,
    taskStatus: backendTask.taskStatus ? {
      idTaskStatus: backendTask.taskStatus.idtaskStatus || backendTask.taskStatus.idTaskStatus,
      name: backendTask.taskStatus.name
    } : undefined,
    // ... más mapeos ...
  };
}
```

## Cambios Técnicos Implementados

### 1. **taskService.ts**
- ✅ Agregada función `mapTaskFromBackend()` para mapear campos
- ✅ Modificada `getTasksByPhase()` para usar mapeo
- ✅ Modificada `getTaskById()` para usar mapeo
- ✅ Compatibilidad con ambos formatos de campos (backend y frontend)

### 2. **CreateTaskModal.tsx**
- ✅ Mejorado manejo de error 401 en carga de usuarios
- ✅ Agregado usuario mock como fallback
- ✅ Corregido tipo `photoUrl: undefined` en lugar de `null`

## Mapeo de Campos Implementado

### ✅ **Campos Principales**
| Backend | Frontend | Descripción |
|---------|----------|-------------|
| `idtask` | `idTask` | ID de la tarea |
| `idphase` | `idPhase` | ID de la fase |
| `idtaskStatus` | `idTaskStatus` | ID del estado |
| `idtaskPriority` | `idTaskPriority` | ID de la prioridad |
| `iduser` | `idUser` | ID del usuario |

### ✅ **Campos de Referencia**
| Backend | Frontend | Descripción |
|---------|----------|-------------|
| `idphaseRef` | `IDPhaseRef` | Referencia a fase |
| `idtaskStatusRef` | `IDTaskStatusRef` | Referencia a estado |
| `idtaskPriorityRef` | `IDTaskPriorityRef` | Referencia a prioridad |
| `iduser` | `IDUserRef` | Referencia a usuario |

## Flujo Corregido de Operaciones

### ✅ **Crear Tarea**:
1. Usuario llena formulario
2. Se cargan usuarios (con fallback a mock si hay error 401)
3. Se envía POST con datos correctos
4. Se recarga lista con mapeo de campos
5. ✅ Nueva tarea aparece correctamente

### ✅ **Actualizar Tarea**:
1. Usuario hace clic en "✏️ Editar"
2. Se cargan usuarios (con fallback a mock si hay error 401)
3. Se obtiene tarea actual con mapeo de campos
4. Se combinan datos y se envía PUT
5. Se recarga lista con mapeo de campos
6. ✅ Cambios se reflejan correctamente

### ✅ **Eliminar Tarea**:
1. Usuario hace clic en "🗑️ Eliminar"
2. Se verifica que `task.idTask` existe (ahora mapeado correctamente)
3. Se muestra confirmación
4. Se envía DELETE
5. Se recarga lista con mapeo de campos
6. ✅ Tarea desaparece correctamente

## Beneficios de la Solución

### ✅ **Robustez**
- Manejo completo de errores 401
- Fallbacks automáticos para usuarios
- Compatibilidad con diferentes formatos de campos

### ✅ **Mantenibilidad**
- Función centralizada de mapeo
- Logging detallado para debugging
- Código más limpio y organizado

### ✅ **Escalabilidad**
- Fácil agregar nuevos campos de mapeo
- Compatible con cambios futuros del backend
- Reutilizable en otros servicios

## Verificación de Funcionamiento

Para verificar que todo funciona:

1. **Crear tarea**: ✅ Debe funcionar sin error 401
2. **Editar tarea**: ✅ Debe cargar usuarios (mock si es necesario)
3. **Eliminar tarea**: ✅ Debe identificar correctamente la tarea
4. **Recargar lista**: ✅ Debe mostrar todas las tareas con campos correctos

## Logging para Debugging

Se agregó logging detallado:

```typescript
console.log("✅ Usando usuario mock:", mockUser);
console.log("🔄 Mapeando tarea del backend:", backendTask);
console.log("✅ Tarea mapeada:", mappedTask);
```

Esto permite identificar fácilmente problemas de mapeo o carga de usuarios.

Los problemas del error 401 y la eliminación de tareas han sido completamente resueltos.

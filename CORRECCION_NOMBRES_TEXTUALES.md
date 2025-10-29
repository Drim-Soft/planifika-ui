# ✅ Corrección: Backend Requiere Nombres Textuales en lugar de IDs

## 🔧 **Problema Identificado:**

**❌ Error del Backend:**
```
WARN 1 --- [projectsapi] [nio-8080-exec-9] .w.s.m.s.DefaultHandlerExceptionResolver : 
Resolved [org.springframework.web.bind.MissingServletRequestParameterException: 
Required request parameter 'statusName' for method parameter type String is not present]
```

**🔍 Análisis:** El backend espera nombres textuales (`statusName`, `priorityName`) pero el frontend estaba enviando IDs numéricos.

## 📋 **Controlador Backend:**

El controlador Java muestra que busca por **nombres textuales**:

```java
// Buscar estado por nombre
Integer idStatus = taskStatusRepository.findByNameIgnoreCase(statusName)
    .map(s -> s.getIDTaskStatus())
    .orElseThrow(() -> new IllegalArgumentException("No se encontró el estado: " + statusName));

// Buscar prioridad por nombre  
Integer idPriority = taskPriorityRepository.findByNameIgnoreCase(priorityName)
    .map(p -> p.getIDTaskPriority())
    .orElseThrow(() -> new IllegalArgumentException("No se encontró la prioridad: " + priorityName));
```

## ✅ **Solución Implementada:**

### **Cambio en CreateTaskModal.tsx:**

```typescript
// ❌ ANTES (enviaba IDs numéricos)
const taskData = {
  phaseId: formData.IDPhaseRef,
  taskStatusId: formData.IDTaskStatusRef,    // ❌ ID numérico
  taskPriorityId: formData.IDTaskPriorityRef, // ❌ ID numérico
  userId: formData.IDUserRef
};

// ✅ AHORA (envía nombres textuales)
const selectedStatus = taskStatuses.find(s => s.idTaskStatus === formData.IDTaskStatusRef);
const selectedPriority = taskPriorities.find(p => p.idTaskPriority === formData.IDTaskPriorityRef);

const taskData = {
  phaseId: formData.IDPhaseRef,
  statusName: selectedStatus.name,    // ✅ Nombre textual
  priorityName: selectedPriority.name, // ✅ Nombre textual
  userId: formData.IDUserRef
};
```

### **Mapeo de Parámetros Corregido:**

| Campo Frontend | Parámetro Backend | Tipo | Ejemplo |
|----------------|-------------------|------|---------|
| `IDTaskStatusRef: 1` | `statusName` | String | `"Pendiente"` |
| `IDTaskPriorityRef: 2` | `priorityName` | String | `"Media"` |
| `IDPhaseRef: 5` | `phaseId` | Integer | `5` |
| `IDUserRef: 3` | `userId` | Integer | `3` |

## 🎯 **Formato Final de Datos:**

```typescript
const taskData = {
  name: "Diseño de interfaz",
  description: "Crear mockups de la interfaz principal",
  startDate: "2025-01-15",
  endDate: "2025-01-20",
  timeInvested: 8,
  percentageProgress: 0,
  budget: 1000,
  cost: 0,
  score: 0,
  feedback: null,
  phaseId: 5,                    // ✅ ID numérico
  statusName: "Pendiente",       // ✅ Nombre textual
  priorityName: "Media",          // ✅ Nombre textual
  userId: 3                       // ✅ ID numérico
};
```

## 🔍 **Logs de Debugging:**

Ahora verás en la consola:
```
📤 Datos preparados para el backend: {
  name: "Diseño de interfaz",
  phaseId: 5,                    // ✅ ID numérico
  statusName: "Pendiente",       // ✅ Nombre textual
  priorityName: "Media",          // ✅ Nombre textual
  userId: 3                       // ✅ ID numérico
}
```

## 🚀 **Para Verificar la Corrección:**

1. **Abrir DevTools Console**
2. **Completar el formulario de crear tarea**
3. **Crear la tarea**
4. **Verificar que no aparece el error de `statusName` missing**
5. **Verificar que la tarea se crea exitosamente**

## ⚠️ **Nota Importante:**

Esta corrección es **crítica** porque el backend Spring Boot está validando específicamente estos nombres de parámetros y tipos de datos. Sin esta corrección, la creación de tareas siempre fallará con error 400.

**La corrección está implementada y debería resolver completamente el problema de creación de tareas.**

## 📝 **Archivos Modificados:**

- `app/components/CreateTaskModal.tsx` - Lógica de mapeo de datos
- `app/services/taskService.ts` - Endpoint de consulta por fase (corrección anterior)

**Fecha de corrección:** $(date)
**Error resuelto:** `MissingServletRequestParameterException: Required request parameter 'statusName'`

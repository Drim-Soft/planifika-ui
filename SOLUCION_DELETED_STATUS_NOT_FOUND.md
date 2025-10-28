# Solución al Error "Deleted status not found"

## Problema Identificado

El error "Deleted status not found" ocurre porque el método `deleteTask` en el backend Java está buscando un estado de tarea llamado "Deleted" o "Eliminado", pero este estado no existe en la base de datos.

## Estados de Tareas Disponibles

Según la consulta al endpoint `/api/v1/task-status`, los estados disponibles son:

```json
[
  {"name":"Pendiente","idtaskStatus":1},
  {"name":"En Ejecución","idtaskStatus":2},
  {"name":"Terminada","idtaskStatus":3}
]
```

**No existe un estado "Deleted" o "Eliminado".**

## Soluciones Propuestas

### ✅ **Solución 1: Usar Estado Existente (Recomendada)**

Modificar el método `deleteTask` para usar el estado "Terminada" en lugar de buscar "Deleted":

```java
public void deleteTask(Integer id) {
    Task task = taskRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Task not found"));

    // Usar el estado "Terminada" en lugar de buscar "Deleted" o "Eliminado"
    TaskStatus deletedStatus = taskStatusRepository.findAll().stream()
            .filter(ts -> ts.getName().equalsIgnoreCase("Terminada"))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Terminada status not found"));

    task.setTaskStatus(deletedStatus);
    taskRepository.save(task);
}
```

### ✅ **Solución 2: Crear Estado Dinámicamente**

Modificar el método para crear el estado "Eliminado" si no existe:

```java
public void deleteTaskWithStatusCreation(Integer id) {
    Task task = taskRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Task not found"));

    // Buscar estado "Eliminado" o "Deleted"
    Optional<TaskStatus> deletedStatusOpt = taskStatusRepository.findAll().stream()
            .filter(ts -> ts.getName().equalsIgnoreCase("Deleted") ||
                          ts.getName().equalsIgnoreCase("Eliminado"))
            .findFirst();

    TaskStatus deletedStatus;
    if (deletedStatusOpt.isPresent()) {
        deletedStatus = deletedStatusOpt.get();
    } else {
        // Crear el estado "Eliminado" si no existe
        deletedStatus = new TaskStatus();
        deletedStatus.setName("Eliminado");
        deletedStatus = taskStatusRepository.save(deletedStatus);
    }

    task.setTaskStatus(deletedStatus);
    taskRepository.save(task);
}
```

### ✅ **Solución 3: Crear Estado Manualmente**

Crear el estado "Eliminado" directamente en la base de datos:

```sql
INSERT INTO task_status (name) VALUES ('Eliminado');
```

## Recomendación

**Usar la Solución 1** porque:

1. **Simplicidad**: No requiere cambios en la base de datos
2. **Consistencia**: Usa estados existentes
3. **Funcionalidad**: "Terminada" es semánticamente similar a "Eliminado" para borrado lógico
4. **Mantenibilidad**: No agrega complejidad al código

## Implementación en el Backend

### Archivo: `TaskService.java`

```java
@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private TaskStatusRepository taskStatusRepository;
    
    public void deleteTask(Integer id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        // Usar el estado "Terminada" para borrado lógico
        TaskStatus deletedStatus = taskStatusRepository.findAll().stream()
                .filter(ts -> ts.getName().equalsIgnoreCase("Terminada"))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Terminada status not found"));

        task.setTaskStatus(deletedStatus);
        taskRepository.save(task);
    }
}
```

## Verificación

Después de implementar la solución:

1. **Probar eliminación**: Debe funcionar sin error
2. **Verificar estado**: La tarea debe cambiar a "Terminada"
3. **Verificar borrado lógico**: La tarea debe seguir existiendo pero marcada como terminada

## Alternativas de Estados

Si prefieres usar un estado diferente para borrado lógico:

- **"Terminada"**: Indica que la tarea está completa (recomendado)
- **"Cancelada"**: Indica que la tarea fue cancelada
- **"Archivada"**: Indica que la tarea fue archivada

## Impacto en el Frontend

El frontend no necesita cambios porque:

1. La tarea sigue existiendo en la base de datos
2. Solo cambia su estado a "Terminada"
3. El frontend puede filtrar tareas por estado si es necesario
4. La funcionalidad de eliminación sigue funcionando

## Conclusión

El problema se resuelve modificando el backend Java para usar el estado "Terminada" existente en lugar de buscar un estado "Deleted" que no existe. Esta es la solución más simple y efectiva.

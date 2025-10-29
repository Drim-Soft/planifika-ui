# 🔧 Instrucciones para Verificar la Corrección

## ⚠️ **Importante: Limpiar Caché del Navegador**

El error puede persistir debido a que el navegador está usando una versión en caché del código JavaScript. 

### **Pasos para Limpiar la Caché:**

1. **Abrir DevTools** (F12)
2. **Ir a la pestaña "Network"**
3. **Hacer clic derecho en el botón de recarga**
4. **Seleccionar "Empty Cache and Hard Reload"**

O alternativamente:
1. **Ctrl + Shift + R** (Chrome/Firefox)
2. **Ctrl + F5** (Windows)
3. **Cmd + Shift + R** (Mac)

## 🔍 **Verificar la Corrección:**

### **1. Abrir DevTools Console**
- Presionar **F12**
- Ir a la pestaña **"Console"**

### **2. Crear una Nueva Tarea**
- Navegar a un proyecto
- Hacer clic en una fase
- Hacer clic en "Nueva Tarea"
- Completar el formulario
- Hacer clic en "Crear Tarea"

### **3. Verificar los Logs**
Deberías ver en la consola:

```
📤 Datos preparados para el backend: {
  name: "nombre de la tarea",
  phaseId: 5,
  statusName: "Pendiente",        // ✅ Nombre textual
  priorityName: "Media",          // ✅ Nombre textual
  userId: 3
}
🔍 Estado seleccionado: {idTaskStatus: 1, name: "Pendiente"}
🔍 Prioridad seleccionada: {idTaskPriority: 2, name: "Media"}
🔍 statusName: Pendiente
🔍 priorityName: Media
📤 FormData keys: ["file", "name", "description", "phaseId", "statusName", "priorityName", "userId", ...]
📤 FormData values:
  file: [object File]
  name: nombre de la tarea
  phaseId: 5
  statusName: Pendiente          // ✅ Correcto
  priorityName: Media            // ✅ Correcto
  userId: 3
```

### **4. Verificar que NO aparece el error:**
- ❌ **NO debería aparecer:** `MissingServletRequestParameterException: Required request parameter 'statusName'`
- ✅ **SÍ debería aparecer:** `✅ Tarea creada correctamente`

## 🚨 **Si el Error Persiste:**

### **Opción 1: Verificar que los datos se cargan correctamente**
En la consola deberías ver:
```
✅ Estados cargados: [{idTaskStatus: 1, name: "Pendiente"}, ...]
✅ Prioridades cargadas: [{idTaskPriority: 1, name: "Alta"}, ...]
```

### **Opción 2: Verificar el endpoint del backend**
El endpoint debería ser:
```
POST http://localhost:8080/api/v1/tasks/create-with-file
```

### **Opción 3: Reiniciar el servidor**
```bash
# Detener el servidor (Ctrl+C)
# Luego ejecutar:
npm run dev
```

## 📝 **Notas Técnicas:**

- La corrección convierte IDs numéricos a nombres textuales
- El backend espera `statusName` y `priorityName` como strings
- Los logs adicionales ayudan a debuggear el problema
- La caché del navegador puede causar que persista el error

## ✅ **Resultado Esperado:**

Después de limpiar la caché y crear una tarea, deberías ver:
1. **Logs detallados** en la consola
2. **Nombres textuales** en lugar de IDs
3. **Tarea creada exitosamente**
4. **Sin errores** en el backend

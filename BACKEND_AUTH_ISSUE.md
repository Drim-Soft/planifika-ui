# Problema de Autenticación - Backend Issue

## 🚨 Problema Identificado

El endpoint `/auth/me` del backend **NO está devolviendo la información completa del usuario** desde la base de datos de la aplicación.

### Lo que está devolviendo actualmente:
```json
{
  "id": "5d96c925-0b31-4e83-a822-c7154614c222",
  "aud": "authenticated", 
  "role": "authenticated",
  "email": "juandi@javeriana.edu.co",
  "email_confirmed_at": "2025-10-15T03:24:02.943285Z",
  // ... otros campos de Supabase
}
```

### Lo que DEBERÍA devolver:
```json
{
  "userId": 123,
  "name": "Juan Diego",
  "email": "juandi@javeriana.edu.co", 
  "photoUrl": "...",
  "userType": 2,  // ← ESTE CAMPO FALTA
  "idusertype": 2, // ← ESTE CAMPO FALTA
  "iduserstatus": 1,
  "idorganization": 456
}
```

## 🔧 Solución Requerida en el Backend

El endpoint `/auth/me` debe:

1. **Hacer JOIN con la tabla de usuarios** de la aplicación
2. **Devolver el campo `userType` o `idusertype`** desde la base de datos
3. **Incluir todos los campos necesarios** como `name`, `photoUrl`, etc.

### Ejemplo de consulta SQL necesaria:
```sql
SELECT 
  u.iduser as userId,
  u.name,
  u.email,
  u.photourl as photoUrl,
  u.idusertype as userType,
  u.iduserstatus,
  u.idorganization
FROM users u
WHERE u.supabaseuserid = $1
```

## 🛠️ Solución Temporal Implementada

En el frontend se implementó:

1. **Fallback a `UserRole.EXTERNAL`** cuando no se encuentra `userType`
2. **Múltiples intentos** de obtener información por diferentes endpoints
3. **Logging detallado** para debuggear el problema

### Endpoints que se intentan en orden:
1. `/auth/me` (principal)
2. `/users/supabase/{id}` (fallback 1)
3. `/users/me` (fallback 2) 
4. `/users/email/{email}` (fallback 3)

## 📋 Acciones Requeridas

### Inmediato (Backend):
- [ ] Corregir el endpoint `/auth/me` para hacer JOIN con tabla users
- [ ] Asegurar que devuelva `userType`/`idusertype`
- [ ] Verificar que devuelva `name`, `photoUrl`, etc.

### Opcional (Backend):
- [ ] Implementar endpoint `/users/supabase/{id}` 
- [ ] Implementar endpoint `/users/email/{email}`
- [ ] Mejorar manejo de errores en endpoints de usuario

### Frontend:
- [x] Implementar fallback temporal
- [x] Agregar logging detallado
- [x] Manejar casos donde `userType` es undefined

## 🧪 Para Probar la Solución

1. **Hacer login** y revisar la consola del navegador
2. **Verificar** que aparezcan los warnings sobre el problema del backend
3. **Confirmar** que el usuario se loguea con `role: 2` (EXTERNAL) como fallback
4. **Una vez corregido el backend**, el `userType` real se usará automáticamente

## 📝 Notas

- La solución temporal usa `UserRole.EXTERNAL` (2) como fallback
- Esto es seguro porque la mayoría de usuarios son EXTERNAL
- Los admins pueden ser identificados manualmente si es necesario
- Una vez corregido el backend, no se necesitan cambios en el frontend

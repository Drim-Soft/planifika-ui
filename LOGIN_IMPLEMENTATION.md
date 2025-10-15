# Implementación del Sistema de Login

## Descripción General

Se ha implementado un sistema completo de autenticación con distinción de roles para la aplicación Planifika. El sistema permite a los usuarios iniciar sesión como administradores o usuarios externos, con redirección automática basada en sus roles.

## Componentes Implementados

### 1. Servicios de Autenticación (`app/services/authService.ts`)

- **`login(data: LoginRequest)`**: Autentica al usuario con email y contraseña
- **`getCurrentUser(accessToken: string)`**: Obtiene información del usuario autenticado
- **`signup(data: SignupRequest)`**: Registra nuevos usuarios

### 2. Contexto de Autenticación (`app/contexts/AuthContext.tsx`)

- Maneja el estado global de autenticación
- Proporciona funciones de login, logout y signup
- Gestiona el almacenamiento en localStorage
- Redirección automática basada en roles

### 3. Páginas de Login

#### Admin Login (`app/pages/admin-login/page.tsx`)
- Formulario de login para administradores y usuarios externos
- Validación de campos
- Manejo de errores
- Spinner de carga

#### Student Login (`app/pages/student-login/page.tsx`)
- Formulario de login para estudiantes
- Misma funcionalidad que admin login
- Interfaz específica para estudiantes

### 4. Componentes de Protección

#### ProtectedRoute (`app/components/ProtectedRoute.tsx`)
- Protege rutas basándose en roles y permisos
- Redirección automática si no se cumplen los requisitos
- Loading state durante verificación

#### Hook useAuthRedirect (`app/hooks/useAuthRedirect.ts`)
- Hook personalizado para manejar redirecciones
- Verificación de roles
- Control de acceso a rutas

### 5. Utilidades de Roles (`app/utils/roleUtils.ts`)

- **`getDefaultRouteForRole(role)`**: Obtiene la ruta por defecto para cada rol
- **`hasPermission(userRole, permission)`**: Verifica si un rol tiene un permiso
- **`isAdmin(role)`** / **`isExternal(role)`**: Verificaciones de tipo de rol

## Tipos de Usuario

### Administrador (Role: 1)
- **Ruta por defecto**: `/create-organization`
- **Permisos**: Gestión completa del sistema
- **Acceso**: Crear organizaciones, gestionar usuarios, etc.

### Usuario Externo (Role: 2)
- **Ruta por defecto**: `/dashboard`
- **Permisos**: Limitados a sus propios proyectos
- **Acceso**: Dashboard personal, proyectos propios

## Flujo de Autenticación

1. **Usuario accede a login**: Selecciona admin-login o student-login
2. **Ingresa credenciales**: Email y contraseña
3. **Autenticación**: Se envía petición al backend `/auth/login`
4. **Obtención de datos**: Se llama a `/auth/me` para obtener información del usuario
5. **Almacenamiento**: Se guarda token y datos del usuario en localStorage
6. **Redirección**: Se redirige según el rol del usuario

## Endpoints del Backend Utilizados

- `POST /auth/login`: Autenticación de usuario
- `GET /auth/me`: Información del usuario autenticado
- `POST /auth/signup`: Registro de nuevos usuarios

## Manejo de Errores

- **Errores de conexión**: Mensajes específicos para problemas de red
- **Errores de autenticación**: Credenciales incorrectas
- **Errores de permisos**: Acceso denegado por rol
- **Timeouts**: Manejo de solicitudes que tardan demasiado

## Seguridad

- Tokens JWT almacenados en localStorage
- Verificación de roles en cada petición
- Protección de rutas sensibles
- Limpieza de datos al hacer logout

## Uso en Componentes

```tsx
// Proteger una ruta completa
<ProtectedRoute requiredRole={UserRole.ADMIN}>
  <AdminDashboard />
</ProtectedRoute>

// Usar el hook de redirección
const { user, isAuthenticated } = useAuthRedirect({
  requiredRole: UserRole.ADMIN,
  fallbackRoute: '/dashboard'
});

// Verificar permisos
if (hasPermission(user.role, 'manage_users')) {
  // Mostrar funcionalidad de gestión de usuarios
}
```

## Configuración

- **API URL**: Configurada en `app/config/api.ts`
- **Roles**: Definidos en `app/types/auth.ts`
- **Permisos**: Configurados en `app/utils/roleUtils.ts`

## Próximos Pasos

1. Implementar refresh token automático
2. Agregar recuperación de contraseña
3. Implementar logout automático por inactividad
4. Agregar autenticación de dos factores
5. Implementar auditoría de accesos

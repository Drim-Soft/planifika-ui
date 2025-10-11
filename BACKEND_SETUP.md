# Configuración del Backend - Planifika UI

## Problema: Error al guardar la organización

El error "Error al guardar la organización" ocurre cuando el frontend no puede conectarse con el backend.

## Solución

### 1. Verificar que el backend esté ejecutándose

El frontend está configurado para conectarse a:
```
http://localhost:8080/api/v1
```

### 2. Pasos para iniciar el backend

1. **Navegar al directorio del backend:**
   ```bash
   cd ../planifika-backend  # o donde esté ubicado tu backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Iniciar el servidor:**
   ```bash
   npm start
   # o
   yarn start
   # o
   node server.js
   ```

4. **Verificar que esté ejecutándose:**
   - Abre tu navegador en `http://localhost:8080`
   - Deberías ver una respuesta del servidor

### 3. Verificar la configuración de CORS

Asegúrate de que tu backend tenga configurado CORS para permitir peticiones desde el frontend:

```javascript
// Ejemplo para Express.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // URL del frontend
  credentials: true
}));
```

### 4. Verificar los endpoints

El backend debe tener los siguientes endpoints disponibles:

- `GET /api/v1/organizations` - Obtener todas las organizaciones
- `POST /api/v1/organizations` - Crear nueva organización
- `PUT /api/v1/organizations/:id` - Actualizar organización
- `DELETE /api/v1/organizations/:id` - Eliminar organización

### 5. Configuración alternativa

Si tu backend está en un puerto diferente, puedes configurar la URL en el archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:TU_PUERTO/api/v1
```

### 6. Verificar la consola del navegador

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Intenta crear una organización
4. Revisa los errores mostrados en la consola

## Mensajes de error comunes

- **"No se puede conectar con el servidor"**: El backend no está ejecutándose
- **"Error del servidor: 404"**: El endpoint no existe en el backend
- **"Error del servidor: 500"**: Error interno del servidor
- **"La solicitud tardó demasiado tiempo"**: El servidor está sobrecargado o no responde

## Contacto

Si continúas teniendo problemas, verifica:
1. Que el puerto 8080 no esté siendo usado por otra aplicación
2. Que no haya un firewall bloqueando las conexiones
3. Que el backend esté configurado correctamente para aceptar peticiones HTTP

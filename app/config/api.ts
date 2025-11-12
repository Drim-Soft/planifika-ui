// Configuración de la API
export const API_CONFIG_USERS_PLANIFIKA = {
  BASE_URL: process.env.NEXT_PUBLIC_API_USERS_PLANIFIKA_URL,
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

export const API_CONFIG_ORGANIZATIONS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_ORGANIZATIONS_URL,
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

export const API_CONFIG_PROJECTS_PLANIFIKA = {
  BASE_URL: process.env.NEXT_PUBLIC_API_PROJECTS_URL,
  TIMEOUT: 15000, // 15 segundos (puede demorar más por el backend en Java)
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};
// Headers por defecto para todas las peticiones API
// Evitar forzar el header de ngrok en local para no disparar preflights (OPTIONS)
export const DEFAULT_API_HEADERS: Record<string, string> = (() => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const urls = [
    process.env.NEXT_PUBLIC_API_USERS_PLANIFIKA_URL,
    process.env.NEXT_PUBLIC_API_ORGANIZATIONS_URL,
    process.env.NEXT_PUBLIC_API_PROJECTS_URL,
  ];

  const needsNgrokBypass = urls.some((u) => typeof u === 'string' && u.includes('ngrok'));
  if (needsNgrokBypass) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }

  return headers;
})();

// Función para verificar si el backend está disponible
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG_USERS_PLANIFIKA.BASE_URL}/health`, {
      method: 'GET',
      headers: DEFAULT_API_HEADERS,
      signal: AbortSignal.timeout(API_CONFIG_USERS_PLANIFIKA.TIMEOUT),
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Función para probar la conexión con ngrok
export const testNgrokConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Testing connection to:', API_CONFIG_USERS_PLANIFIKA.BASE_URL);
    console.log('Using headers:', DEFAULT_API_HEADERS);
    
    const response = await fetch(`${API_CONFIG_USERS_PLANIFIKA.BASE_URL}/health`, {
      method: 'GET',
      headers: DEFAULT_API_HEADERS,
      signal: AbortSignal.timeout(API_CONFIG_USERS_PLANIFIKA.TIMEOUT),
    });
    
    if (response.ok) {
      return { 
        success: true, 
        message: `Conexión exitosa con ngrok: ${API_CONFIG_USERS_PLANIFIKA.BASE_URL}` 
      };
    } else {
      return { 
        success: false, 
        message: `Error del servidor: ${response.status} - ${response.statusText}` 
      };
    }
  } catch (error) {
    console.error('Ngrok connection test failed:', error);
    return { 
      success: false, 
      message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    };
  }
};

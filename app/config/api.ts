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

// Headers por defecto para todas las peticiones API
export const DEFAULT_API_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true', // Omite la advertencia de ngrok
};

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

/**
 * Configuración centralizada de URLs externas
 * 
 * Este archivo centraliza todas las URLs externas para facilitar
 * el mantenimiento y evitar URLs hardcodeadas en el código.
 */

const LANDING_BASE_URL = process.env.NEXT_PUBLIC_LANDING_BASE_URL;

export const EXTERNAL_URLS = {
  // URL principal del sistema externo
  MAIN_SYSTEM: LANDING_BASE_URL,
  
  // URLs de documentación
  DOCUMENTATION: `${LANDING_BASE_URL}/docs`,

  // URLs de soporte
  SUPPORT: `${LANDING_BASE_URL}/support`,

  // URLs de contacto
  CONTACT: `${LANDING_BASE_URL}/contact`,
} as const;

/**
 * Función helper para obtener URLs externas
 * @param key - Clave de la URL a obtener
 * @returns URL externa
 */
export const getExternalUrl = (key: keyof typeof EXTERNAL_URLS): string => {
  return EXTERNAL_URLS[key]!;
};

/**
 * Función para abrir URLs externas en nueva pestaña
 * @param key - Clave de la URL a abrir
 */
export const openExternalUrl = (key: keyof typeof EXTERNAL_URLS): void => {
  window.open(EXTERNAL_URLS[key], '_blank', 'noopener,noreferrer');
};

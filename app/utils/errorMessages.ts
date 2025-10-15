/**
 * Utility function to convert technical error messages to user-friendly messages
 */

export const getFriendlyErrorMessage = (error: string | Error | null | any): string => {
  if (!error) return '';
  
  // Handle different error types
  let errorMessage: string;
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = error.message;
  } else {
    errorMessage = error.toString();
  }
  
  // Convert to lowercase for easier matching
  const lowerError = errorMessage.toLowerCase();
  
  // Authentication errors
  if (lowerError.includes('invalid login credentials') || 
      lowerError.includes('invalid credentials') ||
      lowerError.includes('wrong password') ||
      lowerError.includes('incorrect password') ||
      lowerError.includes('authentication failed') ||
      lowerError.includes('login failed')) {
    return 'Credenciales incorrectas. Verifica tu email y contraseña.';
  }
  
  // User not found errors
  if (lowerError.includes('user not found') ||
      lowerError.includes('no user found') ||
      lowerError.includes('email not found') ||
      lowerError.includes('user does not exist')) {
    return 'No se encontró una cuenta con este email.';
  }
  
  // Network/connection errors
  if (lowerError.includes('network error') ||
      lowerError.includes('connection failed') ||
      lowerError.includes('timeout') ||
      lowerError.includes('fetch failed') ||
      lowerError.includes('connection refused')) {
    return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
  }
  
  // Server errors
  if (lowerError.includes('internal server error') ||
      lowerError.includes('server error') ||
      lowerError.includes('500') ||
      lowerError.includes('service unavailable')) {
    return 'Error del servidor. Intenta nuevamente en unos minutos.';
  }
  
  // Rate limiting
  if (lowerError.includes('too many requests') ||
      lowerError.includes('rate limit') ||
      lowerError.includes('429')) {
    return 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.';
  }
  
  // Account status errors
  if (lowerError.includes('account disabled') ||
      lowerError.includes('account suspended') ||
      lowerError.includes('account locked')) {
    return 'Tu cuenta está deshabilitada. Contacta al administrador.';
  }
  
  // Email verification errors
  if (lowerError.includes('email not verified') ||
      lowerError.includes('verify your email') ||
      lowerError.includes('email verification')) {
    return 'Debes verificar tu email antes de iniciar sesión.';
  }
  
  // Generic fallback for unknown errors
  return 'Error al iniciar sesión. Verifica tus credenciales e intenta nuevamente.';
};

export const getFriendlySignupErrorMessage = (error: string | Error | null | any): string => {
  if (!error) return '';
  
  // Handle different error types
  let errorMessage: string;
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = error.message;
  } else {
    errorMessage = error.toString();
  }
  const lowerError = errorMessage.toLowerCase();
  
  // Email already exists
  if (lowerError.includes('email already exists') ||
      lowerError.includes('user already exists') ||
      lowerError.includes('email already registered') ||
      lowerError.includes('duplicate email')) {
    return 'Ya existe una cuenta con este email.';
  }
  
  // Invalid email format
  if (lowerError.includes('invalid email') ||
      lowerError.includes('email format')) {
    return 'Formato de email inválido.';
  }
  
  // Weak password
  if (lowerError.includes('weak password') ||
      lowerError.includes('password too weak') ||
      lowerError.includes('password requirements')) {
    return 'La contraseña no cumple con los requisitos de seguridad.';
  }
  
  // Use the same logic as login for other errors
  return getFriendlyErrorMessage(error);
};

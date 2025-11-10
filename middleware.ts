import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/create-organization'];
  
  // Rutas que solo pueden acceder usuarios no autenticados
  const publicRoutes = ['/pages/signup', '/pages/student-login', '/pages/admin-login'];
  
  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Obtener el token del localStorage (esto se maneja en el cliente)
  // El middleware de Next.js no puede acceder al localStorage directamente
  // Por eso la protección real se hace en los componentes
  
  // Solo redirigir rutas obvias
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

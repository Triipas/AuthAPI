// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 🎨 Rutas excluidas del middleware (para testing)
    const excludedRoutes = ['/test', '/demo', '/playground'];
    if (excludedRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next(); // No hacer nada, dejar pasar
    }

    const token = request.cookies.get('token')?.value ||
        request.headers.get('authorization');

    // Rutas públicas (no requieren autenticación)
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Si no hay token y la ruta es privada → redirigir a login
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si hay token y está en login/register → redirigir a dashboard
    if (token && isPublicRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
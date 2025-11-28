import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rutas completamente públicas
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Rutas excluidas del proxy (para testing/desarrollo)
    const excludedRoutes = ['/test', '/demo', '/playground'];
    const isExcludedRoute = excludedRoutes.some(route => pathname.startsWith(route));
    
    if (isExcludedRoute) {
        return NextResponse.next();
    }

    // 🔑 Leer el token de la cookie
    const token = request.cookies.get('token')?.value;

    // Si NO hay token y la ruta NO es pública → Redirigir a login
    if (!token && !isPublicRoute) {
        console.log('[Middleware] 🚫 No token, redirecting', pathname, '→ /login');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si SÍ hay token y está intentando acceder a login/register → Redirigir a dashboard
    if (token && isPublicRoute) {
        console.log('[Middleware] ✅ Has token, redirecting', pathname, '→ /dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg).*)',
    ],
};
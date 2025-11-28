import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    //Rutas completamente públicas (siempre accesibles)
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    //Rutas excluidas del proxy (para testing/desarrollo)
    const excludedRoutes = ['/test', '/demo', '/playground'];
    const isExcludedRoute = excludedRoutes.some(route => pathname.startsWith(route));
    
    if (isExcludedRoute) {
        return NextResponse.next(); // Dejar pasar sin verificar Token
    }

    //Verificar si hay Token (cookie)
    const Token = request.cookies.get('Token')?.value;
    
    // Si NO hay Token y la ruta NO es pública → Redirigir a login
    if (!Token && !isPublicRoute) {
        console.log(`[Proxy] No Token found, redirecting ${pathname} → /login`);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si SÍ hay Token y está intentando acceder a login/register → Redirigir a dashboard
    if (Token && isPublicRoute) {
        console.log(`[Proxy] Token exists, redirecting ${pathname} → /dashboard`);
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // ========================================
    // 5. Todo OK, continuar
    // ========================================
    return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el proxy
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - archivos estáticos (.svg, .png, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg).*)',
    ],
};
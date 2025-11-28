// Utilidades para manejar cookies en el cliente

export const cookies = {
  // Guardar cookie
  set: (name: string, value: string, days: number = 7) => {
    if (typeof window === 'undefined') {
      console.warn('[Cookies] Cannot set cookie on server side');
      return;
    }
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    // Usar nombre en minúsculas
    const cookieName = name.toLowerCase();
    
    // Establecer cookie
    const cookieString = `${cookieName}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    document.cookie = cookieString;
    
    console.log('[Cookies] ✅ Set cookie:', cookieName);
    console.log('[Cookies] 📝 Cookie string length:', cookieString.length);
    console.log('[Cookies] 🔍 All cookies:', document.cookie);
    
    // Verificar inmediatamente
    const verify = cookies.get(cookieName);
    console.log('[Cookies] ✔️ Immediate verification:', !!verify);
  },

  // Obtener cookie
  get: (name: string): string | null => {
    if (typeof window === 'undefined') {
      console.warn('[Cookies] Cannot get cookie on server side');
      return null;
    }
    
    const cookieName = name.toLowerCase();
    const nameEQ = cookieName + "=";
    const ca = document.cookie.split(';');
    
    console.log('[Cookies] 🔍 Searching for:', cookieName);
    console.log('[Cookies] 📋 Available cookies:', document.cookie);
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        console.log('[Cookies] ✅ Found cookie:', cookieName, '(length:', value.length, ')');
        return value;
      }
    }
    
    console.log('[Cookies] ❌ Cookie not found:', cookieName);
    return null;
  },

  // Eliminar cookie
  remove: (name: string) => {
    if (typeof window === 'undefined') return;
    
    const cookieName = name.toLowerCase();
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    console.log('[Cookies] 🗑️ Removed cookie:', cookieName);
  },

  // Verificar si existe una cookie
  exists: (name: string): boolean => {
    return cookies.get(name) !== null;
  },
  
  // Debug: listar todas las cookies
  list: (): void => {
    if (typeof window === 'undefined') return;
    console.log('[Cookies] 📋 All cookies:', document.cookie);
  }
};
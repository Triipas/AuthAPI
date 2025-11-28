import {
  LoginDTO,
  RegisterDTO,
  AuthResponse,
  ApiError,
  PaginatedResponse,
  Producto,
  Categoria,
  PerfilResponseDTO,
  ActualizarPerfilDTO,
  ConfiguracionAparienciaDTO,
  ConfiguracionIdiomaDTO,
  ConfiguracionNotificacionesDTO,
  ConfiguracionPrivacidadDTO,
  ConfiguracionAccesibilidadDTO,
  CambiarPasswordDTO
} from '@/types';
import { cookies } from '@/utils/cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      // Primero intentar de cookie
      const tokenFromCookie = cookies.get('token');
      if (tokenFromCookie) {
        console.log('[API] Token found in cookie');
        return tokenFromCookie;
      }

      // Fallback a localStorage
      const tokenFromStorage = localStorage.getItem('token');
      if (tokenFromStorage) {
        console.log('[API] Token found in localStorage');
        return tokenFromStorage;
      }
      
      console.log('[API] No token found');
    }
    return null;
  }

  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Error en la petición';
      let errorDetails = null;

      try {
        const errorData = await response.json();

        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        }

        if (errorData.errors) {
          errorDetails = errorData.errors;
          console.error('Validation errors:', errorData.errors);
        }

        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorData
        });

      } catch (parseError) {
        errorMessage = `${response.status}: ${response.statusText}`;
        console.error('Could not parse error response:', parseError);
      }

      const error: ApiError = {
        Message: errorMessage,
        Errors: errorDetails
      };

      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  
  async login(data: LoginDTO): Promise<AuthResponse> {
    console.log('[API] 🔐 Attempting login for:', data.Email);
    
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<AuthResponse>(response);
    console.log('[API] ✅ Login response received:', {
      email: result.Email,
      roles: result.Roles,
      hasToken: !!result.Token,
      tokenPreview: result.Token ? result.Token.substring(0, 20) + '...' : 'NO TOKEN'
    });

    if (result.Token) {
      console.log('[API] 💾 Saving token to cookie and localStorage...');
      
      // 1. Cookie (principal)
      cookies.set('token', result.Token, 1);
      console.log('[API] ✅ Token saved to cookie');
      
      // 2. LocalStorage (backup)
      localStorage.setItem('token', result.Token);
      console.log('[API] ✅ Token saved to localStorage');
      
      // 3. User info
      const userInfo = {
        email: result.Email,
        nombreCompleto: result.NombreCompleto,
        roles: result.Roles
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      console.log('[API] ✅ User info saved:', userInfo);
      
      // 4. Verificar que se guardó correctamente
      const verification = cookies.get('token');
      console.log('[API] 🔍 Verification - Cookie exists:', !!verification);
      
    } else {
      console.error('[API] ❌ No token in response!');
    }

    return result;
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    console.log('[API] 🔐 Attempting registration for:', data.Email);
    
    const response = await fetch(`${API_URL}/Auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<AuthResponse>(response);
    console.log('[API] ✅ Registration response received:', {
      email: result.Email,
      roles: result.Roles,
      hasToken: !!result.Token
    });

    if (result.Token) {
      console.log('[API] 💾 Saving token to cookie and localStorage...');
      
      // Cookie
      cookies.set('token', result.Token, 1);
      console.log('[API] ✅ Token saved to cookie');
      
      // LocalStorage
      localStorage.setItem('token', result.Token);
      console.log('[API] ✅ Token saved to localStorage');
      
      // User info
      const userInfo = {
        email: result.Email,
        nombreCompleto: result.NombreCompleto,
        roles: result.Roles
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      console.log('[API] ✅ User info saved');
      
      // Verificación
      const verification = cookies.get('token');
      console.log('[API] 🔍 Verification - Cookie exists:', !!verification);
    } else {
      console.error('[API] ❌ No token in response!');
    }

    return result;
  }

  logout() {
    console.log('[API] 🚪 Logging out...');
    
    if (typeof window !== 'undefined') {
      cookies.remove('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.log('[API] ✅ Logout complete');
    }
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    console.log('[API] 🔍 Is authenticated:', hasToken);
    return hasToken;
  }

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // ============================================
  // PRODUCTOS ENDPOINTS
  // ============================================
  
  async getProductos(params?: any): Promise<PaginatedResponse<Producto>> {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    const response = await fetch(`${API_URL}/Productos${queryString}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<PaginatedResponse<Producto>>(response);
  }

  async getProductosBajoStock(): Promise<Producto[]> {
    const response = await fetch(`${API_URL}/Productos/bajo-stock`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<Producto[]>(response);
  }

  // ============================================
  // CATEGORÍAS ENDPOINTS
  // ============================================
  
  async getCategorias(): Promise<Categoria[]> {
    const response = await fetch(`${API_URL}/Categorias`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<Categoria[]>(response);
  }

  // ============================================
  // PERFIL ENDPOINTS
  // ============================================
  
  async obtenerPerfil(): Promise<PerfilResponseDTO> {
    const response = await fetch(`${API_URL}/Perfil`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<PerfilResponseDTO>(response);
  }

  async actualizarPerfil(data: ActualizarPerfilDTO): Promise<PerfilResponseDTO> {
    const response = await fetch(`${API_URL}/Perfil`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<PerfilResponseDTO>(response);
  }

  async actualizarApariencia(data: ConfiguracionAparienciaDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/apariencia`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  async actualizarIdioma(data: ConfiguracionIdiomaDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/idioma`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  async actualizarNotificaciones(data: ConfiguracionNotificacionesDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/notificaciones`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  async actualizarPrivacidad(data: ConfiguracionPrivacidadDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/privacidad`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  async actualizarAccesibilidad(data: ConfiguracionAccesibilidadDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/accesibilidad`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  async subirFotoPerfil(archivo: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const response = await fetch(`${API_URL}/Perfil/foto`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: formData,
    });
    return this.handleResponse<{ url: string }>(response);
  }

  async eliminarFotoPerfil(): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/foto`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<void>(response);
  }

  async cambiarPassword(data: CambiarPasswordDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/cambiar-password`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  async solicitarRestablecerPassword(email: string): Promise<{ message: string; Token?: string }> {
    const response = await fetch(`${API_URL}/Perfil/restablecer-password-request`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ Email: email }),
    });
    return this.handleResponse<{ message: string; Token?: string }>(response);
  }

  async restablecerPassword(data: { Email: string; Token: string; NuevaPassword: string }): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/restablecer-password`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }
}

export const api = new ApiService();
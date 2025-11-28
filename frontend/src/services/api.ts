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
      const Token = this.getToken();
      if (Token) {
        headers['Authorization'] = `Bearer ${Token}`;
      }
    }

    return headers;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      // Primero intentar de cookie (más seguro)
      const TokenFromCookie = cookies.get('Token');
      if (TokenFromCookie) return TokenFromCookie;

      // Fallback a localStorage (por compatibilidad)
      return localStorage.getItem('Token');
    }
    return null;
  }

  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Intentar obtener el error del servidor
      let errorMessage = 'Error en la petición';
      let errorDetails = null;

      try {
        const errorData = await response.json();

        // El backend puede devolver diferentes formatos de error
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        }

        // ASP.NET Core validation errors
        if (errorData.errors) {
          errorDetails = errorData.errors;
          console.error('Validation errors:', errorData.errors);
        }

        // Log completo del error para debugging
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorData
        });

      } catch (parseError) {
        // Si no se puede parsear el JSON, usar el status text
        errorMessage = `${response.status}: ${response.statusText}`;
        console.error('Could not parse error response:', parseError);
      }

      // Crear objeto de error
      const error: ApiError = {
        Message: errorMessage,
        Errors: errorDetails
      };

      throw error;
    }

    // Para respuestas 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth endpoints
  async login(data: LoginDTO): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<AuthResponse>(response);

    // Guardar Token en COOKIE (para middleware) y localStorage (backup)
    if (result.Token) {
      // Cookie (expira en 1 día, igual que el Token JWT)
      cookies.set('Token', result.Token, 1);

      // LocalStorage (backup para código legacy)
      localStorage.setItem('Token', result.Token);

      // Guardar info del usuario solo en localStorage (no sensible)
      localStorage.setItem('user', JSON.stringify({
        email: result.Email,
        nombreCompleto: result.NombreCompleto,
        roles: result.Roles
      }));
    }

    return result;
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/Auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<AuthResponse>(response);

    // Guardar Token en COOKIE y localStorage
    if (result.Token) {
      // Cookie (expira en 1 día)
      cookies.set('Token', result.Token, 1);

      // LocalStorage (backup)
      localStorage.setItem('Token', result.Token);

      // Info del usuario
      localStorage.setItem('user', JSON.stringify({
        email: result.Email,
        nombreCompleto: result.NombreCompleto,
        roles: result.Roles
      }));
    }

    return result;
  }

  logout() {
    if (typeof window !== 'undefined') {
      // Eliminar cookie
      cookies.remove('Token');

      // Eliminar localStorage
      localStorage.removeItem('Token');
      localStorage.removeItem('user');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // Productos endpoints
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

  // Categorías endpoints
  async getCategorias(): Promise<Categoria[]> {
    const response = await fetch(`${API_URL}/Categorias`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<Categoria[]>(response);
  }

  // Obtener perfil completo del usuario autenticado
  async obtenerPerfil(): Promise<PerfilResponseDTO> {
    const response = await fetch(`${API_URL}/Perfil`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse<PerfilResponseDTO>(response);
  }

  // Actualizar información básica del perfil
  async actualizarPerfil(data: ActualizarPerfilDTO): Promise<PerfilResponseDTO> {
    const response = await fetch(`${API_URL}/Perfil`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<PerfilResponseDTO>(response);
  }

  // Actualizar configuración de apariencia
  async actualizarApariencia(data: ConfiguracionAparienciaDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/apariencia`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  // Actualizar configuración de idioma
  async actualizarIdioma(data: ConfiguracionIdiomaDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/idioma`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  // Actualizar configuración de notificaciones
  async actualizarNotificaciones(data: ConfiguracionNotificacionesDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/notificaciones`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  // Actualizar configuración de privacidad
  async actualizarPrivacidad(data: ConfiguracionPrivacidadDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/privacidad`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  // Actualizar configuración de accesibilidad
  async actualizarAccesibilidad(data: ConfiguracionAccesibilidadDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/accesibilidad`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  // Subir foto de perfil
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

  // Eliminar foto de perfil
  async eliminarFotoPerfil(): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/foto`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    return this.handleResponse<void>(response);
  }

  // Cambiar contraseña
  async cambiarPassword(data: CambiarPasswordDTO): Promise<void> {
    const response = await fetch(`${API_URL}/Perfil/cambiar-password`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    return this.handleResponse<void>(response);
  }

  // Solicitar Token para restablecer contraseña
  async solicitarRestablecerPassword(email: string): Promise<{ message: string; Token?: string }> {
    const response = await fetch(`${API_URL}/Perfil/restablecer-password-request`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ Email: email }),
    });
    return this.handleResponse<{ message: string; Token?: string }>(response);
  }

  // Restablecer contraseña con Token
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
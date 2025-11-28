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
        return tokenFromCookie;
      }

      // Fallback a localStorage
      const tokenFromStorage = localStorage.getItem('token');
      if (tokenFromStorage) {
        return tokenFromStorage;
      }
    }
    return null;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Error en la petición';
      let errorDetails = null;

      try {
        const errorData = await response.json();

        if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.Title) {
          errorMessage = errorData.Title;
        }

        if (errorData.Errors) {
          errorDetails = errorData.Errors;
          console.error('Validation errors:', errorDetails);
        }

        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorData
        });

      } catch (parseError) {
        errorMessage = `${response.status}: ${response.statusText}`;
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
    const response = await fetch(`${API_URL}/Auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<AuthResponse>(response);

    if (result.Token) {
      // Guardar token en cookie y localStorage
      cookies.set('token', result.Token, 1);
      localStorage.setItem('token', result.Token);
      
      // Guardar info del usuario
      const userInfo = {
        Email: result.Email,
        NombreCompleto: result.NombreCompleto,
        Roles: result.Roles
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
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

    if (result.Token) {
      cookies.set('token', result.Token, 1);
      localStorage.setItem('token', result.Token);
      
      const userInfo = {
        Email: result.Email,
        NombreCompleto: result.NombreCompleto,
        Roles: result.Roles
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
    }

    return result;
  }

  logout() {
    if (typeof window !== 'undefined') {
      cookies.remove('token');
      localStorage.removeItem('token');
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
    // Helper para convertir strings vacíos a undefined (se omiten en JSON)
    const emptyToUndefined = (value: string | undefined | null): string | undefined => {
      if (value === undefined || value === null || value.trim() === '') {
        return undefined;
      }
      return value;
    };

    // Construir body limpiando strings vacíos
    const body: ActualizarPerfilDTO = {
      NombreCompleto: emptyToUndefined(data.NombreCompleto),
      Bio: emptyToUndefined(data.Bio),
      FechaNacimiento: emptyToUndefined(data.FechaNacimiento),
      Avatar: emptyToUndefined(data.Avatar)
    };
    
    const response = await fetch(`${API_URL}/Perfil`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(body),
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

  async subirFotoPerfil(archivo: File): Promise<{ Url: string }> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const response = await fetch(`${API_URL}/Perfil/foto`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
      },
      body: formData,
    });
    return this.handleResponse<{ Url: string }>(response);
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

  async solicitarRestablecerPassword(email: string): Promise<{ Message: string; Token?: string }> {
    const response = await fetch(`${API_URL}/Perfil/restablecer-password-request`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ Email: email }),
    });
    return this.handleResponse<{ Message: string; Token?: string }>(response);
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
import { LoginDTO, RegisterDTO, AuthResponse, ApiError } from '@/types';

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
      return localStorage.getItem('token');
    }
    return null;
  }

  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'Error en la petición'
      }));
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
    
    // Guardar token
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify({
        email: result.email,
        nombreCompleto: result.nombreCompleto,
        roles: result.roles
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
    
    // Guardar token
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify({
        email: result.email,
        nombreCompleto: result.nombreCompleto,
        roles: result.roles
      }));
    }

    return result;
  }

  logout() {
    if (typeof window !== 'undefined') {
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

  // Productos endpoints (ejemplo para futuro uso)
  async getProductos(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    const response = await fetch(`${API_URL}/Productos${queryString}`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  // Categorías endpoints (ejemplo para futuro uso)
  async getCategorias() {
    const response = await fetch(`${API_URL}/Categorias`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiService();
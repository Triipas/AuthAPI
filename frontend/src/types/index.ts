// Auth Types
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  nombreCompleto: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  nombreCompleto: string;
  roles: string[];
}

// Usuario/Perfil Types
export interface Usuario {
  id: string;
  email: string;
  nombreCompleto: string;
  fotoPerfil?: string;
  avatar?: string;
  bio?: string;
  roles: string[];
}

// Producto Types
export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagenUrl?: string;
  disponible: boolean;
  fechaCreacion: string;
  categoriaId: number;
  categoriaNombre: string;
  tieneBajoStock: boolean;
  sinStock: boolean;
}

export interface ProductoCreateDTO {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoriaId: number;
  imagen?: File;
}

// Categoria Types
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  fechaCreacion: string;
  cantidadProductos: number;
}

// Paginación
export interface PaginacionMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginacionMetadata;
}

// API Error
export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
}
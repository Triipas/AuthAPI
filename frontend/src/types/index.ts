// ============================================
// TIPOS CON PASCALCASE (CONVENCIÓN DEL BACKEND)
// Reemplaza TODO el contenido de types/index.ts
// ============================================

// Auth Types
export interface LoginDTO {
  Email: string;
  Password: string;
}

export interface RegisterDTO {
  NombreCompleto: string;
  Email: string;
  Password: string;
}

export interface AuthResponse {
  Token: string;
  Email: string;
  NombreCompleto: string;
  Roles: string[];
}

// Usuario/Perfil Types
export interface Usuario {
  Id: string;
  Email: string;
  NombreCompleto: string;
  FotoPerfil?: string;
  Avatar?: string;
  Bio?: string;
  Roles: string[];
}

// Perfil completo
export interface PerfilResponseDTO {
  Id: string;
  Email: string;
  NombreCompleto?: string;
  FotoPerfil?: string;
  Avatar?: string;
  Bio?: string;
  FechaNacimiento?: string;
  FechaRegistro: string;
  Roles: string[];
  Apariencia: ConfiguracionAparienciaDTO;
  Idioma: ConfiguracionIdiomaDTO;
  Notificaciones: ConfiguracionNotificacionesDTO;
  Privacidad: ConfiguracionPrivacidadDTO;
  Accesibilidad: ConfiguracionAccesibilidadDTO;
  Seguridad: ConfiguracionSeguridadDTO;
}

export interface ActualizarPerfilDTO {
  NombreCompleto?: string;
  Bio?: string;
  FechaNacimiento?: string;
  Avatar?: string;
}

export interface ConfiguracionAparienciaDTO {
  Tema: 'light' | 'dark' | 'auto';
  ColorPrimario: string;
  ColorSecundario: string;
  TipoFuente: 'system' | 'serif' | 'mono' | 'poppins' | 'roboto' | 'inter';
  TamanoFuente: number;
  ModoContraste: 'normal' | 'high' | 'low';
}

export interface ConfiguracionIdiomaDTO {
  Idioma: string;
  ZonaHoraria: string;
  FormatoFecha: string;
  Moneda: string;
}

export interface ConfiguracionNotificacionesDTO {
  NotificacionesEmail: boolean;
  NotificacionesProductos: boolean;
  NotificacionesCategorias: boolean;
  NotificacionesPromocionesEmail: boolean;
}

export interface ConfiguracionPrivacidadDTO {
  PerfilPublico: boolean;
  MostrarEmail: boolean;
  MostrarFechaNacimiento: boolean;
}

export interface ConfiguracionAccesibilidadDTO {
  ReducirAnimaciones: boolean;
  LectorPantalla: boolean;
  TecladoNavegacion: boolean;
}

export interface ConfiguracionSeguridadDTO {
  SesionesMultiples: boolean;
  Autenticacion2FA: boolean;
  UltimaActualizacionPassword?: string;
}

export interface CambiarPasswordDTO {
  PasswordActual: string;
  PasswordNueva: string;
  ConfirmarPassword: string;
}

// Producto Types
export interface Producto {
  Id: number;
  Nombre: string;
  Descripcion?: string;
  Precio: number;
  Stock: number;
  ImagenUrl?: string;
  Disponible: boolean;
  FechaCreacion: string;
  CategoriaId: number;
  CategoriaNombre: string;
  TieneBajoStock: boolean;
  SinStock: boolean;
}

export interface ProductoCreateDTO {
  Nombre: string;
  Descripcion?: string;
  Precio: number;
  Stock: number;
  CategoriaId: number;
  Imagen?: File;
}

// Categoria Types
export interface Categoria {
  Id: number;
  Nombre: string;
  Descripcion?: string;
  Activa: boolean;
  FechaCreacion: string;
  CantidadProductos: number;
}

// Paginación
export interface PaginacionMetadata {
  CurrentPage: number;
  TotalPages: number;
  PageSize: number;
  TotalCount: number;
  HasPrevious: boolean;
  HasNext: boolean;
}

export interface PaginatedResponse<T> {
  Data: T[];
  Pagination: PaginacionMetadata;
}

// API Error
export interface ApiError {
  Message: string;
  Errors?: { [key: string]: string[] };
}
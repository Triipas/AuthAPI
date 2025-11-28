using System.ComponentModel.DataAnnotations;

namespace AuthAPI.Models.DTOs
{
    // DTO para obtener perfil completo
    public class PerfilResponseDTO
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? NombreCompleto { get; set; }
        public string? FotoPerfil { get; set; }
        public string? Avatar { get; set; }
        public string? Bio { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public DateTime FechaRegistro { get; set; }
        public List<string> Roles { get; set; } = new();
        
        // Configuraciones
        public ConfiguracionAparienciaDTO Apariencia { get; set; } = new();
        public ConfiguracionIdiomaDTO Idioma { get; set; } = new();
        public ConfiguracionNotificacionesDTO Notificaciones { get; set; } = new();
        public ConfiguracionPrivacidadDTO Privacidad { get; set; } = new();
        public ConfiguracionAccesibilidadDTO Accesibilidad { get; set; } = new();
        public ConfiguracionSeguridadDTO Seguridad { get; set; } = new();
    }
    
    // DTO para actualizar información básica
    public class ActualizarPerfilDTO
    {
        [MaxLength(100)]
        public string? NombreCompleto { get; set; }
        
        [MaxLength(500)]
        public string? Bio { get; set; }
        
        public DateTime? FechaNacimiento { get; set; }
        
        [Url]
        public string? Avatar { get; set; }
    }
    
    // DTO para configuración de apariencia
    public class ConfiguracionAparienciaDTO
    {
        [RegularExpression("^(light|dark|auto)$")]
        public string Tema { get; set; } = "light";
        
        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", 
            ErrorMessage = "Debe ser un color hexadecimal válido (ej: #3b82f6)")]
        public string ColorPrimario { get; set; } = "#3b82f6";
        
        [RegularExpression("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")]
        public string ColorSecundario { get; set; } = "#8b5cf6";
        
        [RegularExpression("^(system|serif|mono|poppins|roboto|inter)$")]
        public string TipoFuente { get; set; } = "system";
        
        [Range(12, 24)]
        public int TamanoFuente { get; set; } = 16;
        
        [RegularExpression("^(normal|high|low)$")]
        public string ModoContraste { get; set; } = "normal";
    }
    
    // DTO para configuración de idioma
    public class ConfiguracionIdiomaDTO
    {
        [RegularExpression("^(es|en|pt|fr|de|it|ja|zh)$")]
        public string Idioma { get; set; } = "es";
        
        [MaxLength(50)]
        public string ZonaHoraria { get; set; } = "America/Lima";
        
        [RegularExpression("^(DD/MM/YYYY|MM/DD/YYYY|YYYY-MM-DD)$")]
        public string FormatoFecha { get; set; } = "DD/MM/YYYY";
        
        [RegularExpression("^[A-Z]{3}$")]
        public string Moneda { get; set; } = "PEN";
    }
    
    // DTO para configuración de notificaciones
    public class ConfiguracionNotificacionesDTO
    {
        public bool NotificacionesEmail { get; set; } = true;
        public bool NotificacionesProductos { get; set; } = true;
        public bool NotificacionesCategorias { get; set; } = true;
        public bool NotificacionesPromocionesEmail { get; set; } = false;
    }
    
    // DTO para configuración de privacidad
    public class ConfiguracionPrivacidadDTO
    {
        public bool PerfilPublico { get; set; } = false;
        public bool MostrarEmail { get; set; } = false;
        public bool MostrarFechaNacimiento { get; set; } = false;
    }
    
    // DTO para configuración de accesibilidad
    public class ConfiguracionAccesibilidadDTO
    {
        public bool ReducirAnimaciones { get; set; } = false;
        public bool LectorPantalla { get; set; } = false;
        public bool TecladoNavegacion { get; set; } = false;
    }
    
    // DTO para información de seguridad
    public class ConfiguracionSeguridadDTO
    {
        public bool SesionesMultiples { get; set; } = true;
        public bool Autenticacion2FA { get; set; } = false;
        public DateTime? UltimaActualizacionPassword { get; set; }
    }
    
    // DTO para cambiar contraseña
    public class CambiarPasswordDTO
    {
        [Required(ErrorMessage = "La contraseña actual es obligatoria")]
        public string PasswordActual { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "La nueva contraseña es obligatoria")]
        [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        public string PasswordNueva { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Debe confirmar la contraseña")]
        [Compare("PasswordNueva", ErrorMessage = "Las contraseñas no coinciden")]
        public string ConfirmarPassword { get; set; } = string.Empty;
    }
    
    // DTO para restablecer contraseña (olvidó contraseña)
    public class RestablecerPasswordRequestDTO
    {
        [Required(ErrorMessage = "El email es obligatorio")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
    
    public class RestablecerPasswordDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Token { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string NuevaPassword { get; set; } = string.Empty;
    }
    
    // DTO para subir foto de perfil
    public class SubirFotoPerfilDTO
    {
        [Required]
        public IFormFile Archivo { get; set; } = null!;
    }
}
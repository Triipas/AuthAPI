using Microsoft.AspNetCore.Identity;

namespace AuthAPI.Models
{
    public class Usuario : IdentityUser
    {
        // Información básica
        public string? NombreCompleto { get; set; }
        public DateTime FechaRegistro { get; set; } = DateTime.Now;
        
        // Perfil
        public string? FotoPerfil { get; set; } // URL de la imagen
        public string? Avatar { get; set; } // URL del avatar o emoji
        public string? Bio { get; set; } // Biografía/descripción
        public DateTime? FechaNacimiento { get; set; }
        
        // Configuraciones de Apariencia
        public string Tema { get; set; } = "light"; // "light" | "dark" | "auto"
        public string ColorPrimario { get; set; } = "#3b82f6"; // Hex color
        public string ColorSecundario { get; set; } = "#8b5cf6"; // Hex color opcional
        public string TipoFuente { get; set; } = "system"; // "system" | "serif" | "mono"
        public int TamanoFuente { get; set; } = 16; // px (14-20)
        public string ModoContraste { get; set; } = "normal"; // "normal" | "high" | "low"
        
        // Configuraciones de Idioma y Región
        public string Idioma { get; set; } = "es"; // "es" | "en" | "pt" | etc
        public string ZonaHoraria { get; set; } = "America/Lima"; // IANA timezone
        public string FormatoFecha { get; set; } = "DD/MM/YYYY"; // Formato preferido
        public string Moneda { get; set; } = "PEN"; // ISO 4217 currency code
        
        // Configuraciones de Notificaciones
        public bool NotificacionesEmail { get; set; } = true;
        public bool NotificacionesProductos { get; set; } = true;
        public bool NotificacionesCategorias { get; set; } = true;
        public bool NotificacionesPromocionesEmail { get; set; } = false;
        
        // Configuraciones de Privacidad
        public bool PerfilPublico { get; set; } = false;
        public bool MostrarEmail { get; set; } = false;
        public bool MostrarFechaNacimiento { get; set; } = false;
        
        // Configuraciones de Accesibilidad
        public bool ReducirAnimaciones { get; set; } = false;
        public bool LectorPantalla { get; set; } = false;
        public bool TecladoNavegacion { get; set; } = false;
        
        // Configuraciones de Sesión
        public bool SesionesMultiples { get; set; } = true;
        public bool Autenticacion2FA { get; set; } = false;
        public DateTime? UltimaActualizacionPerfil { get; set; }
        public DateTime? UltimaActualizacionPassword { get; set; }
    }
}
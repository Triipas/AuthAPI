using AuthAPI.Models.DTOs;

namespace AuthAPI.Services
{
    public interface IPerfilService
    {
        Task<PerfilResponseDTO?> ObtenerPerfilAsync(string userId);
        Task<PerfilResponseDTO?> ActualizarPerfilAsync(string userId, ActualizarPerfilDTO dto);
        Task<bool> ActualizarAparienciaAsync(string userId, ConfiguracionAparienciaDTO dto);
        Task<bool> ActualizarIdiomaAsync(string userId, ConfiguracionIdiomaDTO dto);
        Task<bool> ActualizarNotificacionesAsync(string userId, ConfiguracionNotificacionesDTO dto);
        Task<bool> ActualizarPrivacidadAsync(string userId, ConfiguracionPrivacidadDTO dto);
        Task<bool> ActualizarAccesibilidadAsync(string userId, ConfiguracionAccesibilidadDTO dto);
        Task<string?> SubirFotoPerfilAsync(string userId, IFormFile archivo);
        Task<bool> EliminarFotoPerfilAsync(string userId);
        Task<bool> CambiarPasswordAsync(string userId, CambiarPasswordDTO dto);
        Task<string?> GenerarTokenRestablecerPasswordAsync(string email);
        Task<bool> RestablecerPasswordAsync(RestablecerPasswordDTO dto);
    }
}
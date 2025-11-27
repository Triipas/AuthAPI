using AuthAPI.Models;
using AuthAPI.Models.DTOs;
using Microsoft.AspNetCore.Identity;

namespace AuthAPI.Services
{
  
    public class PerfilService : IPerfilService
    {
        private readonly UserManager<Usuario> _userManager;
        private readonly IS3Service _s3Service;
        
        public PerfilService(UserManager<Usuario> userManager, IS3Service s3Service)
        {
            _userManager = userManager;
            _s3Service = s3Service;
        }
        
        public async Task<PerfilResponseDTO?> ObtenerPerfilAsync(string userId)
        {
            var usuario = await _userManager.FindByIdAsync(userId);
            if (usuario == null) return null;
            
            var roles = await _userManager.GetRolesAsync(usuario);
            
            return new PerfilResponseDTO
            {
                Id = usuario.Id,
                Email = usuario.Email!,
                NombreCompleto = usuario.NombreCompleto,
                FotoPerfil = usuario.FotoPerfil,
                Avatar = usuario.Avatar,
                Bio = usuario.Bio,
                FechaNacimiento = usuario.FechaNacimiento,
                FechaRegistro = usuario.FechaRegistro,
                Roles = roles.ToList(),
                
                Apariencia = new ConfiguracionAparienciaDTO
                {
                    Tema = usuario.Tema,
                    ColorPrimario = usuario.ColorPrimario,
                    ColorSecundario = usuario.ColorSecundario,
                    TipoFuente = usuario.TipoFuente,
                    TamanoFuente = usuario.TamanoFuente,
                    ModoContraste = usuario.ModoContraste
                },
                
                Idioma = new ConfiguracionIdiomaDTO
                {
                    Idioma = usuario.Idioma,
                    ZonaHoraria = usuario.ZonaHoraria,
                    FormatoFecha = usuario.FormatoFecha,
                    Moneda = usuario.Moneda
                },
                
                Notificaciones = new ConfiguracionNotificacionesDTO
                {
                    NotificacionesEmail = usuario.NotificacionesEmail,
                    NotificacionesProductos = usuario.NotificacionesProductos,
                    NotificacionesCategorias = usuario.NotificacionesCategorias,
                    NotificacionesPromocionesEmail = usuario.NotificacionesPromocionesEmail
                },
                
                Privacidad = new ConfiguracionPrivacidadDTO
                {
                    PerfilPublico = usuario.PerfilPublico,
                    MostrarEmail = usuario.MostrarEmail,
                    MostrarFechaNacimiento = usuario.MostrarFechaNacimiento
                },
                
                Accesibilidad = new ConfiguracionAccesibilidadDTO
                {
                    ReducirAnimaciones = usuario.ReducirAnimaciones,
                    LectorPantalla = usuario.LectorPantalla,
                    TecladoNavegacion = usuario.TecladoNavegacion
                },
                
                Seguridad = new ConfiguracionSeguridadDTO
                {
                    SesionesMultiples = usuario.SesionesMultiples,
                    Autenticacion2FA = usuario.Autenticacion2FA,
                    UltimaActualizacionPassword = usuario.UltimaActualizacionPassword
                }
            };
        }
        
        public async Task<PerfilResponseDTO?> ActualizarPerfilAsync(string userId, ActualizarPerfilDTO dto)
        {
            var usuario = await _userManager.FindByIdAsync(userId);
            if (usuario == null) return null;
            
            usuario.NombreCompleto = dto.NombreCompleto ?? usuario.NombreCompleto;
            usuario.Bio = dto.Bio ?? usuario.Bio;
            usuario.FechaNacimiento = dto.FechaNacimiento ?? usuario.FechaNacimiento;
            usuario.Avatar = dto.Avatar ?? usuario.Avatar;
            usuario.UltimaActualizacionPerfil = DateTime.Now;
            
            var result = await _userManager.UpdateAsync(usuario);
            
            if (!result.Succeeded) return null;
            
            return await ObtenerPerfilAsync(userId);
        }
        
        public async Task<bool> ActualizarAparienciaAsync(string userId, ConfiguracionAparienciaDTO dto)
        {
            var usuario = await _userManager.FindByIdAsync(userId);
            if (usuario == null) return false;
            
            usuario.Tema = dto.Tema;
            usuario.ColorPrimario = dto.ColorPrimario;
            usuario.ColorSecundario = dto.ColorSecundario;
            usuario.TipoFuente = dto.TipoFuente;
            usuario.TamanoFuente = dto.TamanoFuente;
            usuario.ModoContraste = dto.ModoContraste;
            
            var result = await _userManager.UpdateAsync(usuario);
            return result.Succeeded;
        }
        
        public async Task<bool> ActualizarIdiomaAsync(string userId, ConfiguracionIdiomaDTO dto)
        {
            var usuario = await _userManager.FindByIdAsync(userId);
            if (usuario == null) return false;
            
            usuario.Idioma = dto.Idioma;
            usuario.ZonaHoraria = dto.ZonaHoraria;
            usuario.FormatoFecha = dto.FormatoFecha;
            usuario.Moneda = dto.Moneda;
            
            var result = await _userManager.UpdateAsync(usuario);
            return result.Succeeded;
        }
        
        public async Task<bool> ActualizarNotificacionesAsync(string userId, ConfiguracionNotificacionesDTO dto)
        {
            var usuario = await _userManager.FindByIdAsync(userId);
            if (usuario == null) return false;
            
            usuario.NotificacionesEmail = dto.NotificacionesEmail;
            usuario.NotificacionesProductos = dto.NotificacionesProductos;
            usuario.NotificacionesCategorias = dto.NotificacionesCategorias;
            usuario.NotificacionesPromocionesEmail = dto.NotificacionesPromocionesEmail;
            
            var result = await _userManager.UpdateAsync(usuario);
            return result.Succeeded;
        }
        
        public async Task<bool> ActualizarPrivacidadAsync(string userId, ConfiguracionPrivacidadDTO dto)
        {
            var usuario = await _userManager.FindByIdAsync(userId);
            if (usuario == null) return false;
            
            usuario.PerfilPublico = dto.PerfilPublico;
            usuario.MostrarEmail = dto.MostrarEmail;
            usuario.MostrarFechaNacimiento = dto.MostrarFechaNacimiento;
            
            var result = await _userManager.UpdateAsync(usuario);
            return result.Succeeded;
        }
        
        public async Task<bool> ActualizarAccesibilidadAsync(string userId, ConfiguracionAccesibilidadDTO dto)
        {
            var usuario = await _userManager.FindByIdAsync(userId);
            if (usuario == null) return false;
            
            usuario.ReducirAnimaciones = dto.ReducirAnimaciones;
            usuario.LectorPantalla = dto.LectorPantalla;
            usuario.TecladoNavegacion = dto.TecladoNavegacion;
            
            var result = await _userManager.UpdateAsync(usuario);
            return result.Succeeded;
        }
        
        public async Task<string?> SubirFotoPerfilAsync(string userId, IFormFile archivo)
        {
            var usuario = await _userManager.FindByIdAsync(userId);
            if (usuario == null) return null;
            
            try
            {
                // Eliminar foto anterior si existe
                if (!string.IsNullOrEmpty(usuario.FotoPerfil))
                {
                    await _s3Service.EliminarArchivoAsync(usuario.FotoPerfil);
                }
                
                // Subir nueva foto a S3
                var urlFoto = await _s3Service.SubirArchivoAsync(archivo, "perfiles");
                
                // Actualizar usuario
                usuario.FotoPerfil = urlFoto;
                await _userManager.UpdateAsync(usuario);
                
                return urlFoto;
            }
            catch (Exception)
            {
                throw; // Re-lanzar la excepción para que el controller la maneje
            }
        }
        
        public async Task<bool> EliminarFotoPerfilAsync(string userId)
        {
            var usuario = await _userManager.FindByIdAsync(userId);
            if (usuario == null || string.IsNullOrEmpty(usuario.FotoPerfil)) return false;
            
            // Eliminar de S3
            await _s3Service.EliminarArchivoAsync(usuario.FotoPerfil);
            
            // Actualizar usuario
            usuario.FotoPerfil = null;
            var result = await _userManager.UpdateAsync(usuario);
            
            return result.Succeeded;
        }
        
        public async Task<bool> CambiarPasswordAsync(string userId, CambiarPasswordDTO dto)
        {
            var usuario = await _userManager.FindByIdAsync(userId);
            if (usuario == null) return false;
            
            var result = await _userManager.ChangePasswordAsync(
                usuario, 
                dto.PasswordActual, 
                dto.PasswordNueva
            );
            
            if (result.Succeeded)
            {
                usuario.UltimaActualizacionPassword = DateTime.Now;
                await _userManager.UpdateAsync(usuario);
            }
            
            return result.Succeeded;
        }
        
        public async Task<string?> GenerarTokenRestablecerPasswordAsync(string email)
        {
            var usuario = await _userManager.FindByEmailAsync(email);
            if (usuario == null) return null;
            
            var token = await _userManager.GeneratePasswordResetTokenAsync(usuario);
            
            // AQUÍ DEBERÍAS ENVIAR EMAIL CON EL TOKEN
            // Por ahora solo lo retornamos para testing
            // En producción: enviar email y retornar success message
            
            return token;
        }
        
        public async Task<bool> RestablecerPasswordAsync(RestablecerPasswordDTO dto)
        {
            var usuario = await _userManager.FindByEmailAsync(dto.Email);
            if (usuario == null) return false;
            
            var result = await _userManager.ResetPasswordAsync(
                usuario,
                dto.Token,
                dto.NuevaPassword
            );
            
            if (result.Succeeded)
            {
                usuario.UltimaActualizacionPassword = DateTime.Now;
                await _userManager.UpdateAsync(usuario);
            }
            
            return result.Succeeded;
        }
    }
}
using AuthAPI.Models.DTOs;
using AuthAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PerfilController : ControllerBase
    {
        private readonly IPerfilService _perfilService;
        
        public PerfilController(IPerfilService perfilService)
        {
            _perfilService = perfilService;
        }
        
        // Helper para obtener el ID del usuario autenticado
        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? throw new UnauthorizedAccessException();
        }
        
        // GET: api/perfil
        [HttpGet]
        public async Task<ActionResult<PerfilResponseDTO>> ObtenerPerfil()
        {
            var userId = GetUserId();
            var perfil = await _perfilService.ObtenerPerfilAsync(userId);
            
            if (perfil == null)
            {
                return NotFound(new { message = "Perfil no encontrado" });
            }
            
            return Ok(perfil);
        }
        
        // PUT: api/perfil
        [HttpPut]
        public async Task<ActionResult<PerfilResponseDTO>> ActualizarPerfil([FromBody] ActualizarPerfilDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var userId = GetUserId();
            var perfil = await _perfilService.ActualizarPerfilAsync(userId, dto);
            
            if (perfil == null)
            {
                return BadRequest(new { message = "No se pudo actualizar el perfil" });
            }
            
            return Ok(perfil);
        }
        
        // PUT: api/perfil/apariencia
        [HttpPut("apariencia")]
        public async Task<IActionResult> ActualizarApariencia([FromBody] ConfiguracionAparienciaDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var userId = GetUserId();
            var result = await _perfilService.ActualizarAparienciaAsync(userId, dto);
            
            if (!result)
            {
                return BadRequest(new { message = "No se pudo actualizar la configuración" });
            }
            
            return Ok(new { message = "Configuración de apariencia actualizada" });
        }
        
        // PUT: api/perfil/idioma
        [HttpPut("idioma")]
        public async Task<IActionResult> ActualizarIdioma([FromBody] ConfiguracionIdiomaDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var userId = GetUserId();
            var result = await _perfilService.ActualizarIdiomaAsync(userId, dto);
            
            if (!result)
            {
                return BadRequest(new { message = "No se pudo actualizar la configuración" });
            }
            
            return Ok(new { message = "Configuración de idioma actualizada" });
        }
        
        // PUT: api/perfil/notificaciones
        [HttpPut("notificaciones")]
        public async Task<IActionResult> ActualizarNotificaciones([FromBody] ConfiguracionNotificacionesDTO dto)
        {
            var userId = GetUserId();
            var result = await _perfilService.ActualizarNotificacionesAsync(userId, dto);
            
            if (!result)
            {
                return BadRequest(new { message = "No se pudo actualizar la configuración" });
            }
            
            return Ok(new { message = "Configuración de notificaciones actualizada" });
        }
        
        // PUT: api/perfil/privacidad
        [HttpPut("privacidad")]
        public async Task<IActionResult> ActualizarPrivacidad([FromBody] ConfiguracionPrivacidadDTO dto)
        {
            var userId = GetUserId();
            var result = await _perfilService.ActualizarPrivacidadAsync(userId, dto);
            
            if (!result)
            {
                return BadRequest(new { message = "No se pudo actualizar la configuración" });
            }
            
            return Ok(new { message = "Configuración de privacidad actualizada" });
        }
        
        // PUT: api/perfil/accesibilidad
        [HttpPut("accesibilidad")]
        public async Task<IActionResult> ActualizarAccesibilidad([FromBody] ConfiguracionAccesibilidadDTO dto)
        {
            var userId = GetUserId();
            var result = await _perfilService.ActualizarAccesibilidadAsync(userId, dto);
            
            if (!result)
            {
                return BadRequest(new { message = "No se pudo actualizar la configuración" });
            }
            
            return Ok(new { message = "Configuración de accesibilidad actualizada" });
        }
        
        // POST: api/perfil/foto
        [HttpPost("foto")]
        [RequestSizeLimit(5 * 1024 * 1024)] // 5MB
        public async Task<IActionResult> SubirFotoPerfil(IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
            {
                return BadRequest(new { message = "No se proporcionó ningún archivo" });
            }
            
            try
            {
                var userId = GetUserId();
                var urlFoto = await _perfilService.SubirFotoPerfilAsync(userId, archivo);
                
                if (urlFoto == null)
                {
                    return BadRequest(new { message = "No se pudo subir la foto" });
                }
                
                return Ok(new { message = "Foto subida exitosamente", url = urlFoto });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        
        // DELETE: api/perfil/foto
        [HttpDelete("foto")]
        public async Task<IActionResult> EliminarFotoPerfil()
        {
            var userId = GetUserId();
            var result = await _perfilService.EliminarFotoPerfilAsync(userId);
            
            if (!result)
            {
                return NotFound(new { message = "No hay foto de perfil para eliminar" });
            }
            
            return Ok(new { message = "Foto de perfil eliminada" });
        }
        
        // POST: api/perfil/cambiar-password
        [HttpPost("cambiar-password")]
        public async Task<IActionResult> CambiarPassword([FromBody] CambiarPasswordDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var userId = GetUserId();
            var result = await _perfilService.CambiarPasswordAsync(userId, dto);
            
            if (!result)
            {
                return BadRequest(new { message = "La contraseña actual es incorrecta" });
            }
            
            return Ok(new { message = "Contraseña actualizada exitosamente" });
        }
        
        // POST: api/perfil/restablecer-password-request
        [AllowAnonymous]
        [HttpPost("restablecer-password-request")]
        public async Task<IActionResult> SolicitarRestablecerPassword([FromBody] RestablecerPasswordRequestDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var token = await _perfilService.GenerarTokenRestablecerPasswordAsync(dto.Email);
            
            // Por seguridad, siempre retornar OK aunque el email no exista
            // En producción, aquí se enviaría un email
            return Ok(new 
            { 
                message = "Si el email existe, recibirás instrucciones para restablecer tu contraseña",
                // SOLO PARA DESARROLLO - Eliminar en producción
                token = token
            });
        }
        
        // POST: api/perfil/restablecer-password
        [AllowAnonymous]
        [HttpPost("restablecer-password")]
        public async Task<IActionResult> RestablecerPassword([FromBody] RestablecerPasswordDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var result = await _perfilService.RestablecerPasswordAsync(dto);
            
            if (!result)
            {
                return BadRequest(new { message = "Token inválido o expirado" });
            }
            
            return Ok(new { message = "Contraseña restablecida exitosamente" });
        }
    }
}
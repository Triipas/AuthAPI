using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        // Endpoint público
        [HttpGet("public")]
        public IActionResult Public()
        {
            return Ok(new { message = "Este endpoint es público" });
        }

        // Endpoint protegido (requiere autenticación)
        [Authorize]
        [HttpGet("protected")]
        public IActionResult Protected()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var nombre = User.FindFirst(ClaimTypes.Name)?.Value;
            
            return Ok(new 
            { 
                message = "Este endpoint está protegido",
                email = email,
                nombre = nombre
            });
        }

        // Endpoint solo para admins
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public IActionResult Admin()
        {
            return Ok(new { message = "Solo admins pueden ver esto" });
        }
    }
}
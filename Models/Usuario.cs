using Microsoft.AspNetCore.Identity;

namespace AuthAPI.Models
{
    public class Usuario : IdentityUser
    {
        public string? NombreCompleto { get; set; }
        public DateTime FechaRegistro { get; set; } = DateTime.Now;
    }
}
using AuthAPI.Models;
using AuthAPI.Models.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuthAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<Usuario> _userManager;
        private readonly IConfiguration _configuration;

        public AuthService(UserManager<Usuario> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<AuthResponseDTO?> RegisterAsync(RegisterDTO model)
        {
            // Verificar si el usuario ya existe
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return null; // Usuario ya existe
            }

            // Crear nuevo usuario
            var usuario = new Usuario
            {
                UserName = model.Email,
                Email = model.Email,
                NombreCompleto = model.NombreCompleto
            };

            var result = await _userManager.CreateAsync(usuario, model.Password);

            if (!result.Succeeded)
            {
                return null; // Fallo al crear usuario
            }

            // Asignar rol por defecto
            await _userManager.AddToRoleAsync(usuario, "Usuario");

            // Generar token
            var token = GenerateJwtToken(usuario, new List<string> { "Usuario" });

            return new AuthResponseDTO
            {
                Token = token,
                Email = usuario.Email!,
                NombreCompleto = usuario.NombreCompleto!,
                Roles = new List<string> { "Usuario" }
            };
        }

        public async Task<AuthResponseDTO?> LoginAsync(LoginDTO model)
        {
            // Buscar usuario
            var usuario = await _userManager.FindByEmailAsync(model.Email);
            if (usuario == null)
            {
                return null; // Usuario no encontrado
            }

            // Verificar contraseña
            var passwordValid = await _userManager.CheckPasswordAsync(usuario, model.Password);
            if (!passwordValid)
            {
                return null; // Contraseña incorrecta
            }

            // Obtener roles del usuario
            var roles = await _userManager.GetRolesAsync(usuario);

            // Generar token
            var token = GenerateJwtToken(usuario, roles.ToList());

            return new AuthResponseDTO
            {
                Token = token,
                Email = usuario.Email!,
                NombreCompleto = usuario.NombreCompleto!,
                Roles = roles.ToList()
            };
        }

        private string GenerateJwtToken(Usuario usuario, List<string> roles)
        {
            // Claims: información que va dentro del token
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id),
                new Claim(ClaimTypes.Email, usuario.Email ?? string.Empty),
                new Claim(ClaimTypes.Name, usuario.NombreCompleto ?? "Usuario") // ← Manejar null
            };

            // Agregar roles como claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Configuración del token
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!)
            );
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(
                    Convert.ToDouble(_configuration["JwtSettings:ExpirationHours"])
                ),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
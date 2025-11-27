using AuthAPI.Models.DTOs;

namespace AuthAPI.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDTO?> RegisterAsync(RegisterDTO model);
        Task<AuthResponseDTO?> LoginAsync(LoginDTO model);
    }
}
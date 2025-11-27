using AuthAPI.Models.DTOs;

namespace AuthAPI.Services
{
    public interface IS3Service
    {
        Task<string> SubirArchivoAsync(IFormFile archivo, string carpeta);
        Task<bool> EliminarArchivoAsync(string urlArchivo);
        Task<bool> ExisteArchivoAsync(string key);
    }
}
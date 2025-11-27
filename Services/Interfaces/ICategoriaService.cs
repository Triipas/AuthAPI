using AuthAPI.DTOs;

namespace AuthAPI.Services
{
    public interface ICategoriaService
    {
        Task<IEnumerable<CategoriaResponseDTO>> GetAllAsync();
        Task<CategoriaResponseDTO?> GetByIdAsync(int id);
        Task<CategoriaResponseDTO> CreateAsync(CategoriaCreateDTO dto);
        Task<CategoriaResponseDTO?> UpdateAsync(int id, CategoriaUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
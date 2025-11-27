using AuthAPI.DTOs;

namespace AuthAPI.Services
{
    public interface IProductoService
    {
        Task<PaginatedResponse<ProductoResponseDTO>> GetAllAsync(ProductoFiltrosDTO filtros);
        Task<ProductoResponseDTO?> GetByIdAsync(int id);
        Task<ProductoResponseDTO> CreateAsync(ProductoCreateDTO dto);
        Task<ProductoResponseDTO?> UpdateAsync(int id, ProductoUpdateDTO dto);
        Task<bool> UpdateStockAsync(int id, ProductoStockUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<ProductoResponseDTO>> GetByCategoria(int categoriaId);
        Task<IEnumerable<ProductoResponseDTO>> GetBajoStockAsync();
    }
}
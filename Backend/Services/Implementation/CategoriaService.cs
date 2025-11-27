using AuthAPI.Data;
using AuthAPI.DTOs;
using AuthAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthAPI.Services
{
    public class CategoriaService : ICategoriaService
    {
        private readonly ApplicationDbContext _context;

        public CategoriaService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoriaResponseDTO>> GetAllAsync()
        {
            var categorias = await _context.Categorias
                .Include(c => c.Productos) // Incluir productos para contar
                .ToListAsync();

            return categorias.Select(c => new CategoriaResponseDTO
            {
                Id = c.Id,
                Nombre = c.Nombre,
                Descripcion = c.Descripcion,
                Activa = c.Activa,
                FechaCreacion = c.FechaCreacion,
                CantidadProductos = c.Productos.Count
            });
        }

        public async Task<CategoriaResponseDTO?> GetByIdAsync(int id)
        {
            var categoria = await _context.Categorias
                .Include(c => c.Productos)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (categoria == null) return null;

            return new CategoriaResponseDTO
            {
                Id = categoria.Id,
                Nombre = categoria.Nombre,
                Descripcion = categoria.Descripcion,
                Activa = categoria.Activa,
                FechaCreacion = categoria.FechaCreacion,
                CantidadProductos = categoria.Productos.Count
            };
        }

        public async Task<CategoriaResponseDTO> CreateAsync(CategoriaCreateDTO dto)
        {
            var categoria = new Categoria
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion
            };

            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();

            return new CategoriaResponseDTO
            {
                Id = categoria.Id,
                Nombre = categoria.Nombre,
                Descripcion = categoria.Descripcion,
                Activa = categoria.Activa,
                FechaCreacion = categoria.FechaCreacion,
                CantidadProductos = 0
            };
        }

        public async Task<CategoriaResponseDTO?> UpdateAsync(int id, CategoriaUpdateDTO dto)
        {
            var categoria = await _context.Categorias.FindAsync(id);
            
            if (categoria == null) return null;

            categoria.Nombre = dto.Nombre;
            categoria.Descripcion = dto.Descripcion;
            categoria.Activa = dto.Activa;

            await _context.SaveChangesAsync();

            return new CategoriaResponseDTO
            {
                Id = categoria.Id,
                Nombre = categoria.Nombre,
                Descripcion = categoria.Descripcion,
                Activa = categoria.Activa,
                FechaCreacion = categoria.FechaCreacion,
                CantidadProductos = categoria.Productos.Count
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var categoria = await _context.Categorias
                .Include(c => c.Productos)
                .FirstOrDefaultAsync(c => c.Id == id);
            
            if (categoria == null) return false;

            // No permitir borrar si tiene productos
            if (categoria.Productos.Any())
            {
                return false;
            }

            _context.Categorias.Remove(categoria);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
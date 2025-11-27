using AuthAPI.Data;
using AuthAPI.DTOs;
using AuthAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthAPI.Services
{
    public class ProductoService : IProductoService
    {
        private readonly ApplicationDbContext _context;
        private readonly IS3Service _s3Service;

        public ProductoService(ApplicationDbContext context, IS3Service s3Service)
        {
            _context = context;
            _s3Service = s3Service;
        }

        public async Task<PaginatedResponse<ProductoResponseDTO>> GetAllAsync(ProductoFiltrosDTO filtros)
        {
            // 1. Empezar con el query base
            var query = _context.Productos
                .Include(p => p.Categoria)
                .AsQueryable();

            // 2. Aplicar filtro de búsqueda por texto
            if (!string.IsNullOrWhiteSpace(filtros.SearchTerm))
            {
                var searchTerm = filtros.SearchTerm.ToLower();
                query = query.Where(p =>
                    p.Nombre.ToLower().Contains(searchTerm) ||
                    (p.Descripcion != null && p.Descripcion.ToLower().Contains(searchTerm))
                );
            }

            // 3. Aplicar filtro por categoría
            if (filtros.CategoriaId.HasValue)
            {
                query = query.Where(p => p.CategoriaId == filtros.CategoriaId.Value);
            }

            // 4. Aplicar filtro por rango de precio
            if (filtros.PrecioMin.HasValue)
            {
                query = query.Where(p => p.Precio >= filtros.PrecioMin.Value);
            }

            if (filtros.PrecioMax.HasValue)
            {
                query = query.Where(p => p.Precio <= filtros.PrecioMax.Value);
            }

            // 5. Aplicar filtro por disponibilidad
            if (filtros.Disponible.HasValue)
            {
                query = query.Where(p => p.Disponible == filtros.Disponible.Value);
            }

            // 6. Aplicar ordenamiento
            query = filtros.OrderBy.ToLower() switch
            {
                "precio" => filtros.Descending
                    ? query.OrderByDescending(p => p.Precio)
                    : query.OrderBy(p => p.Precio),
                "fecha" => filtros.Descending
                    ? query.OrderByDescending(p => p.FechaCreacion)
                    : query.OrderBy(p => p.FechaCreacion),
                "stock" => filtros.Descending
                    ? query.OrderByDescending(p => p.Stock)
                    : query.OrderBy(p => p.Stock),
                _ => filtros.Descending
                    ? query.OrderByDescending(p => p.Nombre)
                    : query.OrderBy(p => p.Nombre)
            };

            // 7. Contar total ANTES de paginar
            var totalCount = await query.CountAsync();

            // 8. Aplicar paginación
            var productos = await query
                .Skip((filtros.PageNumber - 1) * filtros.PageSize)
                .Take(filtros.PageSize)
                .Select(p => new ProductoResponseDTO
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio,
                    Stock = p.Stock,
                    ImagenUrl = p.ImagenUrl,
                    Disponible = p.Disponible,
                    FechaCreacion = p.FechaCreacion,
                    CategoriaId = p.CategoriaId,
                    CategoriaNombre = p.Categoria.Nombre
                })
                .ToListAsync();

            // 9. Crear metadata de paginación
            var totalPages = (int)Math.Ceiling(totalCount / (double)filtros.PageSize);

            var metadata = new PaginacionMetadata
            {
                CurrentPage = filtros.PageNumber,
                TotalPages = totalPages,
                PageSize = filtros.PageSize,
                TotalCount = totalCount
            };

            // 10. Retornar respuesta paginada
            return new PaginatedResponse<ProductoResponseDTO>
            {
                Data = productos,
                Pagination = metadata
            };
        }

        public async Task<ProductoResponseDTO?> GetByIdAsync(int id)
        {
            var producto = await _context.Productos
                .Include(p => p.Categoria)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (producto == null) return null;

            return new ProductoResponseDTO
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Stock = producto.Stock,
                ImagenUrl = producto.ImagenUrl,
                Disponible = producto.Disponible,
                FechaCreacion = producto.FechaCreacion,
                CategoriaId = producto.CategoriaId,
                CategoriaNombre = producto.Categoria.Nombre
            };
        }

        public async Task<ProductoResponseDTO> CreateAsync(ProductoCreateDTO dto)
        {
            // Validar que la categoría existe
            var categoriaExists = await _context.Categorias.AnyAsync(c => c.Id == dto.CategoriaId);
            if (!categoriaExists)
            {
                throw new ArgumentException("La categoría especificada no existe");
            }

            var producto = new Producto
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Precio = dto.Precio,
                Stock = dto.Stock,
                ImagenUrl = dto.ImagenUrl,
                CategoriaId = dto.CategoriaId
            };

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            // Cargar la categoría para la respuesta
            await _context.Entry(producto)
                .Reference(p => p.Categoria)
                .LoadAsync();

            return new ProductoResponseDTO
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Stock = producto.Stock,
                ImagenUrl = producto.ImagenUrl,
                Disponible = producto.Disponible,
                FechaCreacion = producto.FechaCreacion,
                CategoriaId = producto.CategoriaId,
                CategoriaNombre = producto.Categoria.Nombre
            };
        }

        public async Task<ProductoResponseDTO?> UpdateAsync(int id, ProductoUpdateDTO dto)
        {
            var producto = await _context.Productos
                .Include(p => p.Categoria)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (producto == null) return null;

            // Validar que la nueva categoría existe (si cambió)
            if (producto.CategoriaId != dto.CategoriaId)
            {
                var categoriaExists = await _context.Categorias.AnyAsync(c => c.Id == dto.CategoriaId);
                if (!categoriaExists)
                {
                    throw new ArgumentException("La categoría especificada no existe");
                }
            }

            // Actualizar propiedades
            producto.Nombre = dto.Nombre;
            producto.Descripcion = dto.Descripcion;
            producto.Precio = dto.Precio;
            producto.Stock = dto.Stock;
            producto.ImagenUrl = dto.ImagenUrl;
            producto.Disponible = dto.Disponible;
            producto.CategoriaId = dto.CategoriaId;

            await _context.SaveChangesAsync();

            // Recargar categoría si cambió
            if (producto.CategoriaId != dto.CategoriaId)
            {
                await _context.Entry(producto)
                    .Reference(p => p.Categoria)
                    .LoadAsync();
            }

            return new ProductoResponseDTO
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Stock = producto.Stock,
                ImagenUrl = producto.ImagenUrl,
                Disponible = producto.Disponible,
                FechaCreacion = producto.FechaCreacion,
                CategoriaId = producto.CategoriaId,
                CategoriaNombre = producto.Categoria.Nombre
            };
        }

        public async Task<ProductoResponseDTO> CreateConImagenAsync(ProductoCreateFormDTO dto)
        {
            // Validar que la categoría existe
            var categoriaExists = await _context.Categorias.AnyAsync(c => c.Id == dto.CategoriaId);
            if (!categoriaExists)
            {
                throw new ArgumentException("La categoría especificada no existe");
            }

            string? imagenUrl = null;
            
            // Subir imagen a S3 si se proporcionó
            if (dto.Imagen != null)
            {
                imagenUrl = await _s3Service.SubirArchivoAsync(dto.Imagen, "productos");
            }

            // Crear producto
            var producto = new Producto
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Precio = dto.Precio,
                Stock = dto.Stock,
                ImagenUrl = imagenUrl,
                CategoriaId = dto.CategoriaId
            };

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();

            // Cargar la categoría para la respuesta
            await _context.Entry(producto)
                .Reference(p => p.Categoria)
                .LoadAsync();

            return new ProductoResponseDTO
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Stock = producto.Stock,
                ImagenUrl = producto.ImagenUrl,
                Disponible = producto.Disponible,
                FechaCreacion = producto.FechaCreacion,
                CategoriaId = producto.CategoriaId,
                CategoriaNombre = producto.Categoria.Nombre
            };
        }

        public async Task<ProductoResponseDTO?> UpdateConImagenAsync(int id, ProductoUpdateFormDTO dto)
        {
            var producto = await _context.Productos
                .Include(p => p.Categoria)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (producto == null) return null;

            // Validar que la nueva categoría existe (si cambió)
            if (producto.CategoriaId != dto.CategoriaId)
            {
                var categoriaExists = await _context.Categorias.AnyAsync(c => c.Id == dto.CategoriaId);
                if (!categoriaExists)
                {
                    throw new ArgumentException("La categoría especificada no existe");
                }
            }

            // Manejar la imagen
            if (dto.EliminarImagenActual && !string.IsNullOrEmpty(producto.ImagenUrl))
            {
                // Eliminar imagen actual
                await _s3Service.EliminarArchivoAsync(producto.ImagenUrl);
                producto.ImagenUrl = null;
            }
            
            if (dto.Imagen != null)
            {
                // Eliminar imagen anterior si existe
                if (!string.IsNullOrEmpty(producto.ImagenUrl))
                {
                    await _s3Service.EliminarArchivoAsync(producto.ImagenUrl);
                }
                
                // Subir nueva imagen
                producto.ImagenUrl = await _s3Service.SubirArchivoAsync(dto.Imagen, "productos");
            }

            // Actualizar propiedades
            producto.Nombre = dto.Nombre;
            producto.Descripcion = dto.Descripcion;
            producto.Precio = dto.Precio;
            producto.Stock = dto.Stock;
            producto.Disponible = dto.Disponible;
            producto.CategoriaId = dto.CategoriaId;

            await _context.SaveChangesAsync();

            // Recargar categoría si cambió
            if (producto.CategoriaId != dto.CategoriaId)
            {
                await _context.Entry(producto)
                    .Reference(p => p.Categoria)
                    .LoadAsync();
            }

            return new ProductoResponseDTO
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Stock = producto.Stock,
                ImagenUrl = producto.ImagenUrl,
                Disponible = producto.Disponible,
                FechaCreacion = producto.FechaCreacion,
                CategoriaId = producto.CategoriaId,
                CategoriaNombre = producto.Categoria.Nombre
            };
        }

        public async Task<bool> UpdateStockAsync(int id, ProductoStockUpdateDTO dto)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null) return false;

            producto.Stock = dto.Stock;

            // Si el stock llega a 0, marcar como no disponible
            if (dto.Stock == 0)
            {
                producto.Disponible = false;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null) return false;

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ProductoResponseDTO>> GetByCategoria(int categoriaId)
        {
            var productos = await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.CategoriaId == categoriaId)
                .Select(p => new ProductoResponseDTO
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio,
                    Stock = p.Stock,
                    ImagenUrl = p.ImagenUrl,
                    Disponible = p.Disponible,
                    FechaCreacion = p.FechaCreacion,
                    CategoriaId = p.CategoriaId,
                    CategoriaNombre = p.Categoria.Nombre
                })
                .ToListAsync();

            return productos;
        }

        public async Task<IEnumerable<ProductoResponseDTO>> GetBajoStockAsync()
        {
            var productos = await _context.Productos
                .Include(p => p.Categoria)
                .Where(p => p.Stock < 10)
                .OrderBy(p => p.Stock)
                .Select(p => new ProductoResponseDTO
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    Precio = p.Precio,
                    Stock = p.Stock,
                    ImagenUrl = p.ImagenUrl,
                    Disponible = p.Disponible,
                    FechaCreacion = p.FechaCreacion,
                    CategoriaId = p.CategoriaId,
                    CategoriaNombre = p.Categoria.Nombre
                })
                .ToListAsync();

            return productos;
        }

        public async Task<string?> SubirImagenAsync(int productoId, IFormFile archivo)
        {
            var producto = await _context.Productos.FindAsync(productoId);
            if (producto == null) return null;

            try
            {
                // Eliminar imagen anterior si existe
                if (!string.IsNullOrEmpty(producto.ImagenUrl))
                {
                    await _s3Service.EliminarArchivoAsync(producto.ImagenUrl);
                }

                // Subir nueva imagen a S3
                var urlImagen = await _s3Service.SubirArchivoAsync(archivo, "productos");

                // Actualizar producto
                producto.ImagenUrl = urlImagen;
                await _context.SaveChangesAsync();

                return urlImagen;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> EliminarImagenAsync(int productoId)
        {
            var producto = await _context.Productos.FindAsync(productoId);
            if (producto == null || string.IsNullOrEmpty(producto.ImagenUrl))
                return false;

            // Eliminar de S3
            await _s3Service.EliminarArchivoAsync(producto.ImagenUrl);

            // Actualizar producto
            producto.ImagenUrl = null;
            await _context.SaveChangesAsync();

            return true;
        }

    }
}
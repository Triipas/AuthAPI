using AuthAPI.DTOs;
using AuthAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductosController : ControllerBase
    {
        private readonly IProductoService _productoService;

        public ProductosController(IProductoService productoService)
        {
            _productoService = productoService;
        }

        /// Ejemplo:
        /// GET /api/productos?pageNumber=1&pageSize=10&searchTerm=laptop&categoriaId=1&precioMin=100&precioMax=1000&orderBy=precio&descending=false
        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<ProductoResponseDTO>>> GetAll([FromQuery] ProductoFiltrosDTO filtros)
        {
            var resultado = await _productoService.GetAllAsync(filtros);
            return Ok(resultado);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoResponseDTO>> GetById(int id)
        {
            var producto = await _productoService.GetByIdAsync(id);
            
            if (producto == null)
            {
                return NotFound(new { message = "Producto no encontrado" });
            }

            return Ok(producto);
        }

        [HttpGet("categoria/{categoriaId}")]
        public async Task<ActionResult<IEnumerable<ProductoResponseDTO>>> GetByCategoria(int categoriaId)
        {
            var productos = await _productoService.GetByCategoria(categoriaId);
            return Ok(productos);
        }

        [HttpGet("bajo-stock")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ProductoResponseDTO>>> GetBajoStock()
        {
            var productos = await _productoService.GetBajoStockAsync();
            return Ok(productos);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductoResponseDTO>> Create([FromBody] ProductoCreateDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var producto = await _productoService.CreateAsync(dto);
                
                return CreatedAtAction(
                    nameof(GetById),
                    new { id = producto.Id },
                    producto
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductoResponseDTO>> Update(int id, [FromBody] ProductoUpdateDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var producto = await _productoService.UpdateAsync(id, dto);
                
                if (producto == null)
                {
                    return NotFound(new { message = "Producto no encontrado" });
                }

                return Ok(producto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/stock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] ProductoStockUpdateDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _productoService.UpdateStockAsync(id, dto);
            
            if (!result)
            {
                return NotFound(new { message = "Producto no encontrado" });
            }

            return NoContent(); // 204 No Content
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _productoService.DeleteAsync(id);
            
            if (!result)
            {
                return NotFound(new { message = "Producto no encontrado" });
            }

            return NoContent(); // 204 No Content
        }

        /// POST /api/productos/5/imagen
        [HttpPost("{id}/imagen")]
        [Authorize(Roles = "Admin")]
        [RequestSizeLimit(5 * 1024 * 1024)] // 5MB
        public async Task<IActionResult> SubirImagen(int id, IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0)
            {
                return BadRequest(new { message = "No se proporcionó ningún archivo" });
            }

            try
            {
                var urlImagen = await _productoService.SubirImagenAsync(id, archivo);
                
                if (urlImagen == null)
                {
                    return NotFound(new { message = "Producto no encontrado" });
                }
                
                return Ok(new 
                { 
                    message = "Imagen subida exitosamente", 
                    url = urlImagen 
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al subir la imagen", error = ex.Message });
            }
        }
        
        /// DELETE /api/productos/5/imagen
        [HttpDelete("{id}/imagen")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> EliminarImagen(int id)
        {
            var result = await _productoService.EliminarImagenAsync(id);
            
            if (!result)
            {
                return NotFound(new { message = "Producto no encontrado o no tiene imagen" });
            }

            return Ok(new { message = "Imagen eliminada exitosamente" });
        }

        /// POST /api/productos/con-imagen
        [HttpPost("con-imagen")]
        [Authorize(Roles = "Admin")]
        [RequestSizeLimit(5 * 1024 * 1024)] // 5MB
        public async Task<ActionResult<ProductoResponseDTO>> CreateConImagen([FromForm] ProductoCreateFormDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var producto = await _productoService.CreateConImagenAsync(dto);
                
                return CreatedAtAction(
                    nameof(GetById),
                    new { id = producto.Id },
                    producto
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear el producto", error = ex.Message });
            }
        }

        /// PUT /api/productos/5/con-imagen
        [HttpPut("{id}/con-imagen")]
        [Authorize(Roles = "Admin")]
        [RequestSizeLimit(5 * 1024 * 1024)] // 5MB
        public async Task<ActionResult<ProductoResponseDTO>> UpdateConImagen(int id, [FromForm] ProductoUpdateFormDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var producto = await _productoService.UpdateConImagenAsync(id, dto);
                
                if (producto == null)
                {
                    return NotFound(new { message = "Producto no encontrado" });
                }

                return Ok(producto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el producto", error = ex.Message });
            }
        }

    }
}
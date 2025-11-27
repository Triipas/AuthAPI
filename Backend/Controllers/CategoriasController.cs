using AuthAPI.DTOs;
using AuthAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Requiere autenticación para todos los endpoints
    public class CategoriasController : ControllerBase
    {
        private readonly ICategoriaService _categoriaService;

        public CategoriasController(ICategoriaService categoriaService)
        {
            _categoriaService = categoriaService;
        }

        // GET: api/categorias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoriaResponseDTO>>> GetAll()
        {
            var categorias = await _categoriaService.GetAllAsync();
            return Ok(categorias);
        }

        // GET: api/categorias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoriaResponseDTO>> GetById(int id)
        {
            var categoria = await _categoriaService.GetByIdAsync(id);
            
            if (categoria == null)
            {
                return NotFound(new { message = "Categoría no encontrada" });
            }

            return Ok(categoria);
        }

        // POST: api/categorias
        [HttpPost]
        [Authorize(Roles = "Admin")] // Solo admins pueden crear
        public async Task<ActionResult<CategoriaResponseDTO>> Create([FromBody] CategoriaCreateDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var categoria = await _categoriaService.CreateAsync(dto);
            
            return CreatedAtAction(
                nameof(GetById), 
                new { id = categoria.Id }, 
                categoria
            );
        }

        // PUT: api/categorias/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] // Solo admins pueden actualizar
        public async Task<ActionResult<CategoriaResponseDTO>> Update(int id, [FromBody] CategoriaUpdateDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var categoria = await _categoriaService.UpdateAsync(id, dto);
            
            if (categoria == null)
            {
                return NotFound(new { message = "Categoría no encontrada" });
            }

            return Ok(categoria);
        }

        // DELETE: api/categorias/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Solo admins pueden eliminar
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _categoriaService.DeleteAsync(id);
            
            if (!result)
            {
                return BadRequest(new { message = "No se puede eliminar la categoría. Puede tener productos asociados o no existe." });
            }

            return NoContent(); // 204 No Content
        }
    }
}
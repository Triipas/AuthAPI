using System.ComponentModel.DataAnnotations;

namespace AuthAPI.DTOs
{
    // DTO para crear producto con archivo (desde formulario)
    public class ProductoCreateFormDTO
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        [MaxLength(200, ErrorMessage = "El nombre no puede exceder 200 caracteres")]
        [MinLength(3, ErrorMessage = "El nombre debe tener al menos 3 caracteres")]
        public string Nombre { get; set; } = string.Empty;
        
        [MaxLength(1000, ErrorMessage = "La descripción no puede exceder 1000 caracteres")]
        public string? Descripcion { get; set; }
        
        [Required(ErrorMessage = "El precio es obligatorio")]
        [Range(0.01, 999999.99, ErrorMessage = "El precio debe estar entre 0.01 y 999,999.99")]
        public decimal Precio { get; set; }
        
        [Required(ErrorMessage = "El stock es obligatorio")]
        [Range(0, int.MaxValue, ErrorMessage = "El stock no puede ser negativo")]
        public int Stock { get; set; }
        
        [Required(ErrorMessage = "La categoría es obligatoria")]
        [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar una categoría válida")]
        public int CategoriaId { get; set; }
        
        // Archivo de imagen (opcional)
        public IFormFile? Imagen { get; set; }
    }
    
    // DTO para actualizar producto con archivo
    public class ProductoUpdateFormDTO
    {
        [Required]
        [MaxLength(200)]
        [MinLength(3)]
        public string Nombre { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string? Descripcion { get; set; }
        
        [Required]
        [Range(0.01, 999999.99)]
        public decimal Precio { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int Stock { get; set; }
        
        public bool Disponible { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int CategoriaId { get; set; }
        
        // Archivo de imagen (opcional - solo si se quiere cambiar)
        public IFormFile? Imagen { get; set; }
        
        // Flag para eliminar imagen existente
        public bool EliminarImagenActual { get; set; } = false;
    }
}
using System.ComponentModel.DataAnnotations;

namespace AuthAPI.DTOs
{
    // DTO para crear categoría
    public class CategoriaCreateDTO
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Descripcion { get; set; }
    }
    
    // DTO para actualizar categoría
    public class CategoriaUpdateDTO
    {
        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Descripcion { get; set; }
        
        public bool Activa { get; set; }
    }
    
    // DTO para respuesta (lo que devolvemos al cliente)
    public class CategoriaResponseDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public bool Activa { get; set; }
        public DateTime FechaCreacion { get; set; }
        public int CantidadProductos { get; set; } // Conteo de productos
    }
}
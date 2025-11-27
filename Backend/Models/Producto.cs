using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthAPI.Models
{
    public class Producto
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Nombre { get; set; } = string.Empty;
        
        public string? Descripcion { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Precio { get; set; }
        
        public int Stock { get; set; }
        
        public string? ImagenUrl { get; set; }
        
        public bool Disponible { get; set; } = true;
        
        public DateTime FechaCreacion { get; set; } = DateTime.Now;
        
        // Foreign Key
        public int CategoriaId { get; set; }
        
        // Navegación: Un producto pertenece a una categoría
        public Categoria Categoria { get; set; } = null!;
    }
}
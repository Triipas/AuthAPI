namespace AuthAPI.Models
{
    public class Categoria
    {
        public int Id { get; set; }
        
        public string Nombre { get; set; } = string.Empty;
        
        public string? Descripcion { get; set; }
        
        public bool Activa { get; set; } = true;
        
        public DateTime FechaCreacion { get; set; } = DateTime.Now;
        
        // Relación: Una categoría tiene muchos productos
        public ICollection<Producto> Productos { get; set; } = new List<Producto>();
    }
}
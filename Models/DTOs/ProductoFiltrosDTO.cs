namespace AuthAPI.DTOs
{
    public class ProductoFiltrosDTO : PaginacionParams
    {
        // Búsqueda por texto
        public string? SearchTerm { get; set; }
        
        // Filtro por categoría
        public int? CategoriaId { get; set; }
        
        // Filtro por rango de precio
        public decimal? PrecioMin { get; set; }
        public decimal? PrecioMax { get; set; }
        
        // Filtro por disponibilidad
        public bool? Disponible { get; set; }
        
        // Ordenamiento
        public string OrderBy { get; set; } = "nombre"; // nombre, precio, fecha
        public bool Descending { get; set; } = false;
    }
}
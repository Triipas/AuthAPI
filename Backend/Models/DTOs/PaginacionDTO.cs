namespace AuthAPI.DTOs
{
    // DTO para parámetros de paginación
    public class PaginacionParams
    {
        private const int MaxPageSize = 50;
        private int _pageSize = 10;
        
        public int PageNumber { get; set; } = 1;
        
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }
    }
    
    // DTO para metadata de paginación
    public class PaginacionMetadata
    {
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public bool HasPrevious => CurrentPage > 1;
        public bool HasNext => CurrentPage < TotalPages;
    }
    
    // Respuesta paginada genérica
    public class PaginatedResponse<T>
    {
        public IEnumerable<T> Data { get; set; } = new List<T>();
        public PaginacionMetadata Pagination { get; set; } = new PaginacionMetadata();
    }
}
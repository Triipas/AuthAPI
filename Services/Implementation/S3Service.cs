using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;

namespace AuthAPI.Services
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;
        private readonly ILogger<S3Service> _logger;
        
        public S3Service(
            IAmazonS3 s3Client, 
            IConfiguration configuration,
            ILogger<S3Service> logger)
        {
            _s3Client = s3Client;
            _bucketName = configuration["AWS:BucketName"] 
                ?? throw new ArgumentNullException("AWS:BucketName no configurado");
            _logger = logger;
        }
        public async Task<string> SubirArchivoAsync(IFormFile archivo, string carpeta)
        {
            try
            {
                // Validar archivo
                if (archivo == null || archivo.Length == 0)
                {
                    throw new ArgumentException("El archivo está vacío");
                }
                
                // Validar tipo de archivo
                var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();
                
                if (!extensionesPermitidas.Contains(extension))
                {
                    throw new ArgumentException($"Extensión {extension} no permitida. Solo se permiten: {string.Join(", ", extensionesPermitidas)}");
                }
                
                // Validar tamaño (5MB)
                if (archivo.Length > 5 * 1024 * 1024)
                {
                    throw new ArgumentException("El archivo no puede superar 5MB");
                }
                
                // Generar nombre único
                var nombreArchivo = $"{Guid.NewGuid()}{extension}";
                var key = $"{carpeta}/{nombreArchivo}";
                
                // Preparar request
                var uploadRequest = new TransferUtilityUploadRequest
                {
                    InputStream = archivo.OpenReadStream(),
                    Key = key,
                    BucketName = _bucketName,
                    ContentType = archivo.ContentType,
                    CannedACL = S3CannedACL.PublicRead // Archivo público
                };
                
                // Subir archivo
                var transferUtility = new TransferUtility(_s3Client);
                await transferUtility.UploadAsync(uploadRequest);
                
                // Generar URL pública
                var url = $"https://{_bucketName}.s3.amazonaws.com/{key}";
                
                _logger.LogInformation($"Archivo subido exitosamente: {url}");
                
                return url;
            }
            catch (AmazonS3Exception ex)
            {
                _logger.LogError(ex, "Error de S3 al subir archivo");
                throw new Exception($"Error al subir archivo a S3: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir archivo");
                throw;
            }
        }
        
        /// Elimina un archivo de S3 usando su URL

        public async Task<bool> EliminarArchivoAsync(string urlArchivo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(urlArchivo))
                {
                    return false;
                }
                
                // Extraer el key de la URL
                // Ejemplo: https://mi-bucket.s3.amazonaws.com/perfiles/abc123.jpg
                // Key sería: perfiles/abc123.jpg
                var uri = new Uri(urlArchivo);
                var key = uri.AbsolutePath.TrimStart('/');
                
                var deleteRequest = new DeleteObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };
                
                await _s3Client.DeleteObjectAsync(deleteRequest);
                
                _logger.LogInformation($"Archivo eliminado: {key}");
                
                return true;
            }
            catch (AmazonS3Exception ex)
            {
                _logger.LogError(ex, $"Error de S3 al eliminar archivo: {urlArchivo}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar archivo: {urlArchivo}");
                return false;
            }
        }
        public async Task<bool> ExisteArchivoAsync(string key)
        {
            try
            {
                var request = new GetObjectMetadataRequest
                {
                    BucketName = _bucketName,
                    Key = key
                };
                
                await _s3Client.GetObjectMetadataAsync(request);
                return true;
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return false;
            }
        }
    }
}
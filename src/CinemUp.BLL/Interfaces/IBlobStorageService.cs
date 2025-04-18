namespace CinemUp.BLL.Interfaces;

public interface IBlobStorageService
{
    Task<string> UploadBlobAsync(string containerName, string blobName, Stream content);
    Task DeleteBlobAsync(string containerName, string blobName);
}

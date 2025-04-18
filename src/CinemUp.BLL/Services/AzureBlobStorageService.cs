using Azure.Storage.Blobs;
using CinemUp.BLL.Interfaces;

namespace CinemUp.BLL.Services;

public class AzureBlobStorageService(BlobServiceClient blobServiceClient) : IBlobStorageService
{
    public async Task<string> UploadBlobAsync(string containerName, string blobName, Stream content)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync();

        var blobClient = containerClient.GetBlobClient(blobName);
        await blobClient.UploadAsync(content, true);

        return blobClient.Uri.ToString();
    }

    public async Task DeleteBlobAsync(string containerName, string blobName)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(blobName);

        await blobClient.DeleteIfExistsAsync();
    }
}

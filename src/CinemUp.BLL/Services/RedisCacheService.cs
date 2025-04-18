using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace CinemUp.BLL.Services;

public class RedisCacheService
{
    private readonly IDistributedCache _cache;

    public RedisCacheService(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<T?> GetDataAsync<T>(string key)
    {
        var data = await _cache.GetStringAsync(key);

        if (data == null)
        {
            return default(T);
        }

        return JsonSerializer.Deserialize<T>(data);
    }

    public async Task SetDataAsync<T>(string key, T data, TimeSpan? expiry = null)
    {
        if (expiry == null)
        {
            expiry = TimeSpan.FromDays(1);
        }

        var options = new DistributedCacheEntryOptions() { AbsoluteExpirationRelativeToNow = expiry };

        await _cache.SetStringAsync(key, JsonSerializer.Serialize(data), options);
    }

    public async Task RemoveDataAsync(string key)
    {
        await _cache.RemoveAsync(key);
    }
}

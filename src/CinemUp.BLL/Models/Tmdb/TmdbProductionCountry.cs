using System.Text.Json.Serialization;

namespace CinemUp.BLL.Models.Tmdb;

public class TmdbProductionCountry
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

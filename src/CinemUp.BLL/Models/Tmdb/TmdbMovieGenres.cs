using System.Text.Json.Serialization;

namespace CinemUp.BLL.Models.Tmdb;

public class TmdbMovieGenres
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

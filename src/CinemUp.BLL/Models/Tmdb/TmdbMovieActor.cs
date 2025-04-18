using System.Text.Json.Serialization;

namespace CinemUp.BLL.Models.Tmdb;

public class TmdbMovieActor
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }
    [JsonPropertyName("profile_path")]
    public string? ProfileImageUri { get; set; }
}

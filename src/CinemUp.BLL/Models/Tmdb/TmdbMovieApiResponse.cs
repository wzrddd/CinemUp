using System.Text.Json.Serialization;

namespace CinemUp.BLL.Models.Tmdb;

public class TmdbMovieApiResponse
{
    [JsonPropertyName("page")]
    public int Page { get; set; }

    [JsonPropertyName("results")]
    public List<TmdbMovieModel>? Movies { get; set; }
}

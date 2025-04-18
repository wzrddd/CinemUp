using System.Text.Json.Serialization;

namespace CinemUp.BLL.Models.Tmdb;

public class TmdbVideosResponse
{
    [JsonPropertyName("results")]
    public List<TmdbMovieTrailer> Trailers { get; set; } = new List<TmdbMovieTrailer>();
}

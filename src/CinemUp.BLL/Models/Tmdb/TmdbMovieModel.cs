using System.Text.Json.Serialization;

namespace CinemUp.BLL.Models.Tmdb;

public class TmdbMovieModel
{
    [JsonPropertyName("id")]
    public int Id { get; set; }
    [JsonPropertyName("title")]
    public string? Title { get; set; }
    [JsonPropertyName("overview")]
    public string? Description { get; set; }
    [JsonPropertyName("poster_path")]
    public string? ImageUri { get; set; }
    [JsonPropertyName("genres")]
    public List<TmdbMovieGenres>? Genres { get; set; }
    [JsonPropertyName("release_date")]
    public string? ReleaseYear { get; set; }
    [JsonPropertyName("vote_average")]
    public double Rating { get; set; }
    [JsonPropertyName("runtime")]
    public int Duration { get; set; }
    [JsonPropertyName("production_countries")]
    public List<TmdbProductionCountry>? ProductionCountries { get; set; }
    [JsonPropertyName("tagline")]
    public string TagLine { get; set; } = string.Empty;
}

using System.Text.Json.Serialization;

namespace CinemUp.BLL.Models.Tmdb;

public class TmdbMovieCreditsResponse
{
    [JsonPropertyName("cast")]
    public List<TmdbMovieActor>? Actors { get; set; }
    [JsonPropertyName("crew")]
    public List<TmdbCrewMember>? Crew { get; set; }
}

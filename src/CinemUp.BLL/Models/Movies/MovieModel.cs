using CinemUp.BLL.Models.Tmdb;

namespace CinemUp.BLL.Models.Movies;

public class MovieModel
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? ImageUri { get; set; }
    public List<TmdbMovieGenres>? Genres { get; set; }
    public string? ReleaseYear { get; set; }
    public double Rating { get; set; }
    public string? Trailer { get; set; }
    public List<MovieActor>? Actors { get; set; }
    public int Duration { get; set; }
    public List<string>? ProductionCountries { get; set; }
    public List<string>? Directors { get; set; }
    public string TagLine { get; set; } = string.Empty;
    public bool IsFavorite { get; set; }
    public bool IsWatched { get; set; }
}

using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using AutoMapper;
using CinemUp.BLL.Constants;
using CinemUp.BLL.Exceptions;
using CinemUp.BLL.Models.Movies;
using CinemUp.BLL.Models.Tmdb;
using Microsoft.Extensions.Configuration;
using RestSharp;

namespace CinemUp.BLL.Services;

public class TmdbService
{
    private readonly IMapper _mapper;
    private readonly RestClient _client;

    public TmdbService(IMapper mapper, IConfiguration configuration)
    {
        _mapper = mapper;
        var TMDB_API_KEY = configuration["TMDB_API_KEY"]
                           ?? Environment.GetEnvironmentVariable("TMDB_API_KEY");

        var options = new RestClientOptions(TmdbEndpointsUri.BaseUri);
        _client = new RestClient(options);
        _client.AddDefaultHeader("accept", "application/json");
        _client.AddDefaultHeader("Authorization", TMDB_API_KEY);
    }

    public async Task<List<MovieModel>> GetListOfMoviesAsync(string uri)
    {
        var response = await GetResponseAsync(uri);

        var tmdbMovies = JsonSerializer.Deserialize<TmdbMovieApiResponse>(response.Content)
            .Movies
            .Where(m => IsUkrainianText(m.Title) && IsUkrainianText(m.Description))
            .ToList();

        return _mapper.Map<List<MovieModel>>(tmdbMovies);
    }

    public async Task<MovieModel> GetMovieDetailsById(int movieId)
    {
        var options = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        var movieResponse = await GetResponseAsync(TmdbEndpointsUri.GetMovieByIdEndpoint(movieId));
        var creditsResponse = await GetResponseAsync(TmdbEndpointsUri.GetMovieCreditsEndpoint(movieId));
        var movieTrailerReponse = await GetResponseAsync(TmdbEndpointsUri.GetMovieTrailerEndpoint(movieId));

        var tmdbMovie = JsonSerializer.Deserialize<TmdbMovieModel>(movieResponse.Content);
        var tmdbCredits = JsonSerializer.Deserialize<TmdbMovieCreditsResponse>(creditsResponse.Content, options);
        var tmdbMovieTrailers = JsonSerializer.Deserialize<TmdbVideosResponse>(movieTrailerReponse.Content, options);

        var movie = _mapper.Map<MovieModel>(tmdbMovie);
        movie.Actors = _mapper.Map<List<MovieActor>>(tmdbCredits.Actors);
        movie.Directors = _mapper.Map<List<string>>(tmdbCredits.Crew
            .Where(c => c.Job == "Director")
            .ToList());

        var movieTrailer = tmdbMovieTrailers.Trailers.FirstOrDefault();

        if (movieTrailer != null)
        {
            movie.Trailer = string.Format(Messages.YoutubeTrailerLink, movieTrailer.Key, movieTrailer.Id);
        }

        return movie;
    }

    private async Task<RestResponse> GetResponseAsync(string uri)
    {
        var request = new RestRequest(uri);
        var response = await _client.GetAsync(request);

        if (!response.IsSuccessful || response.Content == null)
        {
            throw new BadRequestException("Error getting data from tmdb api");
        }

        return response;
    }

    private static bool IsUkrainianText(string text)
    {
        return !string.IsNullOrWhiteSpace(text) && Regex.IsMatch(text, @"^[а-яА-ЯіїєґІЇЄҐ0-9\s\p{P}]+$");
    }
}

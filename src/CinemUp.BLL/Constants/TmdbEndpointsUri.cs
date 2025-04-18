using CinemUp.DAL.Enums;

namespace CinemUp.BLL.Constants
{
    public static class TmdbEndpointsUri
    {
        private const string UkrLanguage = "uk-UA";

        public const string BaseUri = "https://api.themoviedb.org/3/";
        public const string PopularMovieEndpoint = $"movie/popular?language={UkrLanguage}";
        public const string UkrCountry = "UA";

        public static string GetEndpointForGenre(TmdbMovieGenre tmdbMovieGenre)
        {
            return $"/discover/movie?include_adult=true&language={UkrLanguage}&with_genres={(int)tmdbMovieGenre}";
        }

        public static string GetSearchEndpoint(string query)
        {
            return $"/search/movie?include_adult=true&language={UkrLanguage}&query={query}";
        }

        public static string GetMovieByIdEndpoint(int id)
        {
            return $"/movie/{id.ToString()}?language={UkrLanguage}";
        }

        public static string GetMovieCreditsEndpoint(int movieId)
        {
            return $"https://api.themoviedb.org/3/movie/{movieId}/credits?language={UkrLanguage}";
        }

        public static string GetMovieTrailerEndpoint(int movieId)
        {
            return $"https://api.themoviedb.org/3/movie/{movieId}/videos?language={UkrLanguage}";
        }

        public static string GetPopularUkrainianMoviesEndpoint()
        {
            return $"/discover/movie?include_adult=true&language={UkrLanguage}&with_origin_country={UkrCountry}";
        }

        public static string GetNowPlayingUkrainianMoviesEndpoint()
        {
            return $"https://api.themoviedb.org/3/movie/now_playing?language={UkrLanguage}&region={UkrCountry}";
        }
    }
}

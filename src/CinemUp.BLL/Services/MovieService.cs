using AutoMapper;
using CinemUp.BLL.Constants;
using CinemUp.BLL.Exceptions;
using CinemUp.BLL.Models.Movies;
using CinemUp.BLL.Models.Search;
using CinemUp.DAL.Data;
using CinemUp.DAL.Entities;
using CinemUp.DAL.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemUp.BLL.Services;

public class MovieService(
    DataContext context,
    IMapper mapper,
    TmdbService tmdbService,
    UserService userService,
    AchievementService achievementService,
    RedisCacheService redisCacheService)
{
    public async Task<MoviesOverviewViewModel> GetMoviesListAsync()
    {
        var movies = await redisCacheService.GetDataAsync<MoviesOverviewViewModel>("Overview");

        if (movies != null)
        {
            return movies;
        }

        movies = new MoviesOverviewViewModel
        {
            NowPlayingUkrainianMovies =
                await tmdbService.GetListOfMoviesAsync(TmdbEndpointsUri.GetNowPlayingUkrainianMoviesEndpoint()),
            UkrainianMovies =
                await tmdbService.GetListOfMoviesAsync(TmdbEndpointsUri.GetPopularUkrainianMoviesEndpoint()),
            PopularMovies =
                await tmdbService.GetListOfMoviesAsync(TmdbEndpointsUri.PopularMovieEndpoint),
            Comedies =
                await tmdbService.GetListOfMoviesAsync(TmdbEndpointsUri.GetEndpointForGenre(TmdbMovieGenre.Comedy)),
            Fantasy =
                await tmdbService.GetListOfMoviesAsync(TmdbEndpointsUri.GetEndpointForGenre(TmdbMovieGenre.Fantasy)),
            Actions =
                await tmdbService.GetListOfMoviesAsync(TmdbEndpointsUri.GetEndpointForGenre(TmdbMovieGenre.Action)),
            Horrors =
                await tmdbService.GetListOfMoviesAsync(TmdbEndpointsUri.GetEndpointForGenre(TmdbMovieGenre.Horror)),
            Dramas =
                await tmdbService.GetListOfMoviesAsync(TmdbEndpointsUri.GetEndpointForGenre(TmdbMovieGenre.Drama)),
            Adventure =
                await tmdbService.GetListOfMoviesAsync(TmdbEndpointsUri.GetEndpointForGenre(TmdbMovieGenre.Adventure)),
            Documentaries =
                await tmdbService.GetListOfMoviesAsync(TmdbEndpointsUri.GetEndpointForGenre(TmdbMovieGenre.Documentary))
        };

        await redisCacheService.SetDataAsync("Overview", movies);

        return movies;
    }

    public async Task<List<MovieModel>> SearchMoviesAsync(SearchMovieModel model)
    {
        return await tmdbService.GetListOfMoviesAsync(TmdbEndpointsUri.GetSearchEndpoint(model.Query));
    }

    public async Task<MovieModel> GetMovieByIdAsync(int movieId, int userId)
    {
        var movie = await redisCacheService.GetDataAsync<MovieModel>(movieId.ToString());

        if (movie == null)
        {
            movie = await tmdbService.GetMovieDetailsById(movieId);
            await redisCacheService.SetDataAsync(movieId.ToString(), movie);
        }

        movie.IsFavorite = await context.UserMovieStatuses!
            .AnyAsync(u => u.UserId == userId && u.MovieId == movieId && u.MovieStatus == MovieStatus.Favorite);

        movie.IsWatched = await context.UserMovieStatuses!
            .AnyAsync(u => u.UserId == userId && u.MovieId == movieId && u.MovieStatus == MovieStatus.Watched);

        return movie;
    }

    public async Task AddMovieReactionAsync(int movieId, int userId, MovieReactionTypes movieReactionType)
    {
        var existingReaction = await context.Set<MovieReaction>()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.MovieId == movieId);

        if (existingReaction != null)
        {
            existingReaction.MovieReactionType = movieReactionType;
        }

        else
        {
            existingReaction = new MovieReaction
            {
                UserId = userId,
                MovieId = movieId,
                MovieReactionType = movieReactionType
            };

            await context.Set<MovieReaction>().AddAsync(existingReaction);
        }

        await context.SaveChangesAsync();
    }

    public async Task<List<MovieModel>> GetUserMoviesAsync(int userId, MovieStatus movieStatus)
    {
        var movieIds = context.UserMovieStatuses!
            .Where(m => m.UserId == userId && m.MovieStatus == movieStatus)
            .Select(m => m.MovieId);

        var movies = await context.Movies!
            .Where(m => movieIds.Contains(m.Id))
            .ToListAsync();

        return mapper.Map<List<MovieModel>>(movies);
    }

    public async Task AddMovieToStatusAsync(int userId, int movieId, MovieStatus movieStatus)
    {
        var movie = await context.Movies!.FindAsync(movieId);

        if (movie == null)
        {
            movie = mapper.Map<Movie>(await GetMovieByIdAsync(movieId, userId));
            await context.Movies!.AddAsync(movie);
        }

        await context.UserMovieStatuses!.AddAsync(new UserMovieStatus()
        {
            UserId = userId,
            MovieId = movieId,
            MovieStatus = movieStatus
        });

        await context.SaveChangesAsync();

        if (movieStatus == MovieStatus.Favorite)
        {
            await achievementService.RecordAchievementAsync(userId, AchievementCategory.FavoriteMovies);
        }
        else
        {
            await achievementService.RecordAchievementAsync(userId, AchievementCategory.WatchedMovies);
        }
    }

    public async Task DeleteMovieFromUserIfExistsAsync(int userId, int movieId, MovieStatus movieStatus)
    {
        var userMovieStatus = await context.UserMovieStatuses!
            .SingleOrDefaultAsync(u => u.UserId == userId && u.MovieId == movieId && u.MovieStatus == movieStatus);

        if (userMovieStatus != null)
        {
            context.UserMovieStatuses!.Remove(userMovieStatus);
            await context.SaveChangesAsync();
        }
    }

    public async Task CreateSharedListAsync(int userId, string listName)
    {
        var user = await context.Users!.FindAsync(userId);

        if (user == null)
        {
            throw new NotFoundException("User doesn't exist");
        }

        await context.SharedLists!.AddAsync(new SharedList()
        {
            OwnerId = userId,
            Name = listName,
            Users = new List<User> { user }
        });

        await context.SaveChangesAsync();
    }

    public async Task AddUserToSharedListAsync(int ownerId, int userId, int sharedListId)
    {
        var sharedList = await context.SharedLists!
            .Include(s => s.Users)
            .FirstOrDefaultAsync(s => s.Id == sharedListId);

        if (sharedList == null)
        {
            throw new NotFoundException("Shared list doesn't exist");
        }

        if (sharedList.OwnerId != ownerId)
        {
            throw new BadRequestException("You are not the owner of this list");
        }

        var user = await userService.GetUserByIdAsync(userId);

        if (!sharedList.Users.Contains(user))
        {
            sharedList.Users.Add(user);
            await context.SaveChangesAsync();
        }
    }

    public async Task AddMovieToSharedListAsync(int userId, int movieId, int sharedListId)
    {
        var sharedList = await context.SharedLists!
            .Include(s => s.Users)
            .Include(s => s.Movies)
            .FirstOrDefaultAsync(s => s.Id == sharedListId);

        if (sharedList == null)
        {
            throw new NotFoundException("Shared list doesn't exist");
        }

        var user = sharedList.Users.SingleOrDefault(u => u.Id == userId);

        if (user == null)
        {
            throw new NotFoundException("User isn't in members of list");
        }

        var movie = await context.Movies!.FindAsync(movieId);

        if (movie == null)
        {
            movie = mapper.Map<Movie>(await GetMovieByIdAsync(movieId, userId));
            await context.Movies!.AddAsync(movie);
        }

        if (!sharedList.Movies.Contains(movie))
        {
            sharedList.Movies.Add(movie);
            await context.SaveChangesAsync();
        }
    }

    public async Task<List<SharedListModel>> GetSharedListsForUserAsync(int userId)
    {
        var user = await userService.GetUserByIdAsync(userId);

        var sharedLists = await context.SharedLists!
            .Where(s => s.Users.Contains(user))
            .Select(s => new SharedListModel
            {
                Id = s.Id,
                Name = s.Name,
                CreatedAt = s.CreatedAt
            })
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return mapper.Map<List<SharedListModel>>(sharedLists);
    }

    public async Task<SharedListModel> GetSharedListById(int userId, int sharedListId)
    {
        var user = await userService.GetUserByIdAsync(userId);

        var sharedList = mapper.Map<SharedListModel>(await context.SharedLists!
            .Include(s => s.Users)
            .Include(s => s.Movies)
            .FirstOrDefaultAsync(s => s.Id == sharedListId && s.Users.Contains(user)));

        sharedList.IsOwner = sharedList.OwnerId == userId;

        return sharedList;
    }

    public async Task LeaveSharedListAsync(int userId, int sharedListId)
    {
        var sharedList = await context.SharedLists!
            .Include(s => s.Users)
            .FirstOrDefaultAsync(s => s.Id == sharedListId);

        if (sharedList == null)
        {
            throw new NotFoundException("Shared list doesn't exist");
        }

        if (sharedList.OwnerId == userId)
        {
            var otherUser = sharedList.Users.FirstOrDefault(u => u.Id != userId);

            if (otherUser == null)
            {
                context.SharedLists!.Remove(sharedList);
                await context.SaveChangesAsync();

                return;
            }

            sharedList.OwnerId = otherUser.Id;
        }

        await RemoveUserFromSharedList(sharedList, userId);
    }

    public async Task DeleteSharedListAsync(int userId, int sharedListId)
    {
        var sharedList = await context.SharedLists!
            .Include(s => s.Users)
            .FirstOrDefaultAsync(s => s.Id == sharedListId);

        if (sharedList == null)
        {
            throw new NotFoundException("Shared list doesn't exist");
        }

        if (sharedList.OwnerId != userId)
        {
            throw new BadRequestException("You are not the owner of this list");
        }

        context.SharedLists!.Remove(sharedList);
        await context.SaveChangesAsync();
    }

    public async Task DeleteUserFromSharedListAsync(int userId, int userToDeleteId, int sharedListId)
    {
        if (userId == userToDeleteId)
        {
            throw new BadRequestException("You cannot delete yourself");
        }

        var sharedList = await context.SharedLists!
            .Include(s => s.Users)
            .FirstOrDefaultAsync(s => s.Id == sharedListId);

        if (sharedList == null)
        {
            throw new NotFoundException("Shared list doesn't exist");
        }

        if (sharedList.OwnerId != userId)
        {
            throw new BadRequestException("Only the owner can remove a user from the shared list");
        }

        await RemoveUserFromSharedList(sharedList, userToDeleteId);
    }

    private async Task RemoveUserFromSharedList(SharedList sharedList, int userId)
    {
        var user = await userService.GetUserByIdAsync(userId);

        sharedList.Users.Remove(user);
        await context.SaveChangesAsync();
    }
}

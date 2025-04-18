using CinemUp.BLL.Models.Movies;
using CinemUp.BLL.Models.Search;
using CinemUp.BLL.Models.Tmdb;
using CinemUp.BLL.Models.Users;
using CinemUp.BLL.Services;
using CinemUp.DAL.Enums;
using CinemUp.Presentation.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemUp.Presentation.Controllers;

public class MoviesController : BaseApiController
{
    private readonly MovieService _movieService;

    public MoviesController(MovieService movieService)
    {
        _movieService = movieService;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<MoviesOverviewViewModel>> GetMovies()
    {
        return Ok(await _movieService.GetMoviesListAsync());
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<MovieModel>>> SearchMovies([FromQuery] SearchMovieModel model)
    {
        return Ok(await _movieService.SearchMoviesAsync(model));
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<TmdbMovieModel>> GetMovieById(int id)
    {
        return Ok(await _movieService.GetMovieByIdAsync(id, User.GetUserId()));
    }

    [HttpPost("movie-reaction/{movieId:int}")]
    public async Task<IActionResult> AddMovieReaction(int movieId, [FromQuery] MovieReactionTypes movieReactionType)
    {
        var userId = User.GetUserId();
        await _movieService.AddMovieReactionAsync(movieId, userId, movieReactionType);

        return Ok();
    }

    [HttpGet("user-movies")]
    [Authorize]
    public async Task<ActionResult<List<UserProfileModel>>> GetUserMovies(MovieStatus movieStatus)
    {
        return Ok(await _movieService.GetUserMoviesAsync(User.GetUserId(), movieStatus));
    }

    [HttpPost("add-movie-to-user")]
    [Authorize]
    public async Task AddMovieToStatus([FromQuery] MovieStatusModel model)
    {
        await _movieService.AddMovieToStatusAsync(User.GetUserId(), model.Id, model.MovieStatus);
    }

    [HttpDelete("delete-movie-user")]
    [Authorize]
    public async Task DeleteMovieFromUserIfExists([FromQuery] MovieStatusModel model)
    {
        await _movieService.DeleteMovieFromUserIfExistsAsync(User.GetUserId(), model.Id, model.MovieStatus);
    }

    [HttpPost("create-shared-list")]
    [Authorize]
    public async Task CreateSharedList(string listName)
    {
        await _movieService.CreateSharedListAsync(User.GetUserId(), listName);
    }

    [HttpPost("add-user-to-shared-list")]
    [Authorize]
    public async Task AddUserToSharedList(int userId, int sharedListId)
    {
        await _movieService.AddUserToSharedListAsync(User.GetUserId(), userId, sharedListId);
    }

    [HttpPost("add-movie-to-shared-list")]
    [Authorize]
    public async Task AddMovieToSharedList(int movieId, int sharedListId)
    {
        await _movieService.AddMovieToSharedListAsync(User.GetUserId(), movieId, sharedListId);
    }

    [HttpGet("get-shared-lists-for-user")]
    [Authorize]
    public async Task<ActionResult<List<SharedListModel>>> GetSharedListsForUser()
    {
        return Ok(await _movieService.GetSharedListsForUserAsync(User.GetUserId()));
    }

    [HttpGet("get-shared-list/{id}")]
    [Authorize]
    public async Task<ActionResult<SharedListModel>> GetSharedListById(int id)
    {
        return Ok(await _movieService.GetSharedListById(User.GetUserId(), id));
    }

    [HttpDelete("delete-shared-list-for-user")]
    [Authorize]
    public async Task DeleteSharedListsForUser(int sharedListId)
    {
        await _movieService.DeleteSharedListAsync(User.GetUserId(), sharedListId);
    }

    [HttpDelete("leave-shared-list")]
    [Authorize]
    public async Task LeaveSharedListsForUser(int sharedListId)
    {
        await _movieService.LeaveSharedListAsync(User.GetUserId(), sharedListId);
    }

    [HttpDelete("delete-user-from-shared-lists")]
    [Authorize]
    public async Task DeleteUserFromSharedList(int userToDeleteId, int sharedListId)
    {
        await _movieService.DeleteUserFromSharedListAsync(User.GetUserId(), userToDeleteId, sharedListId);
    }
}

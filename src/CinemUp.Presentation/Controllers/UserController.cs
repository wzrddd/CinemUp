using System.Security.Claims;
using CinemUp.BLL.Models.Search;
using CinemUp.BLL.Models.Users;
using CinemUp.BLL.Services;
using CinemUp.Presentation.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemUp.Presentation.Controllers;

public class UserController : BaseApiController
{
    private readonly UserService _userService;
    private readonly NotificationService _notificationService;
    private readonly AchievementService _achievementService;

    public UserController(UserService userService, NotificationService notificationService, AchievementService achievementService)
    {
        _userService = userService;
        _notificationService = notificationService;
        _achievementService = achievementService;
    }

    [HttpPost("sign-up")]
    public async Task<ActionResult<UserModel>> CreateUser(RegisterUserModel model)
    {
        return Ok(await _userService.RegisterUserAsync(model));
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserModel>> LoginUser(LoginUserModel model)
    {
        return Ok(await _userService.LoginUserAsync(model));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPasswordRequest(ForgotPasswordModel model)
    {
        await _userService.CreateForgotPasswordRequestAsync(model);

        return Ok("Код для відновлення пароля було надіслано на вашу електронну пошту. " +
                  "Будь ласка, перевірте вхідні повідомлення та дотримуйтесь інструкцій.");
    }

    [HttpPost("verify-code")]
    public async Task<ActionResult> VerifyCode(VerifyCodeModel model)
    {
        await _userService.VerifyCodeAsync(model);

        return Ok();
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword(ResetPasswordModel model)
    {
        await _userService.ResetPasswordAsync(model);

        return Ok("Ваш пароль було успішно змінено");
    }

    [HttpGet("search")]
    [Authorize]
    public async Task<ActionResult<List<UserProfileModel>>> Search([FromQuery] SearchUserModel model)
    {
        return Ok(await _userService.SearchUsersAsync(model.UserName, User.GetUserId()));
    }

    [HttpGet("search-friends")]
    [Authorize]
    public async Task<ActionResult<List<UserProfileModel>>> SearchFriends([FromQuery] SearchUserModel model)
    {
        return Ok(await _userService.SearchFriendsAsync(model.UserName, User.GetUserId()));
    }

    [HttpPost("follow/{userId}")]
    [Authorize]
    public async Task<IActionResult> Follow(int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(userIdClaim, out var currentUserId))
        {
            return BadRequest("Invalid user ID");
        }

        if (userId == currentUserId)
        {
            return BadRequest("You cannot follow yourself.");
        }

        var result = await _userService.Follow(userId, currentUserId);

        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }

    [HttpPost("unfollow/{userId}")]
    [Authorize]
    public async Task Unfollow(int userId)
    {
        await _userService.UnFollowAsync(userId, User.GetUserId());
    }

    [HttpGet("notifications")]
    [Authorize]
    public async Task<ActionResult<List<NotificationModel>>> GetNotificationsForUser()
    {
        return Ok(await _notificationService.GetNotificationsForUserAsync(User.GetUserId()));
    }

    [HttpGet("own-user-profile")]
    [Authorize]
    public async Task<ActionResult<UserProfileModel>> GetOwnUserProfile()
    {
        var userProfile = await _userService.GetOwnUserProfileByIdAsync(User.GetUserId());

        if (userProfile == null)
        {
            return NotFound();
        }

        return Ok(userProfile);
    }

    [HttpGet("user-profile/{id}")]
    [Authorize]
    public async Task<ActionResult<UserProfileModel>> GetUserProfileById(int id)
    {
        var currentUserId = User.GetUserId();

        var userProfile = await _userService.GetUserProfileByIdAsync(id, currentUserId);

        if (userProfile == null)
        {
            return NotFound();
        }

        return Ok(userProfile);
    }

    [HttpGet("followers")]
    [Authorize]
    public async Task<ActionResult<List<UserProfileModel>>> GetFollowers()
    {
        return Ok(await _userService.GetFollowersAsync(User.GetUserId()));
    }

    [HttpGet("following")]
    [Authorize]
    public async Task<ActionResult<List<UserProfileModel>>> GetFollowing()
    {
        return Ok(await _userService.GetFollowingAsync(User.GetUserId()));
    }

    [HttpGet("friends")]
    [Authorize]
    public async Task<ActionResult<List<UserProfileModel>>> GetFriends()
    {
        return Ok(await _userService.GetFriedsAsync(User.GetUserId()));
    }

    [HttpGet("get-achievements-for-user")]
    [Authorize]
    public async Task<ActionResult<List<AchievementModel>>> GetAchievementsForUserById()
    {
        return Ok(await _achievementService.GetAchievementsForUserById(User.GetUserId()));
    }
}

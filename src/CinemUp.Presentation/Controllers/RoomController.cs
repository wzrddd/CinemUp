using CinemUp.BLL.Constants;
using CinemUp.BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CinemUp.Presentation.Controllers;

public class RoomController : BaseApiController
{
    private readonly NotificationService _notificationService;

    public RoomController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpPost("send-code")]
    [Authorize]
    public async Task SendCodeToUser(string code, int userId)
    {
        var username = User.Identity!.Name;

        await _notificationService.AddNotificationForUserAsync(userId, string.Format(Messages.SendCodeMessage, username, code));
    }
}

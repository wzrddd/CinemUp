using AutoMapper;
using CinemUp.BLL.Models.Users;
using CinemUp.DAL.Data;
using CinemUp.DAL.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemUp.BLL.Services;

public class NotificationService(
    DataContext context,
    IMapper mapper)
{
    public async Task<List<NotificationModel>> GetNotificationsForUserAsync(int userId)
    {
        var notifications = await context.Notifications!
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return mapper.Map<List<NotificationModel>>(notifications);
    }

    public async Task AddNotificationForUserAsync(int userId, string message)
    {
        await context.Notifications!.AddAsync(new NotificationEntity() { UserId = userId, Message = message });
        await context.SaveChangesAsync();
    }
}

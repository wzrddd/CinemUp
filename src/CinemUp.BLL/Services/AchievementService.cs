using AutoMapper;
using CinemUp.BLL.Constants;
using CinemUp.BLL.Exceptions;
using CinemUp.BLL.Models.Users;
using CinemUp.DAL.Data;
using CinemUp.DAL.Entities;
using CinemUp.DAL.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemUp.BLL.Services;

public class AchievementService(
    DataContext context,
    IMapper mapper,
    NotificationService notificationService)
{
    public async Task<List<AchievementModel>> GetAchievementsForUserById(int userId)
    {
        var userAchievementIds = context.UserAchievements!
            .Where(u => u.UserId == userId)
            .Select(u => u.AchievementId);

        var newAchievementIds = context.UserAchievements!
            .Where(u => u.UserId == userId && u.IsNew == true)
            .Select(u => u.AchievementId);

        var achievements = await context.Achievements!
            .Select(a => new AchievementModel()
            {
                Id = a.Id,
                Name = a.Name,
                IsAchieved = userAchievementIds.Contains(a.Id),
                Description = a.Description,
                AmountOfPoints = a.AmountOfPoints,
                IsNew = newAchievementIds.Contains(a.Id)
            })
            .OrderByDescending(a => a.IsAchieved)
            .ThenByDescending(a => a.IsNew)
            .ToListAsync();

        await ChangeAchievementStatusAsync(newAchievementIds);

        return achievements;
    }

    public async Task RecordAchievementAsync(int userId, AchievementCategory achievementCategory)
    {
        var achievementId = await CheckAchievementCondition(userId, achievementCategory);

        if (achievementId.HasValue)
        {
            var isAdded = await AddAchievementAsync(achievementId.Value, userId);

            if (isAdded)
            {
                var achievement = await context.Achievements!.SingleOrDefaultAsync(a => a.Id == achievementId);

                if (achievement == null)
                {
                    throw new NotFoundException("Achievement is not found");
                }

                var message = string.Format(Messages.AchievementMessage, achievement.Name, achievement.AmountOfPoints);
                await notificationService.AddNotificationForUserAsync(userId, message);

                await AddPointsToUserAsync(userId, achievement.AmountOfPoints);
            }
        }
    }

    private async Task<int?> CheckAchievementCondition(int userId, AchievementCategory achievementCategory)
    {
        return achievementCategory switch
        {
            AchievementCategory.Subscribers => await CheckFollowersAchievements(userId),
            AchievementCategory.Subscriptions => await CheckSubscriptionsAchievements(userId),

            AchievementCategory.FavoriteMovies => await CheckFilmFavoriteAchievements(userId),
            AchievementCategory.WatchedMovies => await CheckFilmWatchedAchievements(userId),

            _ => null
        };
    }

    private async Task<int?> CheckFilmFavoriteAchievements(int userId)
    {
        var favoriteFilmsCount = await context.UserMovieStatuses!
            .CountAsync(u => u.UserId == userId && u.MovieStatus == MovieStatus.Favorite);

        return favoriteFilmsCount switch
        {
            1 => (int)AchievementOptions.FavoriteLover,
            3 => (int)AchievementOptions.TasteAwakens,
            5 => (int)AchievementOptions.FilmArchivist,
            10 => (int)AchievementOptions.FavoriteCollector,
            15 => (int)AchievementOptions.CinephileCollector,

            _ => null
        };
    }

    private async Task<int?> CheckFilmWatchedAchievements(int userId)
    {
        var watchedFilmsCount = await context.UserMovieStatuses!
            .CountAsync(u => u.UserId == userId && u.MovieStatus == MovieStatus.Watched);

        return watchedFilmsCount switch
        {
            1 => (int)AchievementOptions.FirstWatch,
            3 => (int)AchievementOptions.MovieNewbie,
            5 => (int)AchievementOptions.NoviceCinephile,
            10 => (int)AchievementOptions.SeriousViewer,
            15 => (int)AchievementOptions.ViewingGuru,

            _ => null
        };
    }

    private async Task<int?> CheckSubscriptionsAchievements(int userId)
    {
        var subscriptionCount = await context.Follows!
            .CountAsync(f => f.FollowerId == userId);

        return subscriptionCount switch
        {
            1 => (int)AchievementOptions.NewAcquaintance,
            3 => (int)AchievementOptions.CircleOfFriends,
            5 => (int)AchievementOptions.FriendlySquad,
            10 => (int)AchievementOptions.FilmCompany,
            15 => (int)AchievementOptions.MovieCrew,

            _ => null
        };
    }

    private async Task<int?> CheckFollowersAchievements(int userId)
    {
        var followerCount = await context.Follows!
            .CountAsync(f => f.UserId == userId);

        return followerCount switch
        {
            1 => (int)AchievementOptions.FirstFan,
            3 => (int)AchievementOptions.FoundYourAudience,
            5 => (int)AchievementOptions.NoviceCinephile,
            10 => (int)AchievementOptions.RecognizableFigure,
            15 => (int)AchievementOptions.MovieStar,

            _ => null
        };
    }

    private async Task<bool> AddAchievementAsync(int achievementId, int userId)
    {
        var isAchievementExists = await context.Achievements!.AnyAsync(a => a.Id == achievementId);
        var isUserExists = await context.Users!.AnyAsync(u => u.Id == userId);
        var isAchievementInUserExists = await context.UserAchievements!.AnyAsync(a => a.UserId == userId && a.AchievementId == achievementId);

        if (!isAchievementExists || !isUserExists)
        {
            return false;
        }

        if (!isAchievementInUserExists)
        {
            await context.UserAchievements!.AddAsync(new UserAchievement
            {
                AchievementId = achievementId,
                UserId = userId
            });
            await context.SaveChangesAsync();

            return true;
        }

        return false;
    }

    private async Task AddPointsToUserAsync(int userId, int amountOfPoints)
    {
        var user = await context.Users!.FindAsync(userId);

        if (user == null)
        {
            throw new NotFoundException("User is not found");
        }

        user.AmountOfPoints += amountOfPoints;
        await context.SaveChangesAsync();
    }

    private async Task ChangeAchievementStatusAsync(IQueryable<int> achievementIds)
    {
        await context.UserAchievements!
            .Where(u => achievementIds.Contains(u.AchievementId))
            .ForEachAsync(u => u.IsNew = false);

        await context.SaveChangesAsync();
    }
}

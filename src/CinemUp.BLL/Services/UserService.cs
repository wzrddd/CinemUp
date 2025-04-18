using AutoMapper;
using CinemUp.BLL.Constants;
using CinemUp.BLL.Exceptions;
using CinemUp.BLL.Interfaces;
using CinemUp.BLL.Models.Users;
using CinemUp.DAL.Data;
using CinemUp.DAL.Entities;
using CinemUp.DAL.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemUp.BLL.Services;

public class UserService(
    DataContext context,
    ITokenService tokenService,
    IPasswordHasherService passwordHasherService,
    IMapper mapper,
    NotificationService notificationService,
    AchievementService achievementService)
{
    public async Task<User> GetUserByIdAsync(int id)
    {
        var user = await context.Users!.FindAsync(id);

        if (user == null)
        {
            throw new NotFoundException("User doesn't exist");
        }

        return user;
    }

    public async Task<UserModel> RegisterUserAsync(RegisterUserModel model)
    {
        var isEmailExists = await context.Users!.AnyAsync(u => u.Email == model.Email);

        if (isEmailExists)
        {
            throw new BadRequestException("Email is already taken");
        }

        var user = mapper.Map<User>(model);
        user.Password = passwordHasherService.Hash(model.Password!);

        await context.Users!.AddAsync(user);
        await context.SaveChangesAsync();

        var userModel = mapper.Map<UserModel>(user);
        userModel.Token = tokenService.CreateToken(user);

        return userModel;
    }

    public async Task<UserModel> LoginUserAsync(LoginUserModel model)
    {
        var user = await context.Users!
            .Where(u => u.Email == model.Email)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            throw new NotFoundException("User with this email address does not exist");
        }

        if (!passwordHasherService.Verify(user.Password, model.Password))
        {
            throw new ArgumentException();
        }

        var userModel = mapper.Map<UserModel>(user);
        userModel.Token = tokenService.CreateToken(user!);

        return userModel;
    }

    public async Task CreateForgotPasswordRequestAsync(ForgotPasswordModel model)
    {
        var user = await context.Users!.FirstOrDefaultAsync(u => u.Email == model.Email.ToLower());

        if (user == null)
        {
            throw new NotFoundException("User with this email address does not exist");
        }

        var resetToken = GenerateToken();

        var passwordResetToken = new PasswordResetToken
        {
            UserId = user!.Id,
            Token = resetToken,
            ExpiresAt = DateTime.UtcNow.AddHours(1)
        };

        context.PasswordResetTokens!.Add(passwordResetToken);
        await context.SaveChangesAsync();

        var subject = Messages.PasswordResetSubject;
        var message = string.Format(Messages.PasswordResetMessage, resetToken);

        var emailSendModel = new EmailSendModel
        {
            Email = user.Email,
            Subject = subject,
            Message = message
        };

        EmailSender.SendMail(emailSendModel);
    }

    public async Task VerifyCodeAsync(VerifyCodeModel model)
    {
        await GetPasswordResetInfoAsync(model.Code);
    }

    public async Task ResetPasswordAsync(ResetPasswordModel model)
    {
        var passwordResetInfo = await GetPasswordResetInfoAsync(model.Code);

        passwordResetInfo.User!.Password = passwordHasherService.Hash(model.NewPassword);

        context.PasswordResetTokens!.Remove(passwordResetInfo.ResetToken!);
        await context.SaveChangesAsync();
    }

    public async Task<List<UserProfileModel>> SearchUsersAsync(string username, int userId)
    {
        var userProfiles = await context.Users!
            .Where(u => EF.Functions.ILike(u.Username, $"%{username}%") && u.Id != userId)
            .Select(b => new UserProfileModel { Id = b.Id, Username = b.Username })
            .ToListAsync();

        return userProfiles;
    }

    public async Task<List<UserProfileModel>> SearchFriendsAsync(string username, int userId)
    {
        var friendsProfiles = await GetFriedsAsync(userId);

        return friendsProfiles
            .Where(u => u.Username.Contains(username, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    public async Task<ServiceResult> Follow(int userId, int followerId)
    {
        var userAlreadyFollowed = await context.Follows!
            .AnyAsync(u => u.UserId == userId && u.FollowerId == followerId);

        if (userId == followerId)
        {
            return ServiceResult.Failure("You cannot follow yourself.");
        }

        if (userAlreadyFollowed)
        {
            return ServiceResult.Failure("User is already followed.");
        }

        var user = await context.Users!.FirstOrDefaultAsync(p => p.Id == userId);
        var follower = await context.Users!.FirstOrDefaultAsync(p => p.Id == followerId);

        if (user == null || follower == null)
        {
            return ServiceResult.Failure("User or follower not found.");
        }

        context.Follows!.Add(new Follow
        {
            UserId = user.Id,
            FollowerId = follower.Id,
        });

        await context.SaveChangesAsync();

        await notificationService.AddNotificationForUserAsync(userId,
            string.Format(Messages.FollowMessage, follower.Username));

        await achievementService.RecordAchievementAsync(followerId, AchievementCategory.Subscriptions);
        await achievementService.RecordAchievementAsync(userId, AchievementCategory.Subscribers);

        return ServiceResult.Success();
    }

    public async Task UnFollowAsync(int userId, int followerId)
    {
        if (userId == followerId)
        {
            throw new BadRequestException("You cannot unfollow yourself.");
        }

        var follow = await context.Follows!.FirstOrDefaultAsync(f => f.UserId == userId && f.FollowerId == followerId);

        if (follow == null)
        {
            throw new BadRequestException("There isn't a following user");
        }

        context.Follows!.Remove(follow);
        await context.SaveChangesAsync();
    }

    public async Task<UserProfileModel?> GetOwnUserProfileByIdAsync(int userId)
    {
        return await GetBasicUserProfileById(userId);
    }

    public async Task<UserProfileModel> GetUserProfileByIdAsync(int userId, int currentUserId)
    {
        var userProfile = await GetBasicUserProfileById(userId);

        userProfile.IsFollowing = await context.Follows!
            .AnyAsync(f => f.FollowerId == currentUserId && f.UserId == userId);

        return userProfile;
    }

    public async Task<List<UserProfileModel>> GetFollowersAsync(int userId)
    {
        var followersIds = context.Follows!
            .Where(f => f.UserId == userId)
            .Select(f => f.FollowerId);

        return await context.Users!
            .Where(u => followersIds.Contains(u.Id))
            .Select(u => new UserProfileModel { Id = u.Id, Username = u.Username })
            .ToListAsync();
    }

    public async Task<List<UserProfileModel>> GetFollowingAsync(int userId)
    {
        var followingIds = context.Follows!
            .Where(f => f.FollowerId == userId)
            .Select(f => f.UserId);

        return await context.Users!
            .Where(u => followingIds.Contains(u.Id))
            .Select(u => new UserProfileModel { Id = u.Id, Username = u.Username })
            .ToListAsync();
    }

    public async Task<List<UserProfileModel>> GetFriedsAsync(int userId)
    {
        var followingIds = context.Follows!
            .Where(f => f.FollowerId == userId)
            .Select(f => f.UserId);

        var followersIds = context.Follows!
            .Where(f => f.UserId == userId)
            .Select(f => f.FollowerId);

        var friendsIds = followersIds.Intersect(followingIds);

        return await context.Users!
            .Where(u => friendsIds.Contains(u.Id))
            .Select(u => new UserProfileModel { Id = u.Id, Username = u.Username })
            .ToListAsync();
    }

    private async Task<UserResetToken> GetPasswordResetInfoAsync(string code)
    {
        var resetToken = await context.PasswordResetTokens!
            .SingleOrDefaultAsync(t => t.Token == code && t.ExpiresAt > DateTime.UtcNow);

        if (resetToken == null)
        {
            throw new BadRequestException("Invalid code");
        }

        var user = await context.Users!.FindAsync(resetToken!.UserId);

        if (user == null)
        {
            throw new NotFoundException("User doesn't exist");
        }

        return new UserResetToken
        {
            ResetToken = resetToken,
            User = user
        };
    }

    private async Task<UserProfileModel> GetBasicUserProfileById(int userId)
    {
        var user = await context.Users!
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new NotFoundException("User doesn't exist");
        }

        var amountOfSubscriptions = await context.Follows!
            .Where(f => f.FollowerId == userId)
            .CountAsync();

        var followers = await context.Follows!
            .Where(f => f.UserId == userId)
            .CountAsync();

        return new UserProfileModel()
        {
            Username = user.Username,
            AmountofPoints = user.AmountOfPoints,
            AmountOfSubscriptions = amountOfSubscriptions,
            AmountOfFollowers = followers
        };
    }

    private static string GenerateToken()
    {
        var random = new Random();
        return random.Next(10000, 99999).ToString();
    }
}

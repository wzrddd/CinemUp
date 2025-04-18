namespace CinemUp.DAL.Entities;

public class User : BaseEntity
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string Username { get; set; }
    public int AmountOfPoints { get; set; }

    public ICollection<CommentReaction>? Reaction { get; set; } = [];
    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = [];
    public ICollection<Follow> FollowedBy { get; set; } = [];
    public ICollection<NotificationEntity> Notifications { get; set; } = [];
    public ICollection<Movie>? Movies { get; set; }
    public ICollection<UserMovieStatus>? UserMovieStatuses { get; set; }
    public ICollection<SharedList>? SharedLists { get; set; }
    public ICollection<Achievement> Achievements { get; set; } = [];
}

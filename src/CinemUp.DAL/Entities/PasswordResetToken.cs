namespace CinemUp.DAL.Entities;

public class PasswordResetToken : BaseEntity
{
    public required string Token { get; set; }
    public required int UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
}

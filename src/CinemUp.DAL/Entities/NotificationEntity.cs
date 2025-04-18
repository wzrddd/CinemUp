namespace CinemUp.DAL.Entities;

public class NotificationEntity : BaseEntity
{
    public int UserId { get; set; }
    public User? User { get; set; }
    public required string Message { get; set; }
}

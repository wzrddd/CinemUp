namespace CinemUp.BLL.Models.Users;

public class NotificationModel
{
    public int Id { get; set; }
    public required string Message { get; set; }
    public DateTime CreatedAt { get; set; }
}

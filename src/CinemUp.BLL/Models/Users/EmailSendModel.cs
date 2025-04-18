namespace CinemUp.BLL.Models.Users;

public class EmailSendModel
{
    public required string Email { get; set; }
    public required string Subject { get; set; }
    public required string Message { get; set; }
}

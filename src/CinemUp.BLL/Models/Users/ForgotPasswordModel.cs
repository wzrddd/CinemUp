namespace CinemUp.BLL.Models.Users;

public record ForgotPasswordModel
{
    public required string Email { get; init; }
}

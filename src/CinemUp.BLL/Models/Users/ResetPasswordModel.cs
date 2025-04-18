namespace CinemUp.BLL.Models.Users;

public record ResetPasswordModel
{
    public required string Code { get; init; }
    public required string NewPassword { get; init; }
}

namespace CinemUp.BLL.Models.Users;

public sealed record LoginUserModel
{
    public required string Email { get; init; }
    public required string Password { get; init; }
}

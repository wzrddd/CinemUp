namespace CinemUp.BLL.Models.Users;

public sealed record RegisterUserModel
{
    public string? Username { get; init; }
    public string? Email { get; init; }
    public string? Password { get; init; }
}

namespace CinemUp.BLL.Models.Users;

public record VerifyCodeModel
{
    public required string Code { get; init; }
}

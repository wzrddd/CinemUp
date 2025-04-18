using System.Security.Claims;

namespace CinemUp.Presentation.Extensions;

public static class ClaimsPrincipalExtension
{
    public static int GetUserId(this ClaimsPrincipal claimsPrincipal)
    {
        var userId = int.Parse(claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier)!);

        return userId;
    }
}

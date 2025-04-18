using CinemUp.DAL.Entities;

namespace CinemUp.BLL.Models.Users;

public class UserResetToken
{
    public PasswordResetToken? ResetToken { get; set; }
    public User? User { get; set; }
}

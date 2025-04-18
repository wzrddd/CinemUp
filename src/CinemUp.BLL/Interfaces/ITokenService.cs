using CinemUp.DAL.Entities;

namespace CinemUp.BLL.Interfaces;

public interface ITokenService
{
    string CreateToken(User user);
}

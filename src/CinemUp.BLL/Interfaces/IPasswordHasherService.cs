namespace CinemUp.BLL.Interfaces;

public interface IPasswordHasherService
{
    string Hash(string password);

    bool Verify(string passwordHash, string inputPassword);
}

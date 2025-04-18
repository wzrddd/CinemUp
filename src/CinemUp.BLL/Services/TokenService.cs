using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CinemUp.BLL.Interfaces;
using CinemUp.DAL.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CinemUp.BLL.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly SymmetricSecurityKey _key;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
        var tokenKey = _configuration["Token:Key"]
                       ?? Environment.GetEnvironmentVariable("JWT_TOKEN_KEY");

        if (string.IsNullOrEmpty(tokenKey))
        {
            throw new Exception("[ERROR] JWT Token Key is missing! Check user-secrets or environment variables.");
        }

        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
    }

    public string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new (ClaimTypes.Email, user.Email),
            new (ClaimTypes.Name, user.Username),
            new (ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);
        var tokenDescriptor = new SecurityTokenDescriptor()
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddDays(7),
            SigningCredentials = creds,
            Issuer = _configuration["Token:Issuer"]
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}

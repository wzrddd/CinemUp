using CinemUp.BLL.Models.Users;

namespace CinemUp.BLL.Models.Movies;

public class SharedListModel
{
    public int Id { get; set; }
    public int OwnerId { get; set; }
    public string? Name { get; set; }
    public bool IsOwner { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<UserProfileModel> Members { get; set; } = [];
    public List<MovieModel> Movies { get; set; } = [];
}

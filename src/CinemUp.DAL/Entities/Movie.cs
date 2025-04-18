namespace CinemUp.DAL.Entities;

public class Movie : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string ImageUri { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string>? Genres { get; set; }
    public string? ReleaseYear { get; set; }
    public ICollection<User>? Users { get; set; }
    public ICollection<UserMovieStatus>? UserMovieStatuses { get; set; }
    public ICollection<SharedList>? SharedLists { get; set; }
}

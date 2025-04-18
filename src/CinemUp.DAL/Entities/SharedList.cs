namespace CinemUp.DAL.Entities;

public class SharedList : BaseEntity
{
    public int OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public ICollection<Movie> Movies { get; set; } = [];
    public ICollection<User> Users { get; set; } = [];
}

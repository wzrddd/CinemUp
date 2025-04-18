namespace CinemUp.DAL.Entities;

public class Achievement : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int AmountOfPoints { get; set; }
    public ICollection<User> Users { get; set; } = [];
}

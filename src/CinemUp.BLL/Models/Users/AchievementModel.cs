namespace CinemUp.BLL.Models.Users;

public class AchievementModel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsAchieved { get; set; }
    public string Description { get; set; } = string.Empty;
    public int AmountOfPoints { get; set; }
    public bool IsNew { get; set; }
}

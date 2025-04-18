namespace CinemUp.DAL.Entities;

public class UserAchievement : BaseEntity
{
    public int UserId { get; set; }
    public int AchievementId { get; set; }
    public bool IsNew { get; set; } = true;
}

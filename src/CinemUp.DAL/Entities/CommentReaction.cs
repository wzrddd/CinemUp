namespace CinemUp.DAL.Entities;

public class CommentReaction : BaseEntity
{
    public User Users { get; set; } = null!;
    public int UserId { get; set; }
    public Comment Comments { get; set; } = null!;
    public int CommentId { get; set; }
    public bool IsLike { get; set; }
    public bool IsDislike { get; set; }
}

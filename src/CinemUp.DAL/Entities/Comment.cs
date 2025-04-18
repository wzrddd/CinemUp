namespace CinemUp.DAL.Entities;

public class Comment : BaseEntity
{
    public required string Content { get; set; }
    public ICollection<CommentReaction>? ReactionOfComment { get; set; } = [];
}

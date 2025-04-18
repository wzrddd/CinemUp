using CinemUp.DAL.Enums;

namespace CinemUp.DAL.Entities;

public class MovieReaction : BaseEntity
{
    public int UserId { get; set; }
    public int MovieId { get; set; }
    public MovieReactionTypes MovieReactionType { get; set; }
}

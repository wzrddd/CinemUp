using CinemUp.DAL.Enums;

namespace CinemUp.DAL.Entities;

public class UserMovieStatus : BaseEntity
{
    public int MovieId { get; set; }
    public int UserId { get; set; }
    public MovieStatus MovieStatus { get; set; }
}


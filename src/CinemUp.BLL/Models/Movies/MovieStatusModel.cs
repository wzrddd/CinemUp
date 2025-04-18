using CinemUp.DAL.Enums;

namespace CinemUp.BLL.Models.Movies;

public class MovieStatusModel
{
    public int Id { get; set; }
    public required MovieStatus MovieStatus { get; set; }
}

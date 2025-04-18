namespace CinemUp.DAL.Entities;

public class Follow : BaseEntity
{
    public int UserId { get; set; }
    public User? User { get; set; }
    public int FollowerId { get; set; }
    public User? Follower { get; set; }
}

public class ServiceResult
{
    public bool IsSuccess { get; }
    public string Error { get; }

    private ServiceResult(bool success, string error)
    {
        IsSuccess = success;
        Error = error;
    }

    public static ServiceResult Success() => new ServiceResult(true, string.Empty);
    public static ServiceResult Failure(string error) => new ServiceResult(false, error);
}

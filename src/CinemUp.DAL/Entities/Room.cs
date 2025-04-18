using System.Text.Json.Serialization;

namespace CinemUp.DAL.Entities;

public class Room
{
    public const int MaxUsers = 2;

    public string Code { get; set; } = string.Empty;
    public HashSet<int> ConnectedUsersIds { get; set; } = new();
    public Dictionary<int, List<int>> UserMoviesId { get; set; } = new();
    public HashSet<int> CompletedUsers { get; set; } = new();

    [JsonIgnore]
    public bool AllCompleted => CompletedUsers.Count == ConnectedUsersIds.Count
                                             && ConnectedUsersIds.Count == MaxUsers;
}

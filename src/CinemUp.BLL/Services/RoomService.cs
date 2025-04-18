using CinemUp.DAL.Entities;

namespace CinemUp.BLL.Services;

public class RoomService(RedisCacheService redisCacheService)
{
    private readonly Random _random = new();

    public async Task<Room> CreateRoomAsync()
    {
        var code = GenerateRoomCode();
        var room = new Room() { Code = code, };

        await redisCacheService.SetDataAsync($"room:{code}", room, TimeSpan.FromHours(1));

        return room;
    }

    public async Task<Room> GetRoomByCodeAsync(string code)
    {
        var room = await redisCacheService.GetDataAsync<Room>($"room:{code}");

        return room!;
    }

    public async Task<bool> AddUserToRoomAsync(string code, int userId)
    {
        var room = await GetRoomByCodeAsync(code);

        if (room.ConnectedUsersIds.Count >= Room.MaxUsers)
        {
            return false;
        }

        if (!room.ConnectedUsersIds.Contains(userId))
        {
            room.ConnectedUsersIds.Add(userId);
            await redisCacheService.SetDataAsync($"room:{code}", room, TimeSpan.FromHours(1));
        }

        return true;
    }

    public async Task AddUserLikedMovieAsync(string code, int userId, int movieId)
    {
        var room = await GetRoomByCodeAsync(code);

        if (!room.UserMoviesId.ContainsKey(userId))
        {
            room.UserMoviesId[userId] = new List<int>();
        }

        if (!room.UserMoviesId[userId].Contains(movieId))
        {
            room.UserMoviesId[userId].Add(movieId);
            await redisCacheService.SetDataAsync($"room:{code}", room, TimeSpan.FromHours(1));
        }
    }

    public async Task AddUserConnectionToRoomAsync(string connectionId, string roomCode, int userId)
    {
        await redisCacheService.SetDataAsync($"connection:{connectionId}:user", userId, TimeSpan.FromHours(1));
        await redisCacheService.SetDataAsync($"connection:{connectionId}:room", roomCode, TimeSpan.FromHours(1));
    }

    public async Task<int> GetUserByUserConnectionAsync(string connectionId)
    {
        var userId = await redisCacheService.GetDataAsync<int>($"connection:{connectionId}:user");

        return userId;
    }

    public async Task<string?> GetRoomCodeByUserConnectionAsync(string connectionId)
    {
        var roomCode = await redisCacheService.GetDataAsync<string>($"connection:{connectionId}:room");

        return roomCode;
    }

    public async Task RemoveUserConnectionAsync(string connectionId)
    {
        await redisCacheService.RemoveDataAsync($"connection:{connectionId}:user");
        await redisCacheService.RemoveDataAsync($"connection:{connectionId}:room");
    }

    public async Task<(bool allCompleted, List<int> matchedMovies)> MarkUserCompletedAsync(string roomCode, int userId)
    {
        var room = await GetRoomByCodeAsync(roomCode);

        room.CompletedUsers.Add(userId);
        await redisCacheService.SetDataAsync($"room:{roomCode}", room, TimeSpan.FromHours(1));

        var matched = new List<int>();

        if (room.AllCompleted)
        {
            matched = GetMatchedMovies(room);
        }

        return (room.AllCompleted, matched);
    }

    private static List<int> GetMatchedMovies(Room room)
    {
        if (room.ConnectedUsersIds.Count != Room.MaxUsers || room.UserMoviesId.Count != Room.MaxUsers)
        {
            return new List<int>();
        }

        var users = room.ConnectedUsersIds.ToArray();

        var userOne = users[0];
        var userTwo = users[1];

        var user1Likes = new HashSet<int>(room.UserMoviesId[userOne]);
        var user2Likes = new HashSet<int>(room.UserMoviesId[userTwo]);

        user1Likes.IntersectWith(user2Likes);

        return user1Likes.ToList();
    }

    private string GenerateRoomCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        return new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[_random.Next(s.Length)]).ToArray());
    }
}

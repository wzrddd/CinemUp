using CinemUp.BLL.Services;
using CinemUp.Presentation.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace CinemUp.Presentation.Hubs;

public class SwiperHub(RoomService roomService) : Hub
{
    [Authorize]
    public async Task CreateRoom()
    {
        var userId = Context.User!.GetUserId();
        var room = await roomService.CreateRoomAsync();

        await roomService.AddUserConnectionToRoomAsync(Context.ConnectionId, room.Code, userId);

        await roomService.AddUserToRoomAsync(room.Code, userId);
        await Groups.AddToGroupAsync(Context.ConnectionId, room.Code);

        await Clients.Caller.SendAsync("RoomCreated", room.Code);
    }

    [Authorize]
    public async Task JoinRoom(string roomCode)
    {
        var userId = Context.User!.GetUserId();
        var isJoinSuccess = await roomService.AddUserToRoomAsync(roomCode, userId);

        if (!isJoinSuccess)
        {
            await Clients.Caller.SendAsync("RoomJoinFailed", "Room is full");
            return;
        }

        await roomService.AddUserConnectionToRoomAsync(Context.ConnectionId, roomCode, userId);

        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

        await Clients.Group(roomCode).SendAsync("UserConnected", userId);
        await Clients.Caller.SendAsync("JoinedRoom", roomCode);
    }

    [Authorize]
    public async Task LikeMovie(int movieId)
    {
        var userId = Context.User!.GetUserId();
        var roomCode = await roomService.GetRoomCodeByUserConnectionAsync(Context.ConnectionId);

        if (roomCode == null)
        {
            await Clients.Caller.SendAsync("Error", "You're not in a room");
            return;
        }

        await roomService.AddUserLikedMovieAsync(roomCode, userId, movieId);
    }

    [Authorize]
    public async Task CompleteSwiping()
    {
        var userId = Context.User!.GetUserId();
        var roomCode = await roomService.GetRoomCodeByUserConnectionAsync(Context.ConnectionId);

        if (roomCode == null)
        {
            await Clients.Caller.SendAsync("Error", "You're not in a room");
            return;
        }

        var (allCompleted, matchedMovies) = await roomService.MarkUserCompletedAsync(roomCode, userId);

        await Clients.Group(roomCode).SendAsync("UserCompletedSwiping", userId);

        if (allCompleted)
        {
            await Clients.Group(roomCode).SendAsync("SwipingCompleted", matchedMovies);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = await roomService.GetUserByUserConnectionAsync(Context.ConnectionId);
        var roomCode = await roomService.GetRoomCodeByUserConnectionAsync(Context.ConnectionId);

        if (userId != 0 && roomCode != null)
        {
            await Clients.OthersInGroup(roomCode).SendAsync("UserDisconnected", userId);

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomCode);
        }

        await roomService.RemoveUserConnectionAsync(Context.ConnectionId);

        await base.OnDisconnectedAsync(exception);
    }
}

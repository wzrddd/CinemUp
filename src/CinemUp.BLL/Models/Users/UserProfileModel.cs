namespace CinemUp.BLL.Models.Users
{
    public record UserProfileModel
    {
        public int Id { get; set; }
        public required string Username { get; init; }
        public int AmountOfSubscriptions { get; init; }
        public int AmountOfFollowers { get; init; }
        public int AmountofPoints { get; set; }
        public bool IsFollowing { get; set; }
    }
}

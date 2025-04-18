namespace CinemUp.BLL.Constants;

public class Messages
{
    public const string FollowMessage = "Користувач {0} підписався на вас! 🎉";
    public const string PasswordResetSubject = "Код для відновлення паролю";
    public const string PasswordResetMessage =
        "Вітаємо!  \n\nЦе ваш код для відновлення паролю: {0}  \n\nНе передавайте цей код нікому " +
        "\n\nЯкщо ви не надсилали запит на відновлення паролю, будь ласка, ігноруйте цей лист або зверніться " +
        "до служби підтримки.  \n\nЗ повагою,  \nКоманда CinemUp\n";

    public const string AchievementMessage = "Ви отримали нове досягнення: {0} (+ {1} сінепоінтів)";
    public const string YoutubeTrailerLink = "https://www.youtube.com/watch?v={0}&si={1}";

    public const string SendCodeMessage =
        "Користувач {0} запросив вас до кімнати спільного підбору фільму. Ваш код: '{1}'." +
        " Він буде дійсний 1 годину";
}

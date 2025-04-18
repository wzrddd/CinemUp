namespace CinemUp.BLL.Models.Errors;

public class Error(int statusCode, string message, string? detailMessage = null)
{
    public int StatusCode { get; set; } = statusCode;
    public string Message { get; set; } = message;
    public string? DetailMessage { get; set; } = detailMessage;
}

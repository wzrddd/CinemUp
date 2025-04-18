using System.Net;
using System.Net.Mail;
using CinemUp.BLL.Exceptions;
using CinemUp.BLL.Models.Users;

namespace CinemUp.BLL.Services;

public class EmailSender
{
    public static void SendMail(EmailSendModel sendModel)
    {
        var mail = Environment.GetEnvironmentVariable("GMAIL_USER");
        var password = Environment.GetEnvironmentVariable("GMAIL_PASSWORD");

        if (mail == null || password == null)
        {
            throw new NotFoundException("No value found for environment variables GMAIL_USER or GMAIL_PASSWORD.");
        }

        var client = new SmtpClient("smtp.gmail.com", 587)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(mail, password)
        };

        client.SendMailAsync(
            new MailMessage(from: mail,
                to: sendModel.Email,
                sendModel.Subject,
                    sendModel.Message));
    }
}

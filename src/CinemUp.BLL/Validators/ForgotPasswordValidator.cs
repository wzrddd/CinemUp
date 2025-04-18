using CinemUp.BLL.Models.Users;
using FluentValidation;

namespace CinemUp.BLL.Validators;

public class ForgotPasswordValidator : AbstractValidator<ForgotPasswordModel>
{
    public ForgotPasswordValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required")
            .EmailAddress()
            .WithMessage("Invalid email format");
    }
}

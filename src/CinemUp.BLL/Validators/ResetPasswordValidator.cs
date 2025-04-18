﻿using CinemUp.BLL.Models.Users;
using FluentValidation;

namespace CinemUp.BLL.Validators;

public class ResetPasswordValidator : AbstractValidator<ResetPasswordModel>
{
    public ResetPasswordValidator()
    {
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .WithMessage("Password is required")
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters long")
            .Matches("[A-Z]")
            .WithMessage("Password must contain at least one uppercase letter")
            .Matches("[0-9]")
            .WithMessage("Password must contain at least one number");
    }
}

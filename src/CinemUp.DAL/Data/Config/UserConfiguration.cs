using CinemUp.DAL.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemUp.DAL.Data.Config;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder
            .HasIndex(u => new { u.Email, u.Username })
            .IsUnique();

        builder
            .Property(u => u.Email)
            .HasMaxLength(50);

        builder
            .Property(u => u.Password)
            .HasMaxLength(500);

        builder
            .Property(u => u.Username)
            .HasMaxLength(50);

        builder
            .HasMany(u => u.Notifications)
            .WithOne(f => f.User)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasMany(u => u.Movies)
            .WithMany(m => m.Users)
            .UsingEntity<UserMovieStatus>();
    }
}

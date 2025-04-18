using CinemUp.DAL.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemUp.DAL.Data.Config
{
    public class FollowConfiguration : IEntityTypeConfiguration<Follow>
    {
        public void Configure(EntityTypeBuilder<Follow> builder)
        {
            builder.ToTable("Follows");

            builder.HasKey(f => f.Id);

            builder.Property(f => f.UserId)
                .IsRequired();

            builder.Property(f => f.FollowerId)
                .IsRequired();

            builder.HasOne(f => f.User)
                .WithMany(u => u.FollowedBy)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(f => f.Follower)
                .WithMany()
                .HasForeignKey(f => f.FollowerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(f => new { f.UserId, f.FollowerId }).IsUnique();
        }
    }
}

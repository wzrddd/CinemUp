using CinemUp.DAL.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemUp.DAL.Data.Config;

public class CommentReactionConfiguration : IEntityTypeConfiguration<CommentReaction>
{
    public void Configure(EntityTypeBuilder<CommentReaction> builder)
    {
        builder
            .HasKey(k => k.Id);

        builder
             .HasOne(s => s.Comments)
             .WithMany(l => l.ReactionOfComment)
             .HasForeignKey(s => s.CommentId)
             .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(s => s.Users)
            .WithMany(l => l.Reaction)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

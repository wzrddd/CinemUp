using System.Reflection;
using CinemUp.DAL.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemUp.DAL.Data;

public class DataContext(DbContextOptions options) : DbContext(options)
{
    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new())
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e is { Entity: BaseEntity, State: EntityState.Added or EntityState.Modified });

        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }

            entity.UpdatedAt = DateTime.UtcNow;
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    public DbSet<User>? Users { get; set; }
    public DbSet<CommentReaction>? CommentReactions { get; set; }
    public DbSet<Comment>? Comments { get; set; }
    public DbSet<PasswordResetToken>? PasswordResetTokens { get; set; }
    public DbSet<MovieReaction>? MovieReactions { get; set; }
    public DbSet<Follow>? Follows { get; set; }
    public DbSet<NotificationEntity>? Notifications { get; set; }
    public DbSet<Movie>? Movies { get; set; }
    public DbSet<UserMovieStatus>? UserMovieStatuses { get; set; }
    public DbSet<SharedList>? SharedLists { get; set; }
    public DbSet<Achievement>? Achievements { get; set; }
    public DbSet<UserAchievement>? UserAchievements { get; set; }
}

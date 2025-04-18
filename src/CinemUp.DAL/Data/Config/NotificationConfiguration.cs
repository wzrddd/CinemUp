using CinemUp.DAL.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemUp.DAL.Data.Config;

public class NotificationConfiguration
{
    public static void Configure(EntityTypeBuilder<NotificationEntity> builder)
    {
        builder
            .Property(p => p.Message)
            .HasMaxLength(200);
    }
}

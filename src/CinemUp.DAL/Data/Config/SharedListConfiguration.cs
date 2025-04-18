using CinemUp.DAL.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemUp.DAL.Data.Config;

public class SharedListConfiguration : IEntityTypeConfiguration<SharedList>
{
    public void Configure(EntityTypeBuilder<SharedList> builder)
    {
        builder
            .HasMany(l => l.Movies)
            .WithMany(m => m.SharedLists);

        builder
            .HasMany(l => l.Users)
            .WithMany(u => u.SharedLists);
    }
}

using CinemUp.DAL.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CinemUp.DAL.Data.Config;

public class AchievementConfiguration : IEntityTypeConfiguration<Achievement>
{
    public void Configure(EntityTypeBuilder<Achievement> builder)
    {
        builder.HasData(
            new Achievement { Id = 1, Name = "🎞️ Поціновувач улюбленого", Description = "Додати 1 фільм в улюблені", AmountOfPoints = 5 },
            new Achievement { Id = 2, Name = "🎞️ Зародження смаку", Description = "Додати 3 фільми в улюблені", AmountOfPoints = 10 },
            new Achievement { Id = 3, Name = "🎞️ Кіноархіваріус", Description = "Додати 5 фільмів в улюблені", AmountOfPoints = 15 },
            new Achievement { Id = 4, Name = "🎞️ Збирач улюбленого", Description = "Додати 10 фільмів в улюблені", AmountOfPoints = 20 },
            new Achievement { Id = 5, Name = "🎞️ Кіноколекціонер", Description = "Додати 15 фільмів в улюблені", AmountOfPoints = 25 },

            new Achievement { Id = 6, Name = "🎬 Перший перегляд", Description = "Переглянути 1 фільм", AmountOfPoints = 5 },
            new Achievement { Id = 7, Name = "🎬 Кінопочатківець", Description = "Переглянути 3 фільми", AmountOfPoints = 10 },
            new Achievement { Id = 8, Name = "🎬 Кіноман-початківець", Description = "Переглянути 5 фільмів", AmountOfPoints = 15 },
            new Achievement { Id = 9, Name = "🎬 Серйозний глядач", Description = "Переглянути 10 фільмів", AmountOfPoints = 20 },
            new Achievement { Id = 10, Name = "🎬 Гуру переглядів", Description = "Переглянути 15 фільмів", AmountOfPoints = 25 },

            new Achievement { Id = 11, Name = "🤝 Новий знайомий", Description = "Додати 1 друга", AmountOfPoints = 5 },
            new Achievement { Id = 12, Name = "🤝 Коло друзів", Description = "Додати 3 друзів", AmountOfPoints = 10 },
            new Achievement { Id = 13, Name = "👥 Дружня компанія", Description = "Додати 5 друзів", AmountOfPoints = 15 },
            new Achievement { Id = 14, Name = "👥 Кінокомпанія", Description = "Додати 10 друзів", AmountOfPoints = 20 },
            new Achievement { Id = 15, Name = "👥 Кінотусовка", Description = "Додати 15 друзів", AmountOfPoints = 25 },

            new Achievement { Id = 16, Name = "📣 Перший фанат", Description = "На тебе підписалась 1 людина", AmountOfPoints = 5 },
            new Achievement { Id = 17, Name = "📣 Знайшов свого глядача", Description = "На тебе підписались 3 людини", AmountOfPoints = 10 },
            new Achievement { Id = 18, Name = "📣 Початківець-інфлюенсер", Description = "На тебе підписались 10 людей", AmountOfPoints = 15 },
            new Achievement { Id = 19, Name = "🌟 Помітна фігура", Description = "На тебе підписались 25 людей", AmountOfPoints = 25 },
            new Achievement { Id = 20, Name = "🌟 Кінозірка", Description = "На тебе підписались 50 людей", AmountOfPoints = 35 }
    );

        builder
            .HasMany(a => a.Users)
            .WithMany(u => u.Achievements)
            .UsingEntity<UserAchievement>();
    }
}

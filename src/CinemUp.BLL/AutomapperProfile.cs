using AutoMapper;
using CinemUp.BLL.Models.Comments;
using CinemUp.BLL.Models.Movies;
using CinemUp.BLL.Models.Tmdb;
using CinemUp.BLL.Models.Users;
using CinemUp.DAL.Entities;

namespace CinemUp.BLL;

public class AutomapperProfile : Profile
{
    public AutomapperProfile()
    {
        CreateMap<RegisterUserModel, User>()
            .ForMember(dest => dest.Password, opt => opt.Ignore());

        CreateMap<User, UserModel>()
            .ForMember(dest => dest.Token, opt => opt.Ignore());

        CreateMap<Comment, CommentModel>();
        CreateMap<CreateCommentModel, Comment>();
        CreateMap<TmdbMovieModel, MovieModel>();
        CreateMap<NotificationEntity, NotificationModel>();
        CreateMap<User, UserProfileModel>();
        CreateMap<TmdbMovieActor, MovieActor>();

        CreateMap<SharedList, SharedListModel>()
            .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.Users))
            .ForMember(dest => dest.Movies, opt => opt.MapFrom(src => src.Movies));

        CreateMap<Movie, MovieModel>()
            .ForMember(dest => dest.Genres,
                opt => opt.MapFrom(src =>
                    src.Genres != null
                        ? src.Genres.Select(g => new TmdbMovieGenres { Name = g }).ToList()
                        : new List<TmdbMovieGenres>()));

        CreateMap<MovieModel, Movie>()
            .ForMember(dest => dest.Genres,
                opt => opt.MapFrom(src =>
                    src.Genres != null
                        ? src.Genres.Select(g => g.Name).ToList()
                        : new List<string>()));

        CreateMap<TmdbProductionCountry, string>()
            .ConvertUsing(src => src.Name);
        CreateMap<TmdbCrewMember, string>()
            .ConvertUsing(src => src.Name);
    }
}

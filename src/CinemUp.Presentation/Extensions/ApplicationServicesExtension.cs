using System.Text;
using Azure.Storage.Blobs;
using CinemUp.BLL;
using CinemUp.BLL.Interfaces;
using CinemUp.BLL.Services;
using CinemUp.BLL.Validators;
using CinemUp.DAL.Data;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace CinemUp.Presentation.Extensions
{
    public static class ApplicationServicesExtension
    {
        public static void AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddControllers();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
            services.AddSignalR();

            services.AddCors(x => x.AddDefaultPolicy(options =>
                options
                    .WithOrigins("http://localhost:8081", "exp://192.168.1.10:8081")
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .AllowAnyHeader()));

            services.AddDbContext<DataContext>(
                opt =>
                {
                    var connectionString = Environment.GetEnvironmentVariable("POSTGRESQLCONNSTR_POSTGRESQL")
                                           ?? configuration.GetConnectionString("POSTGRESQL")
                                           ?? throw new Exception("DB string is not found");
                    opt.UseNpgsql(connectionString);
                });

            services.AddStackExchangeRedisCache(opt =>
            {
                var connectionString = Environment.GetEnvironmentVariable("REDISCACHECONNSTR_REDIS")
                                       ?? configuration.GetConnectionString("REDIS")
                                       ?? throw new Exception("Redis DB string is not found");
                opt.Configuration = connectionString;
                opt.InstanceName = "Movie_";
            });

            services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                {
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    var jwtTokenKey = configuration["Token:Key"]
                                      ?? Environment.GetEnvironmentVariable("JWT_TOKEN_KEY")
                                      ?? throw new Exception("JWT token key is not found");
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = configuration["Token:Issuer"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtTokenKey))
                    };

                    options.Events = new JwtBearerEvents()
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];

                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) &&
                                (path.StartsWithSegments("/api/Swiper")))
                            {
                                context.Token = accessToken;
                            }

                            return Task.CompletedTask;
                        }
                    };
                });

            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IPasswordHasherService, PasswordHasherService>();
            services.AddScoped<IBlobStorageService, AzureBlobStorageService>();
            services.AddScoped<UserService>();
            services.AddScoped<MovieService>();
            services.AddScoped<CommentService>();
            services.AddScoped<EmailSender>();
            services.AddScoped<TmdbService>();
            services.AddScoped<RedisCacheService>();
            services.AddScoped<NotificationService>();
            services.AddScoped<RoomService>();
            services.AddScoped<AchievementService>();

            services.AddSingleton(_ =>
                new BlobServiceClient(Environment.GetEnvironmentVariable("AZURE_STORAGE_CONNECTION_STRING")));

            services.AddHealthChecks();

            services.AddAutoMapper(typeof(AutomapperProfile));

            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssemblyContaining<RegisterUserValidator>();

            services.AddLogging(opt =>
            {
                opt.AddConsole();
            });
        }
    }
}

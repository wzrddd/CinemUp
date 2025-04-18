using System.Text.Json;
using CinemUp.BLL.Exceptions;
using CinemUp.BLL.Models.Errors;

namespace CinemUp.Presentation.Middlewares;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger,
    IHostEnvironment environment)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (NotFoundException e)
        {
            logger.LogError(e, "Resource not found");
            await context.Response.WriteAsync(GetProcessException(context, e, StatusCodes.Status404NotFound));
        }
        catch (BadRequestException e)
        {
            logger.LogError(e, "BadRequest");
            await context.Response.WriteAsync(GetProcessException(context, e, StatusCodes.Status400BadRequest));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Unhandled exception");
            await context.Response.WriteAsync(GetProcessException(context, e, StatusCodes.Status500InternalServerError
                , "Unknown error"));
        }
    }

    private string GetProcessException(HttpContext context, Exception e, int statusCode, string? customMessage = null)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = environment.IsDevelopment()
            ? new Error(context.Response.StatusCode, e.Message, e.StackTrace)
            : new Error(context.Response.StatusCode, customMessage ?? e.Message);

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        var jsonResponse = JsonSerializer.Serialize(response, options);

        return jsonResponse;
    }
}

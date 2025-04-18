using AutoMapper;
using CinemUp.BLL.Exceptions;
using CinemUp.BLL.Models.Comments;
using CinemUp.DAL.Data;
using CinemUp.DAL.Entities;

namespace CinemUp.BLL.Services;

public class CommentService(DataContext context, IMapper mapper)
{
    public async Task<CommentModel> AddCommentAsync(CreateCommentModel model)
    {
        var comment = mapper.Map<Comment>(model);

        await context.Comments.AddAsync(comment);
        await context.SaveChangesAsync();

        return mapper.Map<CommentModel>(comment);
    }

    public async Task DeleteCommentAsync(int id)
    {
        var comment = await context.Comments.FindAsync(id);

        if (comment == null)
        {
            throw new NotFoundException("Comment not found");
        }

        context.Comments.Remove(comment);
        await context.SaveChangesAsync();
    }

    public async Task<CommentModel> UpdateCommentAsync(UpdateCommentModel model)
    {
        var comment = await context.Comments.FindAsync(model.Id);

        if (comment == null)
        {
            throw new NotFoundException("Comment not found");
        }

        comment.Content = model.Content;
        await context.SaveChangesAsync();

        return mapper.Map<CommentModel>(comment);
    }

    public async Task LikeCommentAsync(int id, int userId)
    {
        var comment = await context.Comments.FindAsync(id);

        if (comment == null)
        {
            throw new NotFoundException("Comment not found");
        }

        var like = new CommentReaction()
        {
            UserId = userId,
            CommentId = comment.Id,
            IsLike = true,
            IsDislike = false
        };

        await context.AddAsync(like);
        await context.SaveChangesAsync();
    }

    public async Task DislikeCommentAsync(int id, int userId)
    {
        var comment = await context.Comments.FindAsync(id);

        if (comment == null)
        {
            throw new NotFoundException("Comment not found");
        }

        var like = new CommentReaction()
        {
            UserId = userId,
            CommentId = comment.Id,
            IsLike = false,
            IsDislike = true
        };

        await context.AddAsync(like);
        await context.SaveChangesAsync();
    }
}

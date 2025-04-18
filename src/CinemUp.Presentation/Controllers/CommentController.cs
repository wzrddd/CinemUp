using CinemUp.BLL.Models.Comments;
using CinemUp.BLL.Services;
using CinemUp.Presentation.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace CinemUp.Presentation.Controllers;

public class CommentController(CommentService commentService, UserService userService) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<CommentModel>> CreateComment(CreateCommentModel model)
    {
        return await commentService.AddCommentAsync(model);
    }

    [ApiExplorerSettings(IgnoreApi = true)]
    [HttpPost("like-comment")]
    public async Task<ActionResult> LikeComment([FromBody] int id)
    {
        var userId = User.GetUserId();
        await commentService.LikeCommentAsync(id, userId);

        return Ok();
    }

    [ApiExplorerSettings(IgnoreApi = true)]
    [HttpPost("dislike-comment")]
    public async Task<ActionResult> DislikeComment([FromBody] int id)
    {
        var userId = User.GetUserId();
        await commentService.DislikeCommentAsync(id, userId);

        return Ok();
    }

    [HttpDelete]
    public async Task<ActionResult> DeleteComment([FromBody] int id)
    {
        await commentService.DeleteCommentAsync(id);

        return NoContent();
    }

    [HttpPut]
    public async Task<ActionResult<CommentModel>> UpdateComment(UpdateCommentModel model)
    {
        return Ok(await commentService.UpdateCommentAsync(model));
    }
}

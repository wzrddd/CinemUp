﻿namespace CinemUp.BLL.Models.Comments;

public class CommentModel
{
    public int Id { get; set; }
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
}

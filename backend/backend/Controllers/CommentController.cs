using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentController : Controller
    {
        private readonly ICommentService _commentService;

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpGet("comments/{trackId}")]
        public async Task<IActionResult> GetCommentByTrackId(string trackId)
        {
            var result = await _commentService.GetCommentsByTrackIdAsync(trackId);
            return Ok(result);
        }

        [Authorize]
        [HttpPost("comments")]
        public async Task<IActionResult> AddComment([FromBody]AddCommentRequest addCommentRequest)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Unauthorized("Không có ID trong token !");
            }

            Comments comment = new Comments
            {
                UserId = userId,
                TrackId = addCommentRequest.TrackId,
                Content = addCommentRequest.Content,
                CreatedAt = DateTime.UtcNow
            };

            await _commentService.CreateAsync(comment);
            return Ok("Thành công");
        }

        [Authorize]
        [HttpDelete("delete-comment/{commentId}")]
        public async Task<IActionResult> DeleteComment(string commentId)
        {
            await _commentService.DeleteAsync(commentId);
            return Ok("Đã xóa");
        }
    }

    public class CommentDetail
    {
        public string CommentId { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string ImageBase64 { get; set; }
        public string Contents { get; set; }
        public DateTime CreateAt { get; set; }
    }

    public class AddCommentRequest
    {
        public string TrackId { get; set; }
        public string Content { get; set; }
    }
}

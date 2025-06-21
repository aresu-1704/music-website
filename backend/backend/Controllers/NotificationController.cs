using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : Controller
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("my-notification/{id}")]
        public async Task<IActionResult> GetUserNotification(string id)
        {
            var notifications = await _notificationService.GetByReceiverId(id);
            return Ok(notifications);
        }

        [HttpPut("mark-viewed/{id}")]
        public async Task<IActionResult> DeleteUserNotification(string id)
        {
            await _notificationService.MarkAsViewed(id);
            return Ok("Thành công");
        }
    }

    public class NotificationDto
    {
        public string Id { get; set; }
        public string ReceiverId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public bool IsViewed { get; set; }
        public DateTime CreateAt { get; set; }
    }
}

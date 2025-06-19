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

        [HttpGet("my_notification/{id}")]
        public async Task<IActionResult> GetUserNotification(string id)
        {
            var notifications = await _notificationService.GetByReceiverId(id);
            return Ok(notifications);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUserNotification(string id)
        {
            await _notificationService.DeleteAllOfReceiver(id);
            return Ok("Đã xóa");
        }
    }
}

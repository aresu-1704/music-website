using backend.Controllers;
using backend.Interfaces;
using backend.Models;
using backend.DTOs;


namespace backend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repository;

        public NotificationService(INotificationRepository repository)
        {
            _repository = repository;
        }

        public async Task SendNotification(List<string> receiverIds, string title, string content)
        {
            var notifications = receiverIds.Select(id => new Notifications
            {
                ReceiverId = id,
                Title = title,
                Content = content,
                IsViewed = false,
                CreateAt = DateTime.UtcNow
            }).ToList();

            await _repository.CreateAsync(notifications);
        }

        public async Task<List<NotificationDto>> GetByReceiverId(string receiverId)
        {
            var list = await _repository.GetByReceiverIdAsync(receiverId);

            return list.Select(n => new NotificationDto
            {
                Id = n.Id.ToString(),
                ReceiverId = n.ReceiverId,
                Title = n.Title,
                Content = n.Content,
                IsViewed = n.IsViewed,
                CreateAt = n.CreateAt
            }).ToList();
        }


        public async Task MarkAsViewed(string id)
        {
            await _repository.MarkAsViewedAsync(id);
        }

        public async Task DeleteAllOfReceiver(string receiverId)
        {
            var notifications = await _repository.GetByReceiverIdAsync(receiverId);
            var tasks = notifications.Select(n => _repository.DeleteAsync(n.Id));
            await Task.WhenAll(tasks);
        }
    }
}

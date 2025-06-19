using backend.Interfaces;
using backend.Models;

namespace backend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repository;

        public NotificationService(INotificationRepository repository)
        {
            _repository = repository;
        }

        public async Task SendNotification(string receiverId, string title, string content)
        {
            var notification = new Notifications
            {
                ReceiverId = receiverId,
                Title = title,
                Content = content,
                IsViewed = false,
                CreateAt = DateTime.UtcNow
            };

            await _repository.CreateAsync(notification);
        }

        public async Task<List<Notifications>> GetByReceiverId(string receiverId)
        {
            return await _repository.GetByReceiverIdAsync(receiverId);
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

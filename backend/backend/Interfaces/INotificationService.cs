using backend.Models;

namespace backend.Interfaces
{
    public interface INotificationService
    {
        Task SendNotification(string receiverId, string title, string content);
        Task<List<Notifications>> GetByReceiverId(string receiverId);
        Task MarkAsViewed(string id);
        Task DeleteAllOfReceiver(string receiverId);
    }
}

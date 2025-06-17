using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IHistoryService
    {
        Task<IEnumerable<Histories>> GetUserHistoriesAsync(string userId);
        Task<Histories> GetHistoryAsync(string userId, string trackId);
        Task UpdatePlayHistoryAsync(string userId, string trackId);
        Task DeleteHistoryAsync(string userId, string trackId);
    }
}

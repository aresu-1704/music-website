using backend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IHistoryRepository
    {
        Task<IEnumerable<Histories>> GetAllAsync();
        Task<Histories> GetByIdAsync(string userId, string trackId);
        Task<IEnumerable<Histories>> GetByUserIdAsync(string userId);
        Task AddOrUpdateAsync(Histories history);
        Task DeleteAsync(string userId, string trackId);
    }
}

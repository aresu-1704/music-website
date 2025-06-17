using backend.Interfaces;
using backend.Models;
using backend.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public class HistoryService : IHistoryService
    {
        private readonly IHistoryRepository _historyRepository;

        public HistoryService(IHistoryRepository historyRepository)
        {
            _historyRepository = historyRepository;
        }

        public async Task<IEnumerable<Histories>> GetUserHistoriesAsync(string userId)
        {
            return await _historyRepository.GetByUserIdAsync(userId);
        }

        public async Task<Histories> GetHistoryAsync(string userId, string trackId)
        {
            return await _historyRepository.GetByIdAsync(userId, trackId);
        }

        public async Task UpdatePlayHistoryAsync(string userId, string trackId)
        {
            var history = new Histories
            {
                UserId = userId,
                TrackId = trackId,
                LastPlay = DateTime.UtcNow
            };

            await _historyRepository.AddOrUpdateAsync(history);
        }

        public async Task DeleteHistoryAsync(string userId, string trackId)
        {
            await _historyRepository.DeleteAsync(userId, trackId);
        }
    }
}

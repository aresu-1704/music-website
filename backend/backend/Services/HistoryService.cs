using backend.Controllers;
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
        private readonly ITrackRepository _trackRepository;

        public HistoryService(IHistoryRepository historyRepository, ITrackRepository trackRepository)
        {
            _historyRepository = historyRepository;
            _trackRepository = trackRepository;
        }

        public async Task<IEnumerable<HistoryTrackResponse>> GetUserHistoriesAsync(string userId)
        {

            var historyList = await _historyRepository.GetByUserIdAsync(userId);
            List<HistoryTrackResponse> tracks = new List<HistoryTrackResponse>();
            foreach (var history in historyList)
            {
                var track = await _trackRepository.GetByIdAsync(history.TrackId);
                
                tracks.Add(new HistoryTrackResponse
                {
                    trackId = track.Id,
                    title = track.Title,
                    isPublic = track.IsPublic,
                    lastPlay = history.LastPlay
                });
            }
            return tracks;
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

        public async Task DeleteAll(string userId)
        {
            await _historyRepository.DeleteAllAsync(userId);    
        }
    }
}

using backend.Interfaces;
using backend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public class FavoritesService : IFavoritesService
    {
        private readonly IFavoritesRepository _favoritesRepository;
        private readonly ITrackRepository _trackRepository;

        public FavoritesService(IFavoritesRepository favoritesRepository, ITrackRepository trackRepository)
        {
            _favoritesRepository = favoritesRepository;
            _trackRepository = trackRepository;
        }

        public async Task<bool> ToggleFavoriteAsync(string userId, string trackId)
        {
            var isFavorited = await _favoritesRepository.IsFavoriteAsync(userId, trackId);

            if (isFavorited)
            {
                await _favoritesRepository.RemoveFavoriteAsync(userId, trackId);
                await _trackRepository.DecreaseLikeCountAsync(trackId);
                return false;
            }
            else
            {
                var favorite = new Favorites
                {
                    UserId = userId,
                    TrackId = trackId
                };

                await _favoritesRepository.AddFavoriteAsync(favorite);
                await _trackRepository.IncreaseLikeCountAsync(trackId);
                return true; // đã like
            }
        }

        public async Task<List<string>> GetFavoriteTrackIdsByUserAsync(string userId)
        {
            return await _favoritesRepository.GetFavoriteTrackIdsByUserAsync(userId);
        }

        public async Task<bool> IsTrackFavoritedAsync(string userId, string trackId)
        {
            return await _favoritesRepository.IsFavoriteAsync(userId, trackId);
        }

        public async Task<int> GetTrackFavoriteCountAsync(string trackId)
        {
            return await _favoritesRepository.GetFavoriteCountByTrackAsync(trackId);
        }
    }
}

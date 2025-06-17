using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IFavoritesService
    {
        Task<bool> ToggleFavoriteAsync(string userId, string trackId);
        Task<List<string>> GetFavoriteTrackIdsByUserAsync(string userId);
        Task<bool> IsTrackFavoritedAsync(string userId, string trackId);
        Task<int> GetTrackFavoriteCountAsync(string trackId);
    }
}

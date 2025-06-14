using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface ITrackRepository
    {
        Task<List<Track>> GetAllAsync();
        Task<Track?> GetByIdAsync(string id);
        Task<List<Track>> GetByArtistIdAsync(string artistId);
        Task<List<Track>> SearchByTitleAsync(string keyword);
        Task CreateAsync(Track track);
        Task UpdateAsync(string id, Track track);
        Task<bool> DeleteAsync(string id);
        Task IncrementPlayCountAsync(string id);
        Task IncrementLikeCountAsync(string id);
    }
}

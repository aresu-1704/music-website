using backend.Controllers;
using backend.Models;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface ITrackService
    {
        Task<Track> UploadTrackAsync(
            IFormFile file,
            string title,
            string? artistId,
            string[]? genre,
            string? cover
        );
        Task<Track?> GetByIdAsync(string id);
        Task<List<TrackThumbnail>> GetTopPlayedThumbnailsAsync(int limit = 20);
        Task<List<TrackThumbnail>> GetTopLikeThumbnailsAsync(int limit = 20);
        Task<TrackMusic> GetMusicByIdAsync(string id);
        Task<string> UpdatePlayCount(string id);
        Task<TrackInfo> GetTrackInfo(string id);

    }
}

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
            string? album,
            string[]? genre,
            string? cover
        );

        Task<Track?> GetByIdAsync(string id);
    }
}

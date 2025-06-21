using backend.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Controllers;

namespace backend.Interfaces
{
    public interface ITrackRepository
    {
        Task<List<Track>> GetAllAsync();
        Task<Track?> GetByIdAsync(string id);
        Task<List<Track>> GetByArtistIdAsync(string artistId);
        Task<List<Track>> SearchByTitleAsync(string keyword);
        Task<List<Track>> SearchByTitleOrArtistAsync(string keyword);
        Task CreateAsync(Track track);
        Task UpdateAsync(string id, Track track);
        Task<bool> DeleteAsync(string id);
        Task IncrementPlayCountAsync(string id);
        Task IncrementLikeCountAsync(string id);
        Task<List<Track>> GetTopPlayedTracksAsync(int limit = 20);
        Task<List<Track>> GetTopLikeTracksAsync(int limit = 20);
        Task IncreaseLikeCountAsync(string trackId);
        Task DecreaseLikeCountAsync(string trackId);
        Task<List<Track>> GetPublicApprovedTracksByArtistIdAsync(string artistId);
        Task<List<Track>> GetApprovedTracksByArtistIdAsync(string artistId);
    }
}

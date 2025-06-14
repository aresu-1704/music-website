using backend.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Interfaces;

namespace backend.Repositories
{
    public class ArtistRepository : IArtistRepository
    {
        private readonly IMongoCollection<Artists> _artists;

        public ArtistRepository(IMongoDatabase database)
        {
            _artists = database.GetCollection<Artists>("artists");
        }

        public async Task<IEnumerable<Artists>> GetAllAsync()
        {
            return await _artists.Find(_ => true).ToListAsync();
        }

        public async Task<Artists> GetByIdAsync(string id)
        {
            return await _artists.Find(a => a.Id == id).FirstOrDefaultAsync();
        }

        public async Task<Artists> GetByUserIdAsync(string userId)
        {
            return await _artists.Find(a => a.UserId == userId).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(Artists artist)
        {
            artist.CreatedAt = DateTime.UtcNow;
            artist.UpdatedAt = DateTime.UtcNow;
            await _artists.InsertOneAsync(artist);
        }

        public async Task UpdateAsync(string id, Artists artist)
        {
            artist.UpdatedAt = DateTime.UtcNow;
            await _artists.ReplaceOneAsync(a => a.Id == id, artist);
        }

        public async Task DeleteAsync(string id)
        {
            await _artists.DeleteOneAsync(a => a.Id == id);
        }

        public async Task ApproveAsync(string id, bool isApproved)
        {
            var update = Builders<Artists>.Update
                .Set(a => a.IsApproved, isApproved)
                .Set(a => a.UpdatedAt, DateTime.UtcNow);

            await _artists.UpdateOneAsync(a => a.Id == id, update);
        }
    }
}

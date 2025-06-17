using backend.Interfaces;
using backend.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Repositories
{
    public class HistoryRepository : IHistoryRepository
    {
        private readonly IMongoCollection<Histories> _collection;

        public HistoryRepository(IMongoDatabase database)
        {
            _collection = database.GetCollection<Histories>("histories");
        }

        public async Task<IEnumerable<Histories>> GetAllAsync()
        {
            return await _collection.Find(_ => true).ToListAsync();
        }

        public async Task<Histories> GetByIdAsync(string userId, string trackId)
        {
            var id = $"{userId}_{trackId}";
            return await _collection.Find(h => h.Id == id).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Histories>> GetByUserIdAsync(string userId)
        {
            return await _collection.Find(h => h.UserId == userId).ToListAsync();
        }

        public async Task AddOrUpdateAsync(Histories history)
        {
            var filter = Builders<Histories>.Filter.Eq(h => h.Id, history.Id);
            var update = Builders<Histories>.Update
                .Set(h => h.LastPlay, history.LastPlay)
                .SetOnInsert(h => h.UserId, history.UserId)
                .SetOnInsert(h => h.TrackId, history.TrackId);

            await _collection.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
        }

        public async Task DeleteAsync(string userId, string trackId)
        {
            var id = $"{userId}_{trackId}";
            await _collection.DeleteOneAsync(h => h.Id == id);
        }
    }
}

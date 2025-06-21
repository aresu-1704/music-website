using backend.Interfaces;
using backend.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Repositories
{
    public class TrackRepository : ITrackRepository
    {
        private readonly IMongoCollection<Track> _tracks;

        public TrackRepository(IMongoDatabase database)
        {
            _tracks = database.GetCollection<Track>("tracks");
        }

        public async Task<List<Track>> GetAllAsync() =>
            await _tracks.Find(_ => true).ToListAsync();

        public async Task<Track?> GetByIdAsync(string id) =>
            await _tracks.Find(t => t.Id == id).FirstOrDefaultAsync();

        public async Task<List<Track>> GetByArtistIdAsync(string artistId)
        {
            var filter = Builders<Track>.Filter.And(
                Builders<Track>.Filter.Eq(t => t.ArtistId, artistId),
                Builders<Track>.Filter.Eq(t => t.IsApproved, true)
            );
            return await _tracks.Find(filter).ToListAsync();
        }

        public async Task<List<Track>> SearchByTitleAsync(string keyword) =>
            await _tracks.Find(t => t.Title.ToLower().Contains(keyword.ToLower())).ToListAsync();

        public async Task CreateAsync(Track track) =>
            await _tracks.InsertOneAsync(track);

        public async Task UpdateAsync(string id, Track track) =>
            await _tracks.ReplaceOneAsync(t => t.Id == id, track);

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _tracks.DeleteOneAsync(t => t.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task IncrementPlayCountAsync(string id)
        {
            var update = Builders<Track>.Update.Inc(t => t.PlayCount, 1);
            await _tracks.UpdateOneAsync(t => t.Id == id, update);
        }

        public async Task IncrementLikeCountAsync(string id)
        {
            var update = Builders<Track>.Update.Inc(t => t.LikeCount, 1);
            await _tracks.UpdateOneAsync(t => t.Id == id, update);
        }

        public async Task<List<Track>> GetTopPlayedTracksAsync(int limit = 20)
        {
            var filter = Builders<Track>.Filter.Eq(t => t.IsApproved, true);
            var sort = Builders<Track>.Sort.Descending(t => t.PlayCount);
            return await _tracks.Find(_ => true)
                                .Sort(sort)
                                .Limit(limit)
                                .ToListAsync();
        }

        public async Task<List<Track>> GetTopLikeTracksAsync(int limit = 20)
        {
            var filter = Builders<Track>.Filter.Eq(t => t.IsApproved, true);
            var sort = Builders<Track>.Sort.Descending(t => t.LikeCount);
            return await _tracks.Find(_ => true)
                                .Sort(sort)
                                .Limit(limit)
                                .ToListAsync();
        }

        public async Task IncreaseLikeCountAsync(string trackId)
        {
            var filter = Builders<Track>.Filter.Eq(t => t.Id, trackId);
            var update = Builders<Track>.Update.Inc(t => t.LikeCount, 1);
            await _tracks.UpdateOneAsync(filter, update);
        }

        public async Task DecreaseLikeCountAsync(string trackId)
        {
            var filter = Builders<Track>.Filter.Eq(t => t.Id, trackId);
            var update = Builders<Track>.Update.Inc(t => t.LikeCount, -1);
            await _tracks.UpdateOneAsync(filter, update);
        }

        public async Task<List<Track>> SearchByTitleOrArtistAsync(string keyword)
        {
            var lowerKeyword = keyword.ToLower();
            var filter = Builders<Track>.Filter.Or(
                Builders<Track>.Filter.Regex(t => t.Title, new MongoDB.Bson.BsonRegularExpression(lowerKeyword, "i")),
                Builders<Track>.Filter.Regex(t => t.ArtistId, new MongoDB.Bson.BsonRegularExpression(lowerKeyword, "i"))
            );
            return await _tracks.Find(filter).ToListAsync();
        }

        public async Task<List<Track>> GetPublicApprovedTracksByArtistIdAsync(string artistId)
        {
            var filter = Builders<Track>.Filter.And(
                Builders<Track>.Filter.Eq(t => t.ArtistId, artistId),
                Builders<Track>.Filter.Eq(t => t.IsPublic, true),
                Builders<Track>.Filter.Eq(t => t.IsApproved, true)
            );
            return await _tracks.Find(filter).ToListAsync();
        }

        public async Task<List<Track>> GetApprovedTracksByArtistIdAsync(string artistId)
        {
            var filter = Builders<Track>.Filter.And(
                Builders<Track>.Filter.Eq(t => t.ArtistId, artistId),
                Builders<Track>.Filter.Eq(t => t.IsApproved, true)
            );
            return await _tracks.Find(filter).ToListAsync();
        }
    }
}

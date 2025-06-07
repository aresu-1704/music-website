using backend.Interfaces;
using backend.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IMongoCollection<Users> _usersCollection;

        public UserRepository(IMongoDatabase database)
        {
            _usersCollection = database.GetCollection<Users>("users");
        }

        public async Task<List<Users>> GetAllAsync()
        {
            return await _usersCollection.Find(_ =>  true).ToListAsync();
        }

        public async Task<Users> GetByIdAsync(string id)
        {
            return await _usersCollection.Find(u => u.Id == id).FirstOrDefaultAsync();
        }

        public async Task<Users> GetByUsernameAsync(string username)
        {
            return await _usersCollection.Find(u => u.Username == username).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(Users user)
        {
            await _usersCollection.InsertOneAsync(user);
        }

        public async Task UpdateAsync(string id, Users user)
        {
            await _usersCollection.ReplaceOneAsync(u => u.Id == id, user);
        }

        public async Task DeleteAsync(string id)
        {
            await _usersCollection.DeleteOneAsync(u => u.Id == id);
        }
    }
}

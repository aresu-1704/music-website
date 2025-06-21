using backend.Interfaces;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace backend.Services
{
    public class FollowersService : IFollowersService
    {
        private readonly IFollowersRepository _followersRepository;
        public FollowersService(IFollowersRepository followersRepository)
        {
            _followersRepository = followersRepository;
        }
        public async Task FollowAsync(string followerId, string followingId)
        {
            await _followersRepository.FollowAsync(followerId, followingId);
        }
        public async Task UnfollowAsync(string followerId, string followingId)
        {
            await _followersRepository.UnfollowAsync(followerId, followingId);
        }
        public async Task<bool> IsFollowingAsync(string followerId, string followingId)
        {
            return await _followersRepository.IsFollowingAsync(followerId, followingId);
        }
        public async Task<List<string>> GetFollowingListAsync(string followerId)
        {
            return await _followersRepository.GetFollowingListAsync(followerId);
        }
    }
} 
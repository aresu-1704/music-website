using backend.Interfaces;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace backend.Services
{
    public class FollowersService : IFollowersService
    {
        private readonly IFollowersRepository _followersRepository;
        private readonly IUsersService _usersService;
        public FollowersService(IFollowersRepository followersRepository, IUsersService usersService)
        {
            _followersRepository = followersRepository;
            _usersService = usersService;
        }
        public async Task FollowAsync(string followerId, string followingId)
        {
            await _usersService.UpdateFollowCount(followerId, 1);
            await _followersRepository.FollowAsync(followerId, followingId);
        }
        public async Task UnfollowAsync(string followerId, string followingId)
        {
            await _usersService.UpdateFollowCount(followerId, -1);
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
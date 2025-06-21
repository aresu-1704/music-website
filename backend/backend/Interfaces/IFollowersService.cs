using System.Threading.Tasks;
using System.Collections.Generic;

namespace backend.Interfaces
{
    public interface IFollowersService
    {
        Task FollowAsync(string followerId, string followingId);
        Task UnfollowAsync(string followerId, string followingId);
        Task<bool> IsFollowingAsync(string followerId, string followingId);
        Task<List<string>> GetFollowingListAsync(string followerId);
    }
} 
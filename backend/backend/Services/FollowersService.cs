using backend.Interfaces;
using backend.Controllers;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace backend.Services
{
    public class FollowersService : IFollowersService
    {
        private readonly IFollowersRepository _followersRepository;
        private readonly IUserRepository _usersRepository;

        public FollowersService(IFollowersRepository followersRepository, IUserRepository usersRepository)
        {
            _followersRepository = followersRepository;
            _usersRepository = usersRepository;
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

        public async Task<List<FollowingDetailsResponse>> GetFollowingDetailsListAsync(string followerId)
        {
            var followingIds = await _followersRepository.GetFollowingListAsync(followerId);
            var followingDetails = new List<FollowingDetailsResponse>();

            foreach (var followingId in followingIds)
            {
                var user = await _usersRepository.GetByIdAsync(followingId);
                if (user != null)
                {
                    string avatarUrl = null;
                    if (!string.IsNullOrEmpty(user.AvatarUrl))
                    {
                        try
                        {
                            var imageBytes = await System.IO.File.ReadAllBytesAsync(user.AvatarUrl);
                            avatarUrl = $"data:image/jpeg;base64,{System.Convert.ToBase64String(imageBytes)}";
                        }
                        catch
                        {
                            avatarUrl = null;
                        }
                    }

                    followingDetails.Add(new FollowingDetailsResponse
                    {
                        FollowingId = user.Id,
                        FollowingName = user.Name,
                        FollowingEmail = user.Email,
                        FollowingAvatar = avatarUrl,
                        FollowingRole = user.Role,
                        FollowingGender = user.Gender,
                        FollowingDateOfBirth = user.DateOfBirth,
                        IsFollowing = true // Vì đây là danh sách đang theo dõi
                    });
                }
            }

            return followingDetails;
        }
    }
} 
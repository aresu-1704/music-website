using backend.Interfaces;
using backend.Models;
using backend.Repositories;
using System;
using System.Threading.Tasks;

namespace backend.Services
{
    public class ArtistService : IArtistService
    {
        private readonly IArtistRepository _artistRepository;
        private readonly IUserRepository _userRepository;
        public ArtistService(IArtistRepository artistRepository, IUserRepository userRepository)
        {
            _artistRepository = artistRepository;
            _userRepository = userRepository;
        }

        public async Task<string> CreateArtistAsync(string userId, Artists artist)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return "UserId is required.";
            }

            var existing = await _artistRepository.GetByUserIdAsync(userId);
            if (existing != null)
            {
                return "Artist already exists for this user.";
            }

            artist.UserId = userId;
            artist.CreatedAt = DateTime.UtcNow;
            artist.UpdatedAt = DateTime.UtcNow;
            artist.IsApproved = false;

            var user = await _userRepository.GetByIdAsync(userId);
            if (user != null)
            {
                user.Role = "ArtistWaitApprove";
                await _userRepository.UpdateAsync(userId, user);
            }

            await _artistRepository.CreateAsync(artist);
            return "Success.";
        }

        public async Task<string> CheckApproveResult(string userId)
        {
            var artist = await _artistRepository.GetByUserIdAsync(userId);
            if (artist != null)
            {
                if (artist.IsApproved)
                {
                    return "Đã được duyệt";
                }
                else
                {
                    return "Chưa được duyệt";
                }
            }
            return "Không tồn tại";
        }

        public async Task<bool> CancelRegister(string userId)
        {
            try
            {
                await _artistRepository.DeleteByUserIdAsync(userId);
                return true;
            }
            catch (Exception ex) {
                return false;
            }
        }
    }
}

using backend.Controllers;
using backend.Interfaces;
using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IUserRepository _userRepository;

        public CommentService(ICommentRepository commentRepository, IUserRepository userRepository)
        {
            _commentRepository = commentRepository;
            _userRepository = userRepository;
        }

        public async Task<List<CommentDetail>> GetCommentsByTrackIdAsync(string trackId)
        {
            var comments = await _commentRepository.GetCommentsByTrackIdAsync(trackId);
            List<CommentDetail> result = new List<CommentDetail>();
            foreach (var comment in comments)
            {
                var user = await _userRepository.GetByIdAsync(comment.UserId);
                string? avatarBase64 = null;
                if (user != null)
                {
                    if (!string.IsNullOrEmpty(user.AvatarUrl))
                    {
                        try
                        {
                            byte[] imageBytes = await System.IO.File.ReadAllBytesAsync(user.AvatarUrl);
                            avatarBase64 = Convert.ToBase64String(imageBytes);
                            avatarBase64 = $"data:image/jpeg;base64,{avatarBase64}";
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Lỗi khi đọc ảnh: {ex.Message}");
                            avatarBase64 = null;
                        }
                    }
                }

                result.Add(new CommentDetail
                {
                    CommentId = comment.Id,
                    UserName = user.Name,
                    UserId = user.Id,
                    Contents = comment.Content,
                    CreateAt = comment.CreatedAt,
                    ImageBase64 = avatarBase64
                });
            }
            return result;
        }

        public async Task<Comments> GetByIdAsync(string id)
        {
            return await _commentRepository.GetByIdAsync(id);
        }

        public async Task CreateAsync(Comments comment)
        {
            await _commentRepository.CreateAsync(comment);
        }

        public async Task UpdateAsync(string id, Comments updatedComment)
        {
            await _commentRepository.UpdateAsync(id, updatedComment);
        }

        public async Task DeleteAsync(string id)
        {
            await _commentRepository.DeleteAsync(id);
        }
    }
}

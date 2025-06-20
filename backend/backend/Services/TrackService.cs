using backend.Controllers;
using backend.Interfaces;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Services
{
    public class TrackService : ITrackService
    {
        private readonly ITrackRepository _trackRepository;
        private readonly IUserRepository _userRepository;

        private readonly INotificationService _notificationService;

        private readonly string _storagePath = Path.Combine(Directory.GetCurrentDirectory(), "storage", "tracks");
        private readonly IWebHostEnvironment _env;

        public TrackService(ITrackRepository tracksRepository, IWebHostEnvironment env, IUserRepository userRepository, INotificationService notificationService)
        {
            if (!Directory.Exists(_storagePath))
                Directory.CreateDirectory(_storagePath);

            _trackRepository = tracksRepository;
            _userRepository = userRepository;
            _env = env;
            _notificationService = notificationService;
        }

        public async Task<List<TrackAdminView>> GetAllTrack()
        {
            var tracks = await _trackRepository.GetAllAsync();
            var result = new List<TrackAdminView>();

            // 1. Lấy danh sách artistId duy nhất
            var artistIds = tracks.Select(t => t.ArtistId).Where(id => id != null).Distinct().ToList();

            // 2. Truy vấn tất cả uploader một lần
            var users = await _userRepository.GetManyByIdsAsync(artistIds); // Bạn cần thêm hàm này trong repo
            var userDict = users.Where(u => u.Id != null)
                                .ToDictionary(u => u.Id, u => u);


            foreach (var track in tracks)
            {
                string? base64Image = null;
                var cover = track.Cover;

                if (!string.IsNullOrEmpty(cover))
                {
                    var coverPath = Path.Combine("storage", "cover_images", cover); // bỏ GetCurrentDirectory nếu app đã định cấu hình base path đúng
                    if (File.Exists(coverPath))
                    {
                        var bytes = await File.ReadAllBytesAsync(coverPath);
                        var ext = Path.GetExtension(cover).ToLower().TrimStart('.');
                        var mimeType = ext switch
                        {
                            "jpg" or "jpeg" => "image/jpeg",
                            "png" => "image/png",
                            "webp" => "image/webp",
                            _ => "application/octet-stream"
                        };
                        base64Image = $"data:{mimeType};base64,{Convert.ToBase64String(bytes)}";
                    }
                }

                Users? uploader = null;
                if (track.ArtistId != null)
                {
                    userDict.TryGetValue(track.ArtistId, out uploader);
                }

                result.Add(new TrackAdminView
                {
                    TrackId = track.Id,
                    Title = track.Title,
                    UploaderId = uploader?.Id,
                    UploaderName = uploader?.Name,
                    Genres = track.Genres,
                    IsPublic = track.IsPublic,
                    isApproved = track.IsApproved,
                    lastUpdate = track.UpdatedAt == null ? track.CreatedAt : track.UpdatedAt,
                    ImageBase64 = base64Image
                });
            }

            return result;
        }


        public async Task<Track> UploadTrackAsync(
            IFormFile file,
            string title,
            string? artistId,
            string[]? genres,
            string? cover)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File không hợp lệ.");

            var extension = Path.GetExtension(file.FileName).ToLower();
            if (extension != ".mp3")
                throw new ArgumentException("Chỉ chấp nhận file .mp3");

            var randomFileName = $"{Guid.NewGuid()}.mp3";
            var relativePath = Path.Combine("storage", "tracks", randomFileName).Replace("\\", "/");
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), relativePath);

            Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var track = new Track
            {
                Title = title,
                ArtistId = artistId,
                Genres = genres,
                Cover = cover,
                Filename = relativePath,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _trackRepository.CreateAsync(track);
            return track;
        }


        public async Task<Track?> GetByIdAsync(string id)
        {
            return await _trackRepository.GetByIdAsync(id);
        }

        public async Task<List<TrackThumbnail>> GetTopPlayedThumbnailsAsync(int limit = 20)
        {
            var tracks = await _trackRepository.GetTopPlayedTracksAsync(limit);
            var result = new List<TrackThumbnail>();

            foreach (var track in tracks)
            {
                string? base64Image = null;

                if (!string.IsNullOrEmpty(track.Cover))
                {
                    var coverPath = Path.Combine(Directory.GetCurrentDirectory(), "storage", "cover_images", track.Cover);
                    if (File.Exists(coverPath))
                    {
                        var imageBytes = await File.ReadAllBytesAsync(coverPath);
                        var extension = Path.GetExtension(track.Cover).ToLower().TrimStart('.');
                        var mimeType = extension switch
                        {
                            "jpg" or "jpeg" => "image/jpeg",
                            "png" => "image/png",
                            "webp" => "image/webp",
                            _ => "application/octet-stream"
                        };

                        base64Image = $"data:{mimeType};base64,{Convert.ToBase64String(imageBytes)}";
                    }
                }

                result.Add(new TrackThumbnail
                {
                    Id = track.Id,
                    Title = track.Title,
                    IsPublic = track.IsPublic,
                    ImageBase64 = base64Image
                });
            }

            return result;
        }

        public async Task<List<TrackThumbnail>> GetTopLikeThumbnailsAsync(int limit = 20)
        {
            var tracks = await _trackRepository.GetTopLikeTracksAsync(limit);
            var result = new List<TrackThumbnail>();

            foreach (var track in tracks)
            {
                string? base64Image = null;

                if (!string.IsNullOrEmpty(track.Cover))
                {
                    var coverPath = Path.Combine(Directory.GetCurrentDirectory(), "storage", "cover_images", track.Cover);
                    if (File.Exists(coverPath))
                    {
                        var imageBytes = await File.ReadAllBytesAsync(coverPath);
                        var extension = Path.GetExtension(track.Cover).ToLower().TrimStart('.');
                        var mimeType = extension switch
                        {
                            "jpg" or "jpeg" => "image/jpeg",
                            "png" => "image/png",
                            "webp" => "image/webp",
                            _ => "application/octet-stream"
                        };

                        base64Image = $"data:{mimeType};base64,{Convert.ToBase64String(imageBytes)}";
                    }
                }

                result.Add(new TrackThumbnail
                {
                    Id = track.Id,
                    Title = track.Title,
                    IsPublic = track.IsPublic,
                    ImageBase64 = base64Image
                });
            }

            return result;
        }

        public async Task<TrackMusic> GetMusicByIdAsync(string id)
        {
            var track = await _trackRepository.GetByIdAsync(id);

            if (track == null)
            {
                return null;
            }

            await UpdatePlayCount(track.Id);

            var filePath = Path.Combine(_env.ContentRootPath, "storage", "tracks", track.Filename);

            if (!System.IO.File.Exists(filePath))
            {
                return null;
            }

            return new TrackMusic
            {
                AudioUrl = filePath,
            };
        }

        public async Task<string> UpdatePlayCount(string id)
        {
            try
            {
                var track = await _trackRepository.GetByIdAsync(id);
                if (track != null)
                {
                    track.PlayCount += 1;
                    await _trackRepository.UpdateAsync(id, track);
                    return "Success";
                }
                return "Failed";
            }
            catch (Exception ex)
            {
                return "Failed";
            }
        }

        public async Task<TrackInfo?> GetTrackInfo(string id)
        {
            try
            {
                var track = await _trackRepository.GetByIdAsync(id);
                if (track == null)
                {
                    return null;
                }

                // Xử lý ảnh cover
                string? base64Image = null;
                if (!string.IsNullOrEmpty(track.Cover))
                {
                    var coverPath = Path.Combine("storage", "cover_images", track.Cover);
                    if (File.Exists(coverPath))
                    {
                        var bytes = await File.ReadAllBytesAsync(coverPath);
                        var ext = Path.GetExtension(track.Cover).ToLower().TrimStart('.');
                        var mimeType = ext switch
                        {
                            "jpg" or "jpeg" => "image/jpeg",
                            "png" => "image/png",
                            "webp" => "image/webp",
                            _ => "application/octet-stream"
                        };
                        base64Image = $"data:{mimeType};base64,{Convert.ToBase64String(bytes)}";
                    }
                }

                // Lấy thông tin uploader nếu có
                Users? uploader = null;
                if (!string.IsNullOrEmpty(track.ArtistId))
                {
                    uploader = await _userRepository.GetByIdAsync(track.ArtistId);
                }

                return new TrackInfo
                {
                    TrackId = track.Id,
                    Title = track.Title,
                    UploaderId = uploader?.Id,
                    UploaderName = uploader?.Name,
                    Genres = track.Genres,
                    IsPublic = track.IsPublic,
                    ImageBase64 = base64Image,
                    lastUpdate = track.UpdatedAt == null ? track.CreatedAt : track.UpdatedAt
                };
            }
            catch (Exception ex)
            {
                // Log lỗi nếu cần
                //_logger.LogError(ex, "Error getting track info for ID: {TrackId}", id);
                return null;
            }
        }

        public async Task ApproveTrack(string id)
        {
            var track = await _trackRepository.GetByIdAsync(id);
            if (track != null)
            {
                track.IsApproved = !track.IsApproved;
                track.UpdatedAt = DateTime.Now;

                if (track.ArtistId != null)
                {
                    var ids = new List<string>();
                    ids.Add(track.ArtistId);

                    await _notificationService.SendNotification(
                        ids,
                        "Cập nhật tình trạng nhạc của bạn",
                        track.IsApproved ? "Bài hát " + track.Title + " của bạn đã được duyệt" : "Bài hát " + track.Title + " của bạn đã tạm khóa"
                    );
                }

                await _trackRepository.UpdateAsync(id, track);
            }
        }

        public async Task ChangePublicStatus(string id)
        {
            var track = await _trackRepository.GetByIdAsync(id);
            
            
            if (track != null)
            {
                track.IsPublic = !track.IsPublic;
                track.UpdatedAt = DateTime.Now;               
                
                await _trackRepository.UpdateAsync(id, track);
            }
        }

        public async Task<bool> DeleteTrack(string trackId, string userId, string userRole)
        {
            var track = await _trackRepository.GetByIdAsync(trackId);
            if (userRole == "admin" || userId == track?.ArtistId)
            {
                await _trackRepository.DeleteAsync(trackId);

                if (track != null)
                {
                    if (track?.ArtistId != null)
                    {
                        var coverPath = Path.Combine(Directory.GetCurrentDirectory(), "storages", "cover_images", track?.Cover ?? "");
                        var trackPath = Path.Combine(Directory.GetCurrentDirectory(), "storages", "tracks", track?.Filename ?? "");

                        await _trackRepository.DeleteAsync(trackId);

                        if (File.Exists(coverPath))
                        {
                            File.Delete(coverPath);
                        }

                        if (File.Exists(trackPath))
                        {
                            File.Delete(trackPath);
                        }

                        var ids = new List<string>();
                        ids.Add(track?.ArtistId);

                        await _notificationService.SendNotification(
                            ids,
                            "Bài hát của bạn đã bị xóa",
                            "Bài hát" + track?.Title + "của bạn đã bị xóa bởi hệ thống"
                        );
                    }
                    return true;
                }
                else
                {
                    return true;
                }
            }
            return false;
        }
    }
}
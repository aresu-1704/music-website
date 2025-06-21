using backend.Controllers;
using backend.DTOs;
using backend.Features.Extractor;
using backend.Interfaces;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
                string? base64Image = !string.IsNullOrEmpty(track.Cover)
                    ? $"http://localhost:5270/cover_images/{track.Cover}"
                    : null;


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

        #region Úp nhạc lên Embedding
        public async Task<Track> UploadTrackAsync(IFormFile file, string title, string? artistId, string[]? genres, string? base64Cover)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File không hợp lệ.");

            var extension = Path.GetExtension(file.FileName).ToLower();
            if (extension != ".mp3")
                throw new ArgumentException("Chỉ chấp nhận file .mp3");

            var mp3FileName = $"{Guid.NewGuid()}.mp3";
            var mp3Folder = Path.Combine(Directory.GetCurrentDirectory(), "storage", "tracks");
            var mp3FullPath = Path.Combine(mp3Folder, mp3FileName);

            Directory.CreateDirectory(mp3Folder);

            using (var stream = new FileStream(mp3FullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            string? savedCoverFileName = null;
            if (!string.IsNullOrEmpty(base64Cover))
            {
                try
                {
                    var base64Data = base64Cover.Split(',').Last();
                    var bytes = Convert.FromBase64String(base64Data);

                    savedCoverFileName = $"{Guid.NewGuid()}.jpg";
                    var imageFolder = Path.Combine(Directory.GetCurrentDirectory(), "storage", "cover_images");
                    var imageFullPath = Path.Combine(imageFolder, savedCoverFileName);

                    Directory.CreateDirectory(imageFolder);
                    await File.WriteAllBytesAsync(imageFullPath, bytes);
                }
                catch
                {
                    throw new ArgumentException("Cover ảnh không hợp lệ.");
                }
            }

            var embedding = await EmbeddingTrack(mp3FileName);

            var track = new Track
            {
                Title = title,
                ArtistId = artistId,
                Genres = genres,
                Cover = savedCoverFileName,
                Filename = mp3FileName,
                IsApproved = artistId == null ? true : false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Embedding = embedding
            };

            await _trackRepository.CreateAsync(track);
            return track;
        }

        public async Task<float[]?> EmbeddingTrack(string fileName)
        {
            var storagePath = Path.Combine(Directory.GetCurrentDirectory(), "storage", "tracks");

            var trackPath = Path.Combine(storagePath, fileName);
            try
            {
                var extractor = new AudioFeatureService();
                return extractor.ExtractFeatures(trackPath);
            }
            catch (Exception ex)
            {
                return null;
            }

        }
        #endregion

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
                string? imageUrl = null;

                if (!string.IsNullOrEmpty(track.Cover))
                {
                    imageUrl = !string.IsNullOrEmpty(track.Cover)
                        ? $"http://localhost:5270/cover_images/{track.Cover}"
                        : null;
                }

                result.Add(new TrackThumbnail
                {
                    Id = track.Id,
                    Title = track.Title,
                    IsPublic = track.IsPublic,
                    ImageBase64 = imageUrl
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
                string? imageUrl = null;

                if (!string.IsNullOrEmpty(track.Cover))
                {
                    imageUrl = !string.IsNullOrEmpty(track.Cover)
                        ? $"http://localhost:5270/cover_images/{track.Cover}"
                        : null;
                }

                result.Add(new TrackThumbnail
                {
                    Id = track.Id,
                    Title = track.Title,
                    IsPublic = track.IsPublic,
                    ImageBase64 = imageUrl
                });
            }

            return result;
        }

        public async Task<List<TrackThumbnail>> GetRecommentTrack(List<string?> trackIds)
        {
            var tracks = await _trackRepository.GetRecommendTrack(trackIds);
            var result = new List<TrackThumbnail>();

            foreach (var track in tracks)
            {
                string? imageUrl = null;

                if (!string.IsNullOrEmpty(track.Cover))
                {
                    imageUrl = !string.IsNullOrEmpty(track.Cover)
                        ? $"http://localhost:5270/cover_images/{track.Cover}"
                        : null;
                }

                result.Add(new TrackThumbnail
                {
                    Id = track.Id,
                    Title = track.Title,
                    IsPublic = track.IsPublic,
                    ImageBase64 = imageUrl
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

                string? base64Image = !string.IsNullOrEmpty(track.Cover)
                    ? $"http://localhost:5270/cover_images/{track.Cover}"
                    : null;

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
                    LastUpdate = track.UpdatedAt == null ? track.CreatedAt : track.UpdatedAt,
                    PlaysCount = track.PlayCount,
                    LikesCount = track.LikeCount
                };
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<List<Track>> GetTracksByArtistIdAsync(string artistId)
        {
            return await _trackRepository.GetApprovedTracksByArtistIdAsync(artistId);
        }

        public async Task<UserTracksResponse> GetUserTracksResponseAsync(string profileId)
        {
            var user = await _userRepository.GetByIdAsync(profileId);
            var tracks = await GetTracksByArtistIdAsync(profileId);
            var result = tracks.Select(track => new TrackListItemDto
            {
                Id = track.Id,
                Title = track.Title,
                Genres = track.Genres,
                CoverImage = !string.IsNullOrEmpty(track.Cover)
                    ? $"http://localhost:5270/cover_images/{track.Cover}"
                    : null,
                IsPublic = track.IsPublic,
                IsApproved = track.IsApproved,
                UpdatedAt = track.UpdatedAt != null ? track.UpdatedAt : track.CreatedAt,
                ArtistId = track.ArtistId,
                ArtistName = user?.Name ?? "Musicresu"
            }).ToList();

            return new UserTracksResponse
            {
                Role = user?.Role ?? "normal",
                Tracks = result
            };
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
                if (track != null)
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

                    if (userRole == "admin" && track?.ArtistId != null)
                    {
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
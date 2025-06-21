using backend.Controllers;
using backend.Interfaces;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Linq;

namespace backend.Services
{
    public class TrackService : ITrackService
    {
        private readonly ITrackRepository _trackRepository;
        private readonly IUserRepository _userRepository;

        private readonly string _storagePath = Path.Combine(Directory.GetCurrentDirectory(), "storage", "tracks");
        private readonly IWebHostEnvironment _env;

        public TrackService(ITrackRepository tracksRepository, IWebHostEnvironment env, IUserRepository userRepository)
        {
            if (!Directory.Exists(_storagePath))
                Directory.CreateDirectory(_storagePath);

            _trackRepository = tracksRepository;
            _userRepository = userRepository;
            _env = env;
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

        public async Task<TrackInfo> GetTrackInfo(string id)
        {
            try
            {
                var track = await _trackRepository.GetByIdAsync(id);
                if (track != null)
                {
                    string? base64Image = null;
                    if (track.Cover != null)
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
                    var uploader = await _userRepository.GetByIdAsync(track.ArtistId);
                    return new TrackInfo
                    {
                        TrackId = track.Id,
                        Title = track.Title,
                        UploaderId = uploader != null ? uploader.Id : null,
                        UploaderName = uploader != null ? uploader.Name : null,
                        Genres = track.Genres,
                        IsPublic = track.IsPublic,
                        ImageBase64 = base64Image,
                        lastUpdate = track.UpdatedAt != null ? track.UpdatedAt : track.CreatedAt,
                    };
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<List<Track>> GetPublicApprovedTracksByArtistIdAsync(string artistId)
        {
            return await _trackRepository.GetPublicApprovedTracksByArtistIdAsync(artistId);
        }

        public async Task<List<Track>> GetApprovedTracksByArtistIdAsync(string artistId)
        {
            return await _trackRepository.GetApprovedTracksByArtistIdAsync(artistId);
        }

        public async Task<UserTracksResponse> GetUserTracksResponseAsync(string profileId)
        {
            var user = await _userRepository.GetByIdAsync(profileId);
            var tracks = await GetApprovedTracksByArtistIdAsync(profileId);
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
                UpdatedAt = track.UpdatedAt,
                ArtistId = track.ArtistId,
                ArtistName = user?.Name ?? "Musicresu"
            }).ToList();
            return new UserTracksResponse
            {
                Role = user?.Role ?? "normal",
                Tracks = result
            };
        }
    }


}
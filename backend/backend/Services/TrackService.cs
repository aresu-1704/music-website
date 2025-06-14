using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;
using backend.Interfaces;

namespace backend.Services
{
    public class TrackService : ITrackService
    {
        private readonly ITrackRepository _trackRepository;
        private readonly string _storagePath = Path.Combine(Directory.GetCurrentDirectory(), "storage", "tracks");

        public TrackService(ITrackRepository tracksRepository)
        {
            if (!Directory.Exists(_storagePath))
                Directory.CreateDirectory(_storagePath);

            _trackRepository = tracksRepository;
        }

        public async Task<Track> UploadTrackAsync(
            IFormFile file,
            string title,
            string? artistId,
            string? album,
            string[]? genre,
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
                Album = album,
                Genre = genre,
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
    }
}
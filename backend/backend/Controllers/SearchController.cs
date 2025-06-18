using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly ITrackRepository _trackRepository;
        private readonly IUserRepository _userRepository;

        public SearchController(ITrackRepository trackRepository, IUserRepository userRepository)
        {
            _trackRepository = trackRepository;
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Search query cannot be empty");

            var tracks = await _trackRepository.SearchByTitleOrArtistAsync(query);
            var users = await _userRepository.SearchByUsernameOrNameAsync(query);

            var trackDtos = tracks.Select(track => new TrackSearchDto
            {
                Id = track.Id,
                Title = track.Title,
                ArtistId = track.ArtistId,
                LikeCount = track.LikeCount,
                PlayCount = track.PlayCount,
                ImageBase64 = !string.IsNullOrEmpty(track.Cover)
                    ? $"http://localhost:5270/cover_images/{track.Cover}"
                    : null,
                AudioUrl = $"http://localhost:5270/api/Track/audio/{track.Id}"
            }).ToList();

            var result = new SearchResultDto
            {
                Tracks = trackDtos,
                Users = users
            };

            return Ok(result);
        }
    }
    public class TrackThumbnail
    {
        public string Id { get; set; }
        public bool IsPublic { get; set; }
        public string Title { get; set; }
        public string ImageBase64 { get; set; }
    }
} 
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoritesService _favoritesService;

        public FavoritesController(IFavoritesService favoritesService)
        {
            _favoritesService = favoritesService;
        }

        // Toggle yêu thích (like/unlike)
        [HttpPost("toggle/{trackId}")]
        public async Task<IActionResult> ToggleFavorite(string trackId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var isNowFavorited = await _favoritesService.ToggleFavoriteAsync(userId, trackId);

            var response = new FavoriteToggleResponse
            {
                TrackId = trackId,
                Favorited = isNowFavorited
            };

            return Ok(response);
        }

        // Lấy danh sách trackId mà user đã like
        [HttpGet("my-tracks")]
        public async Task<IActionResult> GetMyFavoriteTracks()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var trackIds = await _favoritesService.GetFavoriteTrackIdsByUserAsync(userId);

            var response = new FavoriteTrackIdsResponse
            {
                TrackIds = trackIds
            };

            return Ok(response);
        }

        // Kiểm tra bài hát có đang được user yêu thích không
        [HttpGet("check/{trackId}")]
        public async Task<IActionResult> CheckIfTrackIsFavorited(string trackId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var isFavorited = await _favoritesService.IsTrackFavoritedAsync(userId, trackId);

            var response = new FavoriteCheckResponse
            {
                Favorited = isFavorited
            };

            return Ok(response);
        }
    }

    public class FavoriteToggleResponse
    {
        public string TrackId { get; set; }
        public bool Favorited { get; set; }
    }

    public class FavoriteCheckResponse
    {
        public bool Favorited { get; set; }
    }

    public class FavoriteTrackIdsResponse
    {
        public List<string> TrackIds { get; set; }
    }
}

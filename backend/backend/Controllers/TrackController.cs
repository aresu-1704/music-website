using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrackController : ControllerBase
    {
        private readonly ITrackService _trackService;

        public TrackController(ITrackService trackService)
        {
            _trackService = trackService;
        }

        // POST: api/tracks/upload
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadTrack([FromForm] UploadTrackRequest request)
        {
            try
            {
                var inserted = await _trackService.UploadTrackAsync(
                    request.File,
                    request.Title,
                    request.ArtistId,
                    request.Album,
                    request.Genre,
                    request.Cover
                );

                var response = new UploadTrackResponse
                {
                    Id = inserted.Id,
                    Filename = inserted.Filename,
                    Title = inserted.Title,
                    ArtistId = inserted.ArtistId,
                    CreatedAt = inserted.CreatedAt
                };

                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Đã xảy ra lỗi khi upload." });
            }
        }

        // GET: api/tracks/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTrackById(string id)
        {
            var track = await _trackService.GetByIdAsync(id);
            if (track == null)
                return NotFound(new { error = "Không tìm thấy bài hát." });

            return Ok(track);
        }
    }

    #region Úp load nhạc
    public class UploadTrackRequest
    {
        [Required]
        public IFormFile File { get; set; }

        [Required]
        public string Title { get; set; }

        public string? ArtistId { get; set; }

        public string? Album { get; set; }

        public string[]? Genre { get; set; }

        public string? Cover { get; set; }
    }

    public class UploadTrackResponse
    {
        public string Id { get; set; }
        public string Filename { get; set; }
        public string Title { get; set; }
        public string? ArtistId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    #endregion
}

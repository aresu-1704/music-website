using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.StaticFiles;
using SharpCompress.Common;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrackController : ControllerBase
    {
        private readonly ITrackService _trackService;
        private readonly ITrackRecommendationService _trackRecommendationService;
        private readonly IHistoryService _historyService;

        public TrackController(ITrackService trackService, ITrackRecommendationService trackRecommendationService, IHistoryService historyService)
        {
            _trackService = trackService;
            _trackRecommendationService = trackRecommendationService;
            _historyService = historyService;
        }

        [Authorize]
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadTrack([FromForm] UploadTrackRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var userRole = User.FindFirstValue(ClaimTypes.Role);

                var inserted = await _trackService.UploadTrackAsync(
                    request.File,
                    request.Title,
                    userRole == "admin" ? null : userId,
                    request.Genre,
                    request.Cover
                );

                return Ok("Đã thêm");
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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTrackById(string id)
        {
            var track = await _trackService.GetByIdAsync(id);
            if (track == null)
                return NotFound(new { error = "Không tìm thấy bài hát." });

            return Ok(track);
        }

        [HttpGet("top-played")]
        public async Task<IActionResult> GetTopPlayedTracks()
        {
            var result = await _trackService.GetTopPlayedThumbnailsAsync();
            return Ok(result);
        }

        [HttpGet("top-like")]
        public async Task<IActionResult> GetTopLikeTracks()
        {
            var result = await _trackService.GetTopLikeThumbnailsAsync();
            return Ok(result);
        }


        [HttpGet("audio/{id}")]
        public async Task<IActionResult> GetTrackAudio(string id)
        {
            var trackDetail = await _trackService.GetMusicByIdAsync(id);
            if (trackDetail == null)
            {
                return NotFound(new Dictionary<string, string>
                {
                    { "error", "Không tìm thấy bài hát hoặc file mp3 không tồn tại." }
                });
            }


            var filePath = trackDetail.AudioUrl;
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new Dictionary<string, string>
                {
                    { "error", "File mp3 không tồn tại." }
                });
            }

            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(filePath, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            return File(stream, contentType, enableRangeProcessing: true);
        }

        [HttpGet("track-info/{id}")]
        public async Task<IActionResult> GetTrackDetail(string id)
        {
            var trackDetail = await _trackService.GetByIdAsync(id);
            if (trackDetail != null)
            {
                var apiAudioUrl = "http://localhost:5270/api/Track/audio/" + id;
                return Ok(new TrackDetail()
                {
                    AudioUrl = apiAudioUrl,
                    LikeCount = trackDetail.LikeCount,
                    PlayCount = trackDetail.PlayCount,
                    IsPublic = trackDetail.IsPublic,
                });
            }
            else
            {
                return Ok("Không tìm thấy nhạc");
            }
        }

        [HttpPut("play-count/{id}")]
        public async Task<IActionResult> UpdatePlayCount(string id)
        {
            var result = await _trackService.UpdatePlayCount(id);
            if (result == "Success")
            {
                return Ok(result);
            }
            else
            {
                return BadRequest(result);
            }            
        }

        [HttpGet("track-detail/{id}")]
        public async Task<IActionResult> GetTrackInfomation(string id)
        {
            var result = await _trackService.GetTrackInfo(id);
            if (result == null)
            {
                return Ok("Không tìm thấy !");
            }
            else
            {
                return Ok(result);
            }
        }

        [HttpGet("all-track")]
        public async Task<IActionResult> GetAllTrack()
        {
            var result = await _trackService.GetAllTrack();
            return Ok(result);
        }

        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveTrack(string id)
        {
            await _trackService.ApproveTrack(id);
            return Ok("Thành công");
        }

        [HttpPut("public/{id}")]
        public async Task<IActionResult> PublicTrack(string id)
        {
            await _trackService.ChangePublicStatus(id);
            return Ok("Thành công");
        }

        [Authorize]
        [HttpDelete("delete/{trackId}")]
        public async Task<IActionResult> DeleteTrack(string trackId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var result = await _trackService.DeleteTrack(trackId, userId, userRole);
            if (result)
            {
                return Ok("Đã xóa");
            }
            else
            {
                return Unauthorized("Không có quyền xóa nhạc này");
            }
        }

        [Authorize]
        [HttpGet("recommend-track/{userId}")]
        public async Task<IActionResult> GetRecommendTrack(string userId)
        {
            var histories = await _historyService.GetUserHistoriesAsync(userId);
            var top10TrackIds = histories.Take(10)
                                         .Select(h => h.trackId)
                                         .ToList();
            var trackIds = await _trackRecommendationService.GetSimilarTrackIdsAsync(top10TrackIds, 20);
            return Ok(await _trackService.GetRecommentTrack(trackIds));
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

    #region Danh sách nhạc
    public class TrackThumbnail
    {
        public string Id { get; set; }
        public bool IsPublic { get; set; }
        public string Title { get; set; }
        public string ImageBase64 { get; set; }
    }
    #endregion

    #region Phát nhạc

    public class TrackMusic
    {
        public string AudioUrl { get; set; }
    }    

    public class TrackDetail
    {
        public string AudioUrl { get; set; }
        public int LikeCount { get; set; }
        public int PlayCount { get; set; }
        public bool IsPublic { get; set; }
    }
    #endregion

    #region Chi tiết nhạc
    public class TrackInfo
    {
        public string TrackId { get; set; }
        public string Title { get; set; }
        public string UploaderName { get; set; }
        public string UploaderId { get; set; }
        public string[] Genres { get; set; }
        public bool IsPublic { get; set ; }
        public string ImageBase64 { get; set; }
        public DateTime LastUpdate { get; set; }
        public int PlaysCount { get; set; }
        public int LikesCount { get; set; }

    }
    #endregion

    #region Danh sách nhạc admin
    public class TrackAdminView
    {
        public string TrackId { get; set; }
        public string Title { get; set; }
        public string UploaderName { get; set; }
        public string UploaderId { get; set; }
        public string[] Genres { get; set; }
        public bool IsPublic { get; set; }
        public bool isApproved { get; set; }
        public DateTime lastUpdate { get; set; }
        public string ImageBase64 { get; set; }
    }
    #endregion
}

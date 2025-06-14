using backend.Interfaces;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArtistController : ControllerBase
    {
        private readonly IArtistService _artistService;

        public ArtistController(IArtistService artistService)
        {
            _artistService = artistService;
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateArtist([FromBody] CreateArtistRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new CreateArtistResponse
                    {
                        Message = "Invalid token: userId not found."
                    });
                }

                var artist = new Artists
                {
                    Name = request.Name,
                    Bio = request.Bio
                };

                var result = await _artistService.CreateArtistAsync(userId, artist);

                // Xử lý string kết quả
                if (result == "Success.")
                {
                    return Ok(new CreateArtistResponse
                    {
                        Message = "Artist created successfully."
                    });
                }
                else if (result.Contains("already exists"))
                {
                    return Conflict(new CreateArtistResponse
                    {
                        Message = result
                    });
                }
                else
                {
                    return BadRequest(new CreateArtistResponse
                    {
                        Message = result
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CreateArtistResponse
                {
                    Message = "Internal Server Error: " + ex.Message
                });
            }
        }

        [Authorize]
        [HttpGet("check-approved/{userId}")]
        public async Task<IActionResult> CheckApproveResult(string userId)
        {
            return Ok(new CheckApprovedResponse()
            {
                Message = await _artistService.CheckApproveResult(userId)
            });
        }

        [Authorize]
        [HttpPut("cancel-register/{userId}")]
        public async Task<IActionResult> CancelRegister(string userId)
        {
            var result = await _artistService.CancelRegister(userId);
            if (result == true) {

                return Ok(new CancelRegisterResponse()
                {
                    Message = "Thành công"
                });
            }
            else
            {
                return Ok(new CancelRegisterResponse()
                {
                    Message = "Thất bại"
                });
            }
        }
    }

    public class CreateArtistRequest
    {
        public string Name { get; set; }
        public string Bio { get; set; }
    }

    public class CreateArtistResponse
    {
        public string Message { get; set; }
    }

    public class CheckApprovedResponse
    {
        public string Message { get; set; }
    }

    public class CancelRegisterResponse
    {
        public string Message { get; set; }
    }
}

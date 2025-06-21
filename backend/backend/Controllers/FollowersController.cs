using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FollowersController : ControllerBase
    {
        private readonly IFollowersService _followersService;
        public FollowersController(IFollowersService followersService)
        {
            _followersService = followersService;
        }

        [HttpPost("follow/{userId}")]
        public async Task<IActionResult> Follow(string userId)
        {
            var followerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(followerId) || followerId == userId)
                return BadRequest();
            await _followersService.FollowAsync(followerId, userId);
            return Ok();
        }

        [HttpDelete("unfollow/{userId}")]
        public async Task<IActionResult> Unfollow(string userId)
        {
            var followerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(followerId) || followerId == userId)
                return BadRequest();
            await _followersService.UnfollowAsync(followerId, userId);
            return Ok();
        }

        [HttpGet("check/{userId}")]
        public async Task<IActionResult> Check(string userId)
        {
            var followerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(followerId) || followerId == userId)
                return Ok(new FollowCheckResponse { Following = false });
            var following = await _followersService.IsFollowingAsync(followerId, userId);
            return Ok(new FollowCheckResponse { Following = following });
        }

        [HttpGet("following/{followerId}")]
        public async Task<IActionResult> GetFollowingList(string followerId)
        {
            if (string.IsNullOrEmpty(followerId))
                return BadRequest("FollowerId is required");
            
            var followingList = await _followersService.GetFollowingListAsync(followerId);
            return Ok(new FollowingListResponse 
            { 
                FollowerId = followerId, 
                FollowingList = followingList, 
                Count = followingList.Count 
            });
        }

        [HttpGet("FollowingList/{followerId}")]
        public async Task<IActionResult> GetFollowingDetailsList(string followerId)
        {
            var authenticatedUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(followerId))
                return BadRequest("FollowerId is required");
            
            if (authenticatedUserId != followerId)
                return Forbid("Bạn chỉ có thể xem danh sách theo dõi của chính mình");
            
            var followingDetailsList = await _followersService.GetFollowingDetailsListAsync(followerId);
            return Ok(new FollowingDetailsListResponse 
            { 
                FollowerId = followerId, 
                FollowingList = followingDetailsList, 
                Count = followingDetailsList.Count 
            });
        }
    }

    public class FollowCheckResponse
    {
        public bool Following { get; set; }
    }

    public class FollowingListResponse
    {
        public string FollowerId { get; set; }
        public List<string> FollowingList { get; set; }
        public int Count { get; set; }
    }

    public class FollowingDetailsListResponse
    {
        public string FollowerId { get; set; }
        public List<FollowingDetailsResponse> FollowingList { get; set; }
        public int Count { get; set; }
    }

    public class FollowingDetailsResponse
    {
        public string FollowingId { get; set; }
        public string FollowingName { get; set; }
        public string FollowingEmail { get; set; }
        public string FollowingAvatar { get; set; }
        public string FollowingRole { get; set; }
        public int FollowingGender { get; set; }
        public DateTime FollowingDateOfBirth { get; set; }
        public bool IsFollowing { get; set; }
    }
} 
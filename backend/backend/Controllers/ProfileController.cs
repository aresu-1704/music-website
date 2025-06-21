using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : Controller
    {
        private readonly IUsersService _userService;
        private readonly ITrackService _trackService;

        public ProfileController(IUsersService usersService, ITrackService trackService)
        {
            _userService = usersService;
            _trackService = trackService;
        }

        [Authorize]
        [HttpGet("my-profile/{userID}")]
        public async Task<IActionResult> GetProfileData(string userID)
        {
            var user = await _userService.GetProfileInfo(userID);

            if (user == null)
            {
                return NotFound("Không tìm thấy người dùng.");
            }

            var avatarBase64 = !string.IsNullOrEmpty(user.AvatarUrl)
                ? $"http://localhost:5270/avatar/{user.AvatarUrl}"
                : null;

            var response = new GetProfileDataResponse
            {
                fullname = user.Name,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                dateOfBirth = user.DateOfBirth,
                gender = user.Gender,
                avatarBase64 = avatarBase64,
                expiredDate = user.ExpiredDate,
                Role = user.Role
            };

            return Ok(response);
        }


        [HttpGet("profile/{userID}")]
        public async Task<IActionResult> GetPublicProfileData(string userID)
        {
            var user = await _userService.GetProfileInfo(userID);

            if (user == null)
            {
                return NotFound("Không tìm thấy người dùng.");
            }

            var avatarBase64 = !string.IsNullOrEmpty(user.AvatarUrl)
                ? $"http://localhost:5270/avatar/{user.AvatarUrl}"
                : null;


            var response = new PublicProfileDataDto
            {
                fullname = user.Name,
                dateOfBirth = user.DateOfBirth,
                gender = user.Gender,
                avatarBase64 = avatarBase64,
                Role = user.Role
            };

            return Ok(response);
        }

        [Authorize]
        [HttpPut("personal/{userID}")]
        public async Task<IActionResult> UpdatePersonalData(string userID, [FromBody] PersonalRequest request)
        {
            var result = await _userService.UpdatePersonalData(userID, request.FullName, request.Gender, request.DateOfBirth);

            if (result == "Success")
            {
                return Ok("Thành công");
            }
            else
            {
                return BadRequest("Không tồn tại");
            }
        }

        [Authorize]
        [HttpPut("personal-avt/{userID}")]
        public async Task<IActionResult> UpdatePersonalDataForm(string userID, [FromForm] PersonalAvatarRequest request)
        {
            string? fileName = null;

            if (request.Avatar != null && request.Avatar.Length > 0)
            {
                var uploadsFolder = Path.Combine("storage", "avatar");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                fileName = $"{userID}-avt.jpg";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Avatar.CopyToAsync(stream);
                }
            }

            var result = await _userService.UpdatePersonalData(userID, request.FullName, request.Gender, request.DateOfBirth, fileName);

            if (result == "Success")
            {
                return Ok("Thành công");
            }
            else
            {
                return BadRequest("Không tồn tại");
            }
        }


        [HttpGet("my-tracks/{profileId}")]
        public async Task<IActionResult> GetMyTracks(string profileId)
        {
            var response = await _trackService.GetUserTracksResponseAsync(profileId);
            return Ok(response);
        }
    }

    #region Lấy dữ liệu người dùng
    public class GetProfileDataResponse
    {
        public string fullname { get; set; }
        public string email { get; set; }
        public string phoneNumber { get; set; }
        public DateTime dateOfBirth { get; set; }
        public int gender { get; set; }
        public string avatarBase64 { get; set; }
        public DateTime expiredDate { get; set; }
        public string Role { get; set; }
    }
    #endregion

    #region Cập nhật thông tin cá nhân
    public class PersonalRequest
    {
        public string FullName { get; set; }
        public int Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
    }

    public class PersonalAvatarRequest
    {
        public string FullName { get; set; }
        public int Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public IFormFile Avatar { get; set; }
    }
    public class UserTracksResponse
    {
        public string Role { get; set; }
        public List<TrackListItemDto> Tracks { get; set; }
    }
    #endregion

    public class PublicProfileDataDto
    {
        public string fullname { get; set; }
        public int gender { get; set; }
        public DateTime dateOfBirth { get; set; }
        public string Role { get; set; }
        public string avatarBase64 { get; set; }
        public int FollowCount { get; set; }
    }
}

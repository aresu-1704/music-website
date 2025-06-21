using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;

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
                Role = user.Role,
                address = user.Address,
                isEmailVerified = user.IsEmailVerified
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
                Role = user.Role,
                FollowCount = user.FollowCount,
                address = user.Address,
                isEmailVerified = user.IsEmailVerified
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

        [Authorize]
        [HttpPost("change-password/{userId}")]
        public async Task<IActionResult> ChangePassword(string userId, [FromBody] ChangePasswordRequest request)
        {
            var result = await _userService.ChangePassword(userId, request.OldPassword, request.NewPassword);
            if (result)
                return Ok("Đổi mật khẩu thành công");
            else
                return BadRequest("Mật khẩu cũ không đúng hoặc có lỗi");
        }

        [HttpGet("my-tracks/{profileId}")]
        public async Task<IActionResult> GetMyTracks(string profileId)
        {
            var response = await _trackService.GetUserTracksResponseAsync(profileId);
            return Ok(response);
        }

        [Authorize]
        [HttpPut("address/{userId}")]
        public async Task<IActionResult> UpdateAddress(string userId, [FromBody] UpdateAddressRequest request)
        {
            var user = await _userService.GetProfileInfo(userId);
            if (user == null)
                return NotFound("Không tìm thấy người dùng.");
            var result = await _userService.UpdatePersonalData(userId, user.Name, user.Gender, user.DateOfBirth, user.AvatarUrl, request.Address, user.IsEmailVerified);
            if (result == "Success")
                return Ok("Cập nhật địa chỉ thành công");
            else
                return BadRequest("Cập nhật địa chỉ thất bại");
        }

        [Authorize]
        [HttpPost("send-verify-email-otp/{userId}")]
        public async Task<IActionResult> SendVerifyEmailOtp(string userId)
        {
            var user = await _userService.GetProfileInfo(userId);
            if (user == null)
                return NotFound("Không tìm thấy người dùng.");
            var result = await _userService.SendOtpAsync(user.Email);
            if (!result)
                return BadRequest("Không gửi được OTP xác minh email.");
            return Ok("Đã gửi OTP xác minh email.");
        }

        [Authorize]
        [HttpPost("verify-email-otp/{userId}")]
        public async Task<IActionResult> VerifyEmailOtp(string userId, [FromBody] VerifyEmailOtpRequest request)
        {
            var user = await _userService.GetProfileInfo(userId);
            if (user == null)
                return NotFound("Không tìm thấy người dùng.");
            var result = await _userService.VerifyOnlyOtpAsync(user.Email, request.Otp);
            if (!result)
                return BadRequest("OTP không hợp lệ hoặc đã hết hạn.");
            // Đánh dấu đã xác minh email
            var updateResult = await _userService.UpdatePersonalData(userId, user.Name, user.Gender, user.DateOfBirth, user.AvatarUrl, user.Address, true);
            if (updateResult == "Success")
                return Ok("Xác minh email thành công.");
            else
                return BadRequest("Xác minh email thất bại");
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
        public string? address { get; set; }
        public bool isEmailVerified { get; set; }
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
        public string? address { get; set; }
        public bool isEmailVerified { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }

    public class UpdateAddressRequest
    {
        public string Address { get; set; }
    }

    public class VerifyEmailOtpRequest
    {
        public string Otp { get; set; }
    }
}

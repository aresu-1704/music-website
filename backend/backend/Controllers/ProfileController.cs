using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;

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

        [HttpGet("admin/all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAdminView();
            return Ok(users);
        }

        [HttpGet("test-simple")]
        public IActionResult TestSimple()
        {
            var testData = new
            {
                message = "Test successful",
                timestamp = DateTime.UtcNow
            };
            return Ok(testData);
        }

        [HttpGet("test-string")]
        public async Task<IActionResult> TestString()
        {
            var users = await _userService.GetAllUsers();
            var simpleList = users.Take(1).Select(user => new
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role
            }).ToList();

            return Ok(simpleList);
        }

        [HttpPut("admin/update-status/{userId}")]
        public async Task<IActionResult> UpdateUserStatus(string userId, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                var result = await _userService.UpdateUserStatus(userId, request.Status);
                if (result)
                {
                    return Ok(new UpdateStatusResponse { Message = "User status updated successfully" });
                }
                return NotFound(new UpdateStatusResponse { Message = "User not found" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateUserStatus: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new UpdateStatusResponse { Message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpPut("admin/update-role/{userId}")]
        public async Task<IActionResult> UpdateUserRole(string userId, [FromBody] UpdateRoleRequest request)
        {
            try
            {
                var result = await _userService.UpdateUserRole(userId, request.Role);
                if (result)
                {
                    return Ok(new UpdateRoleResponse { Message = "User role updated successfully" });
                }
                return NotFound(new UpdateRoleResponse { Message = "User not found" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateUserRole: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new UpdateRoleResponse { Message = $"Internal server error: {ex.Message}" });
            }
        }

        [Authorize]
        [HttpGet("check-role")]
        public async Task<IActionResult> CheckCurrentUserRole()
        {
            var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var userRole = User.FindFirst("role")?.Value;
            
            return Ok(new { 
                UserId = userId, 
                Role = userRole,
                AllClaims = User.Claims.Select(c => new { Type = c.Type, Value = c.Value }).ToList()
            });
        }

        [HttpGet("make-admin/{userId}")]
        public async Task<IActionResult> MakeUserAdmin(string userId)
        {
            var result = await _userService.UpdateUserRole(userId, "admin");
            if (result)
            {
                return Ok("Đã cập nhật quyền admin thành công");
            }
            return BadRequest("Không tìm thấy người dùng");
        }

        [Authorize]
        [HttpGet("test-auth")]
        public IActionResult TestAuth()
        {
            return Ok("Authentication works!");
        }

        [Authorize(Roles = "admin")]
        [HttpGet("test-admin")]
        public IActionResult TestAdmin()
        {
            return Ok("Admin authorization works!");
        }

        [Authorize]
        [HttpGet("debug-token")]
        public IActionResult DebugToken()
        {
            var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var role = User.FindFirst("role")?.Value;
            var name = User.FindFirst("fullname")?.Value;
            
            var claimsList = new List<object>();
            foreach (var claim in User.Claims)
            {
                claimsList.Add(new { Type = claim.Type, Value = claim.Value });
            }
            
            return Ok(new
            {
                UserId = userId,
                Role = role,
                Name = name,
                AllClaims = claimsList,
                IsAuthenticated = User.Identity.IsAuthenticated,
                AuthenticationType = User.Identity.AuthenticationType
            });
        }

        [Authorize]
        [HttpGet("debug-simple")]
        public IActionResult DebugSimple()
        {
            var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var role = User.FindFirst("role")?.Value;
            var name = User.FindFirst("fullname")?.Value;
            
            // Thử tìm claims theo các cách khác nhau
            var allClaims = User.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == "role");
            var subClaim = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
            var nameClaim = User.Claims.FirstOrDefault(c => c.Type == "fullname");
            
            // Tìm theo URI format của ASP.NET Core
            var userIdFromUri = User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            var roleFromUri = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            var nameFromUri = User.FindFirst("fullname")?.Value;
            
            return Ok($"UserId: {userId} | Role: {role} | Name: {name}\n" +
                     $"UserId (URI): {userIdFromUri} | Role (URI): {roleFromUri} | Name (URI): {nameFromUri}\n" +
                     $"All Claims: {string.Join(", ", allClaims)}\n" +
                     $"Role Claim: {roleClaim?.Value}\n" +
                     $"Sub Claim: {subClaim?.Value}\n" +
                     $"Name Claim: {nameClaim?.Value}");
        }

        [Authorize]
        [HttpGet("create-admin-token")]
        public async Task<IActionResult> CreateAdminToken()
        {
            var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("Không tìm thấy user ID");
            }

            // Cập nhật role thành admin
            var result = await _userService.UpdateUserRole(userId, "admin");
            if (!result)
            {
                return BadRequest("Không thể cập nhật role");
            }

            // Lấy thông tin user
            var user = await _userService.GetProfileInfo(userId);
            if (user == null)
            {
                return BadRequest("Không tìm thấy user");
            }

            // Tạo token mới với role admin
            var jwtService = HttpContext.RequestServices.GetRequiredService<IJWTService>();
            var newToken = jwtService.GenerateJwtToken(user.Id, user.Name, "admin");

            return Ok(new { 
                Token = newToken,
                Message = "Đã tạo token admin thành công. Vui lòng đăng nhập lại với token mới."
            });
        }

        [Authorize]
        [HttpGet("test-role-check")]
        public IActionResult TestRoleCheck()
        {
            var role = User.FindFirst("role")?.Value;
            var isInRole = User.IsInRole("admin");
            var roles = User.Claims.Where(c => c.Type == "role").Select(c => c.Value).ToList();
            
            return Ok(new
            {
                RoleClaim = role,
                IsInRoleAdmin = isInRole,
                AllRoleClaims = roles,
                HasRoleClaim = !string.IsNullOrEmpty(role),
                RoleEqualsAdmin = role == "admin"
            });
        }

        [Authorize(Policy = "AdminPolicy")]
        [HttpGet("test-admin-policy")]
        public IActionResult TestAdminPolicy()
        {
            return Ok("Admin policy works!");
        }

        [Authorize]
        [HttpGet("check-all-claims")]
        public IActionResult CheckAllClaims()
        {
            var allClaims = new List<string>();
            foreach (var claim in User.Claims)
            {
                allClaims.Add($"{claim.Type}: {claim.Value}");
            }
            
            var roleClaims = User.Claims.Where(c => c.Type == "role").ToList();
            var roleClaimValues = roleClaims.Select(c => c.Value).ToList();
            
            return Ok(new
            {
                AllClaims = allClaims,
                RoleClaims = roleClaimValues,
                RoleClaimCount = roleClaims.Count,
                HasRoleClaim = roleClaims.Any(),
                IsInRoleAdmin = User.IsInRole("admin"),
                UserIdentityName = User.Identity?.Name,
                UserIdentityType = User.Identity?.AuthenticationType
            });
        }

        [Authorize]
        [HttpGet("simple-claims")]
        public IActionResult SimpleClaims()
        {
            var claimsText = string.Join("\n", User.Claims.Select(c => $"{c.Type}: {c.Value}"));
            return Ok($"Claims:\n{claimsText}");
        }

        [Authorize]
        [HttpGet("decode-jwt")]
        public IActionResult DecodeJwt()
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return BadRequest("No Bearer token found");
            }

            var token = authHeader.Substring("Bearer ".Length);
            var handler = new JwtSecurityTokenHandler();
            
            try
            {
                var jwtToken = handler.ReadJwtToken(token);
                var claims = jwtToken.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
                
                return Ok($"JWT Token Claims:\n{string.Join("\n", claims)}");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error decoding JWT: {ex.Message}");
            }
        }

        [Authorize]
        [HttpGet("check-all-users-roles")]
        public async Task<IActionResult> CheckAllUsersRoles()
        {
            var users = await _userService.GetAllUsers();
            var rolesInfo = users.Select(u => $"{u.Username}: {u.Role}").ToList();
            var rolesSummary = users.GroupBy(u => u.Role).Select(g => $"{g.Key}: {g.Count()} users").ToList();
            
            return Ok($"All users ({users.Count}):\n{string.Join("\n", rolesInfo)}\n\nRoles summary:\n{string.Join("\n", rolesSummary)}");
        }

        [Authorize]
        [HttpDelete("admin/delete/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            try
            {
                var result = await _userService.DeleteUserAsync(userId);
                if (result)
                {
                    return Ok(new { message = "User deleted successfully" });
                }
                else
                {
                    return StatusCode(500, new { message = "Failed to delete user" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteUser: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
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

    #region Admin DTOs
    public class AdminUserDto
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public int Gender { get; set; }
        public bool Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public string? AvatarUrl { get; set; }
        public string Role { get; set; }
        public string Name { get; set; }
    }
    
    #endregion
}

using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson.Serialization.Attributes;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUsersService _usersService;

        public AuthController(IUsersService usersService)
        {
            _usersService = usersService;
        }

        // Post: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var (token, avatarBase64) = await _usersService.VerifyLogin(request.Username, request.Password);

            if (token == null)
            {
                // Sai tài khoản hoặc mật khẩu → 401 Unauthorized
                return Unauthorized(new LoginResponse
                {
                    Message = "Sai tên đăng nhập hoặc mật khẩu",
                    Token = null,
                    AvatarBase64 = avatarBase64,
                });
            }
            else if (token == "Tài khoản đã bị khóa")
            {
                // Tài khoản bị khóa → 403 Forbidden
                return StatusCode(StatusCodes.Status403Forbidden, new LoginResponse
                {
                    Message = "Tài khoản của bạn đã bị vô hiệu hóa",
                    Token = null,
                    AvatarBase64 = avatarBase64,
                   
                });
            }

            // Đăng nhập thành công
            return Ok(new LoginResponse
            {
                Message = "Đăng nhập thành công",
                Token = token,
                AvatarBase64 = avatarBase64
            });
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string resultMessage = await _usersService.Register(request.Username,
                                                                request.FullName,
                                                                request.Email,
                                                                request.Password,
                                                                request.PhoneNumber,
                                                                request.DateOfBirth,
                                                                request.Gender
                                                                );
            return Ok(new RegisterResponse
            {
                Message = resultMessage
            });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", " ");

            if (string.IsNullOrEmpty(token))
                return BadRequest("Token is missing");

            var result = await _usersService.Logout(token);
            if (result == true)
            {
                return Ok();
            }
            else
            {
                return BadRequest("Invalid token");
            }
        }
    }

    

    //Lớp Request, Response
    #region Đăng nhập
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public string? AvatarBase64 { get; set; }
    }
    #endregion

    # region Đăng ký
    public class RegisterRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public int Gender { get; set; }
    }

    public class RegisterResponse
    {
        public string Message { get; set; } = string.Empty;
    }
    #endregion

    //#region Đăng xuất
    //public class LogoutRequest
    //{
    //    public str
    //}
    //#endregion
}

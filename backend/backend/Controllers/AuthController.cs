using backend.Services;
using Microsoft.AspNetCore.Mvc;
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

        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        //Post: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var (id, role) = await _usersService.VerifyLogin(request.Username, request.Password);

            if (id == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }
            else if (role == -1)
            {
                return Unauthorized(new { message = "Account banned" });
            }
            return Ok(new { message = "Login succesfully", userId = id, userRole = role});
        }
    }
}

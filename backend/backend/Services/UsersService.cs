using backend.Interfaces;
using backend.Models;
using backend.Utils.Securities;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Services
{
    public class UsersService : IUsersService
    {
        private readonly IUserRepository _usersRepository;
        private readonly IJWTService _jwtService;
        private readonly ITokenBlacklistService _tokenBlacklistService;
        public UsersService(IUserRepository usersRepository, IJWTService jwtService, ITokenBlacklistService tokenBlaclistService)
        {
            _usersRepository = usersRepository;
            _jwtService = jwtService;
            _tokenBlacklistService = tokenBlaclistService;
        }

        public async Task<string?> VerifyLogin(string username, string password)
        {
            var loginUser = await _usersRepository.GetByUsernameAsync(username);

            if(loginUser != null)
            {
                if(loginUser.Status == false)
                {
                    return "Tài khoản đã bị khóa";
                }

                var salt = loginUser.Salt;
                var storePassword = loginUser.Password;

                var hashPassword = HashingUtil.HashPassword(password, salt);

                if(hashPassword == storePassword)
                {
                    return _jwtService.GenerateJwtToken(loginUser.Id, loginUser.Name, loginUser.Role.ToString()); ;
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return null;
            }
        }

        public async Task<string> Register(string username, string fullname, string email, string password, string phoneNumber, DateTime dateOfBirth, int gender)
        {
            try
            {
                var salt = HashingUtil.GenerateSalt(16);
                var hashPassword = HashingUtil.HashPassword(password, salt);

                Users registerUser = new Users()
                {
                    Username = username,
                    Name = fullname,
                    Email = email,
                    Password = hashPassword,
                    PhoneNumber = phoneNumber,
                    DateOfBirth = dateOfBirth,
                    Salt = salt,
                    Gender = gender,
                    CreatedAt = DateTime.UtcNow,
                    Status = true,
                    LastLogin = null,
                    Role = "normal",
                    IsEmailVerified = false,
                    IsPhoneVerified = false,
                    AvatarUrl = null,
                };

                await _usersRepository.CreateAsync(registerUser);
                return "Đăng ký thành công.";
            }
            catch (MongoWriteException ex) when (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
            {
                return "Email đã tồn tại.";
            }
            catch (Exception ex)
            {
                Console.WriteLine("Đã xảy ra lỗi " + ex.ToString());
                return "Đăng ký thất bại.";
            }
        }
        
        public async Task<bool> Logout(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);

                var id = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;

                if (string.IsNullOrEmpty(id))
                {
                    return false;
                }

                Users user = await _usersRepository.GetByIdAsync(id);
                if (user != null)
                {
                    user.LastLogin = DateTime.UtcNow;
                    await _usersRepository.UpdateAsync(id, user);

                    var expires = jwtToken.ValidTo;

                    await _tokenBlacklistService.AddToBlacklistAsync(id, expires);

                    return true;
                }
                else
                {
                    Console.WriteLine($"Failed to log out: {id} not exist");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return false;
            }    
            return false;
        }
    }
}

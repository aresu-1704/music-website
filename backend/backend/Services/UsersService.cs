using backend.Interfaces;
using backend.Models;
using backend.Utils.Securities;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using StackExchange.Redis;

namespace backend.Services
{
    public class UsersService : IUsersService
    {
        private readonly IUserRepository _usersRepository;
        private readonly IJWTService _jwtService;
        private readonly ITokenBlacklistService _tokenBlacklistService;
        private readonly IConnectionMultiplexer _redis;
        private readonly IConfiguration _config;

        public UsersService(IUserRepository usersRepository, IJWTService jwtService, ITokenBlacklistService tokenBlaclistService, IConnectionMultiplexer redis, IConfiguration config)
        {
            _usersRepository = usersRepository;
            _jwtService = jwtService;
            _tokenBlacklistService = tokenBlaclistService;
            _redis = redis;
            _config = config;
        }

        public async Task<(string?, string?)> VerifyLogin(string username, string password)
        {
            var loginUser = await _usersRepository.GetByUsernameAsync(username);

            if(loginUser != null)
            {
                if(loginUser.Status == false)
                {
                    return ("Tài khoản đã bị khóa", null);
                }

                var salt = loginUser.Salt;
                var storePassword = loginUser.Password;

                var hashPassword = HashingUtil.HashPassword(password, salt);

                if(hashPassword == storePassword)
                {
                    string avatarBase64 = null;
                    if (!string.IsNullOrEmpty(loginUser.AvatarUrl))
                    {
                        try
                        {
                            byte[] imageBytes = await System.IO.File.ReadAllBytesAsync(loginUser.AvatarUrl);
                            avatarBase64 = Convert.ToBase64String(imageBytes);
                            avatarBase64 = $"data:image/jpeg;base64,{avatarBase64}";
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Lỗi khi đọc ảnh: {ex.Message}");
                            avatarBase64 = null;
                        }
                    }
                    string token = _jwtService.GenerateJwtToken(loginUser.Id, loginUser.Name, loginUser.Role.ToString());
                    return (token, avatarBase64);
                }
                else
                {
                    return (null, null);
                }
            }
            else
            {
                return (null, null);
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

        public async Task<Users> GetProfileInfo(string userID)
        {
            try
            {
                return await _usersRepository.GetByIdAsync(userID);
            }
            catch (Exception ex) {
                return null;
            }
        }

        public async Task<string> UpdatePersonalData(string userID, string fullname, int gender, DateTime dateOfBirth, string avtUrl = null)
        {
            var user = await _usersRepository.GetByIdAsync(userID);
            if (user != null)
            {
                user.Name = fullname;
                user.Gender = gender;
                user.DateOfBirth = dateOfBirth;
                if (avtUrl != null)
                {
                    user.AvatarUrl = avtUrl;
                }                

                await _usersRepository.UpdateAsync(userID, user);

                return "Success";
            }
            else
            {
                return null;
            }
        }

        public async Task<string> UpgradeTier(string userId, string tier)
        {
            var user = await _usersRepository.GetByIdAsync(userId);
            if (user != null)
            {
                user.Role = tier;

                if (user.ExpiredDate == null || user.ExpiredDate < DateTime.Now)
                {
                    // Chưa có hạn hoặc đã hết hạn → gán lại từ hôm nay
                    user.ExpiredDate = DateTime.Now.AddDays(30);
                }
                else
                {
                    // Nếu cùng tier và còn hiệu lực → cộng thêm 30 ngày
                    if (user.Role == tier)
                    {
                        user.ExpiredDate = user.ExpiredDate.AddDays(30);
                    }
                    else
                    {
                        // Nếu khác tier → reset lại hạn
                        user.ExpiredDate = DateTime.Now.AddDays(30);
                    }
                }

                await _usersRepository.UpdateAsync(userId, user);
                return "Success";
            }
            else
            {
                return null;
            }

        }

        public async Task<bool> SendOtpAsync(string email)
        {
            var db = _redis.GetDatabase();
            var user = await _usersRepository.GetByEmailAsync(email);
            if (user == null) return false;

            // Check spam limit
            if (await db.StringGetAsync($"otp-limit:{email}") != RedisValue.Null)
                return false;

            // Gen OTP
            var otp = new Random().Next(100000, 999999).ToString();
            await db.StringSetAsync($"otp:{email}", otp, TimeSpan.FromMinutes(5));
            await db.StringSetAsync($"otp-limit:{email}", "1", TimeSpan.FromSeconds(60));

            // Send mail
            var smtpUser = _config["Gmail:Username"];
            var smtpPass = _config["Gmail:AppPassword"];

            using var client = new System.Net.Mail.SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new System.Net.NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true,
            };

            await client.SendMailAsync(
                new System.Net.Mail.MailMessage(
                    from: smtpUser,
                    to: email,
                    subject: "Your OTP Code",
                    body: $"Your OTP is: {otp}"
                )
            );

            return true;
        }

        public async Task<bool> VerifyOtpAsync(string email, string otp, string newPassword)
        {
            var db = _redis.GetDatabase();
            var savedOtp = await db.StringGetAsync($"otp:{email}");
            if (savedOtp.IsNullOrEmpty || savedOtp != otp) return false;

            var user = await _usersRepository.GetByEmailAsync(email);
            if (user == null) return false;

            var newSalt = HashingUtil.GenerateSalt();
            var newHash = HashingUtil.HashPassword(newPassword, newSalt);
            user.Password = newHash;
            user.Salt = newSalt;

            await _usersRepository.UpdateAsync(user.Id, user);

            await db.KeyDeleteAsync($"otp:{email}");
            return true;
        }
    }
}

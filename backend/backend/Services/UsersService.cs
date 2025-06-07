using backend.Interfaces;
using backend.Models;
using backend.Utils.Securities;
using MongoDB.Driver;

namespace backend.Services
{
    public class UsersService : IUsersService
    {
        private readonly IUserRepository _usersRepository;
        private readonly IJWTService _jwtService;
        public UsersService(IUserRepository usersRepository, IJWTService jwtService)
        {
            _usersRepository = usersRepository;
            _jwtService = jwtService;
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
                    Role = 1,
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
        //Task UpdateAsync(string id, Users user);
        //Task DeleteAsync(string id);
    }
}

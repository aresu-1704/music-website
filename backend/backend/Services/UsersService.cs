using backend.Models;
using backend.Repositories;
using backend.Utils.Securities;

namespace backend.Services
{
    public class UsersService : IUsersService
    {
        private readonly IUserRepository _usersRepository;

        public UsersService(IUserRepository usersRepository)
        {
            _usersRepository = usersRepository;
        }

        public async Task<(string id, int role)> VerifyLogin(string username, string password)
        {
            var loginUser = await _usersRepository.GetByUsernameAsync(username);

            if(loginUser != null)
            {
                if(loginUser.Status == 0)
                {
                    return (loginUser.Id, -1); //Tài khoản đã bị khóa
                }

                var salt = loginUser.Salt;
                var storePassword = loginUser.Password;

                var hashPassword = HashingUtil.HashPassword(password, salt);

                if(hashPassword == storePassword)
                {
                    return (loginUser.Id, loginUser.Role);
                }
                else
                {
                    return (null, -1);
                }
            }
            else
            {
                return (null, -1);
            }
        }

        public async Task<string> Register(Users user)
        {
            return "Register succesfully.";
        }
        //Task UpdateAsync(string id, Users user);
        //Task DeleteAsync(string id);
    }
}

using backend.Models;

namespace backend.Services
{
    public interface IUsersService
    {
        //Task<List<Users>> GetAllAsync();
        Task<(string id, int role)> VerifyLogin(string username, string password);
        Task<string> Register(Users user);

        //Task UpdateAsync(string id, Users user);
        //Task DeleteAsync(string id);
    }
}

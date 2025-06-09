using backend.Models;

namespace backend.Interfaces
{
    public interface IUsersService
    {
        //Task<List<Users>> GetAllAsync();
        Task<string?> VerifyLogin(string username, string password);
        Task<string> Register(string username, string fullname, string email, string password, string phoneNumber, DateTime dateOfBirth, int gender);
        Task<bool> Logout(string token);
        //Task UpdateAsync(string id, Users user);
        //Task DeleteAsync(string id);
    }
}

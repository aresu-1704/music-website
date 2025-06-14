using backend.Models;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IArtistService
    {
        Task<string> CreateArtistAsync(string userId, Artists artist);
        Task<string> CheckApproveResult(string userID);
        Task<bool> CancelRegister(string userID);
    }
}

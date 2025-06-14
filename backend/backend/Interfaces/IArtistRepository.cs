using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IArtistRepository
    {
        Task<IEnumerable<Artists>> GetAllAsync();
        Task<Artists> GetByIdAsync(string id);
        Task<Artists> GetByUserIdAsync(string userId);
        Task DeleteByUserIdAsync(string userId);
        Task CreateAsync(Artists artist);
        Task UpdateAsync(string id, Artists artist);
        Task DeleteAsync(string id);
        Task ApproveAsync(string id, bool isApproved);
    }
}

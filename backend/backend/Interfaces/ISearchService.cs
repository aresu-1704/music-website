using backend.Models;

namespace backend.Interfaces
{
    public interface ISearchService
    {
        Task<SearchResultDto> SearchAsync(string query);
    }
}


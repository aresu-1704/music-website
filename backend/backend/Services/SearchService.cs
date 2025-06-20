using backend.Interfaces;
using backend.Models;

namespace backend.Services
{
    public class SearchService : ISearchService
    {
        private readonly ITrackRepository _trackRepository;
        private readonly IUserRepository _userRepository;

        public SearchService(ITrackRepository trackRepository, IUserRepository userRepository)
        {
            _trackRepository = trackRepository;
            _userRepository = userRepository;
        }

        public async Task<SearchResultDto> SearchAsync(string query)
        {
            var tracks = await _trackRepository.SearchByTitleOrArtistAsync(query);
            var users = await _userRepository.SearchByUsernameOrNameAsync(query);

            // Lấy danh sách artistId duy nhất
            var artistIds = tracks.Select(t => t.ArtistId).Distinct().ToList();

            // Lấy thông tin user tương ứng với artistId
            var artists = await _userRepository.GetUsersByIdsAsync(artistIds);
            var artistDict = artists.ToDictionary(u => u.Id, u => u.Name);

            var trackDtos = tracks.Select(track => new TrackSearchDto
            {
                Id = track.Id,
                Title = track.Title,
                ArtistName = artistDict.ContainsKey(track.ArtistId) ? artistDict[track.ArtistId] : null,
                LikeCount = track.LikeCount,
                PlayCount = track.PlayCount,
                ImageBase64 = !string.IsNullOrEmpty(track.Cover)
                    ? $"http://localhost:5270/cover_images/{track.Cover}"
                    : null,
                AudioUrl = $"http://localhost:5270/api/Track/audio/{track.Id}"
            }).ToList();

            return new SearchResultDto
            {
                Tracks = trackDtos,
                Users = users
            };
        }

    }
}

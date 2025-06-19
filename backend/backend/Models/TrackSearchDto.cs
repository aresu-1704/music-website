namespace backend.Models
{
    public class TrackSearchDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string? ArtistId { get; set; }
        public int LikeCount { get; set; }
        public int PlayCount { get; set; }
        public string? ImageBase64 { get; set; }
        public string? AudioUrl { get; set; } // Thêm dòng này
    }
}

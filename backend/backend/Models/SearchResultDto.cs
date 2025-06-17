using System.Collections.Generic;

namespace backend.Models
{
    public class SearchResultDto
    {
        public List<TrackSearchDto> Tracks { get; set; }
        public List<Users> Users { get; set; }
    }
} 
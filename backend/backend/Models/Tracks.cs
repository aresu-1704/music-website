using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Track
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [BsonRequired]
        public string Id { get; set; }

        // ========== Thông tin cơ bản ==========
        [Required(ErrorMessage = "Tên bài hát không được để trống.")]
        [BsonRequired]
        [BsonElement("title")]
        public string Title { get; set; }

        [BsonElement("artist_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ArtistId { get; set; }

        [BsonElement("genres")]
        public string[]? Genres { get; set; }

        // ========== Thông tin file ==========
        [Required(ErrorMessage = "Tên file không được để trống.")]
        [BsonRequired]
        [BsonElement("filename")]
        public string Filename { get; set; }

        [BsonElement("cover_image")]
        public string? Cover { get; set; }

        // ========== Tương tác ==========
        [BsonElement("like_count")]
        public int LikeCount { get; set; } = 0;

        [BsonElement("play_count")]
        public int PlayCount { get; set; } = 0;

        // ========== Phân quyền & trạng thái ==========
        [BsonElement("is_public")]
        public bool IsPublic { get; set; } = true;

        [BsonElement("is_approved")]
        public bool IsApproved { get; set; } = false;


        // ========== Thời gian ==========
        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
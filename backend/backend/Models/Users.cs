using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    public class Users
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [BsonRequired]
        public string Id { get; set; }

        [BsonRequired]
        [BsonElement("fullname")]
        public string Name { get; set; }

        [BsonRequired]
        [BsonElement("username")]
        public string Username { get; set; }

        [BsonRequired]
        [BsonElement("email")]
        public string Email { get; set; }

        [BsonRequired]
        [BsonElement("phone")]
        public string PhoneNumber { get; set; }

        [BsonRequired]
        [BsonElement("password")]
        public string Password { get; set; }

        [BsonElement("salt")]
        public string Salt { get; set; }

        [BsonRequired]
        [BsonElement("dateofbirth")]
        public DateTime DateOfBirth { get; set; }

        [BsonElement("gender")]
        public int Gender { get; set; }

        [BsonElement("login_count")]
        public int LoginCount { get; set; } = 1;

        [BsonElement("status")]
        public int Status { get; set; } = 1;

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("last_login")]
        public DateTime? LastLogin { get; set; }

        [BsonElement("avatar_url")]
        public string? AvatarUrl { get; set; }

        [BsonElement("role")]
        public int Role { get; set; } = 1;

        [BsonElement("is_email_verified")]
        public bool IsEmailVerified { get; set; } = false;

        [BsonElement("is_phone_verified")]
        public bool IsPhoneVerified { get; set; } = false;
    }
}

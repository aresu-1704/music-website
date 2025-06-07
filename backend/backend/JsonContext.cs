using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace backend
{
    [JsonSerializable(typeof(backend.Controllers.LoginRequest))]
    [JsonSerializable(typeof(backend.Controllers.LoginResponse))]
    [JsonSerializable(typeof(backend.Controllers.RegisterRequest))]
    [JsonSerializable(typeof(backend.Controllers.RegisterResponse))]
    [JsonSerializable(typeof(ValidationProblemDetails))]

    public partial class JsonContext : JsonSerializerContext
    {
    }
}

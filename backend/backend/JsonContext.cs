using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace backend
{
    [JsonSerializable(typeof(backend.Controllers.LoginRequest))]
    [JsonSerializable(typeof(backend.Controllers.LoginResponse))]
    [JsonSerializable(typeof(backend.Controllers.RegisterRequest))]
    [JsonSerializable(typeof(backend.Controllers.RegisterResponse))]
    [JsonSerializable(typeof(backend.Controllers.GetProfileDataResponse))]
    [JsonSerializable(typeof(backend.Controllers.PersonalRequest))]
    [JsonSerializable(typeof(backend.Controllers.PaymentInformationModel))]
    [JsonSerializable(typeof(backend.Controllers.PaymentResponseModel))]
    [JsonSerializable(typeof(backend.Controllers.PaymentUrlResponse))]
    [JsonSerializable(typeof(backend.Controllers.UploadTrackRequest))]
    [JsonSerializable(typeof(backend.Controllers.UploadTrackResponse))]
    [JsonSerializable(typeof(backend.Controllers.CreateArtistRequest))]
    [JsonSerializable(typeof(backend.Controllers.CreateArtistResponse))]
    [JsonSerializable(typeof(ValidationProblemDetails))]
    
    public partial class JsonContext : JsonSerializerContext
    {
    }
}

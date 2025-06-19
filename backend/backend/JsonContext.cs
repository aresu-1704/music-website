using backend.Controllers;
using backend.Models;
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
    [JsonSerializable(typeof(backend.Controllers.TrackDetail))]
    [JsonSerializable(typeof(backend.Controllers.SendOtpRequest))]
    [JsonSerializable(typeof(backend.Controllers.VerifyOtpRequest))]
    [JsonSerializable(typeof(backend.Controllers.ResetPasswordRequest))]
    [JsonSerializable(typeof(List<TrackAdminView>))]
    [JsonSerializable(typeof(List<CommentDetail>))]
    [JsonSerializable(typeof(backend.Controllers.AddCommentRequest))]
    [JsonSerializable(typeof(Dictionary<string, string>))]
    [JsonSerializable(typeof(List<TrackThumbnail>))]
    [JsonSerializable(typeof(ProblemDetails))]
    [JsonSerializable(typeof(ValidationProblemDetails))]
    [JsonSerializable(typeof(ApiResponse))]
    [JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
    [JsonSerializable(typeof(FavoriteCheckResponse))]
    [JsonSerializable(typeof(FavoriteToggleResponse))]
    [JsonSerializable(typeof(backend.Models.SearchResultDto))]
    [JsonSerializable(typeof(backend.Models.TrackSearchDto))]
    [JsonSerializable(typeof(List<FavoriteTracksResponse>))]
    [JsonSerializable(typeof(List<HistoryTrackResponse>))]
    [JsonSerializable(typeof(List<TrackInfo>))]

    public partial class JsonContext : JsonSerializerContext
    {
    }
}

using backend;
using backend.Interfaces;
using backend.Models;
using backend.Repositories;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using StackExchange.Redis;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json.Serialization;
using System.Diagnostics;
using Microsoft.Extensions.FileProviders;

void StartRedisIfNotRunning()
{
    var redisProcesses = Process.GetProcessesByName("redis-server");
    if (redisProcesses.Length == 0)
    {
        var redisPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Utils", "Caches", "redis-server.exe");

        if (!File.Exists(redisPath))
        {
            Console.WriteLine($"Redis executable not found at: {redisPath}");
            return;
        }

        var startInfo = new ProcessStartInfo
        {
            FileName = redisPath,
            WorkingDirectory = Path.GetDirectoryName(redisPath),
            UseShellExecute = false,
            CreateNoWindow = true
        };

        try
        {
            Process.Start(startInfo);
            Console.WriteLine("Redis started from local folder.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to start Redis: {ex.Message}");
        }
    }
    else
    {
        Console.WriteLine("Redis is already running.");
    }
}

var builder = WebApplication.CreateBuilder(args);

// Cấu hình MongoDB từ appsettings.json
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddScoped(serviceProvider =>
{
    var settings = serviceProvider.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    var client = serviceProvider.GetRequiredService<IMongoClient>();
    return client.GetDatabase(settings.DatabaseName);
});

// Đăng ký Repository và Service
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUsersService, UsersService>();
builder.Services.AddScoped<IJWTService, JWTService>();
builder.Services.AddScoped<ITokenBlacklistService, RedisTokenBlacklistService>();
builder.Services.AddScoped<IVnPayService, VnPayService>();
builder.Services.AddScoped<ITrackRepository, TrackRepository>();
builder.Services.AddScoped<ITrackService, TrackService>();
builder.Services.AddScoped<IFavoritesRepository, FavoritesRepository>();
builder.Services.AddScoped<IFavoritesService, FavoritesService>();
builder.Services.AddScoped<IHistoryRepository, HistoryRepository>();
builder.Services.AddScoped<IHistoryService, HistoryService>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<IPaymentRecordRepository, PaymentRecordRepository>();
builder.Services.AddScoped<IPaymentRecordService, PaymentRecordService>();

//Redis cache
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var configuration = builder.Configuration.GetValue<string>("Redis:ConnectionString");
    return ConnectionMultiplexer.Connect(configuration);
});

// Add Swagger và Controller
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Musicresu backend API",
        Version = "1.0.0",
        Description = "API backend của website nghe nhạc Musciresu",
        Contact = new OpenApiContact
        {
            Name = "Lý Thuận An",
            Email = "aresu.work1704@gmail.com"
        }
    });
});

var configuration = builder.Configuration;
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = configuration["JWT:Issuer"],            // Tên ứng dụng phát hành token
            ValidAudience = configuration["JWT:Audience"],             // Đối tượng sử dụng token
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["JWT:Key"])),  // Khóa bí mật để xác thực token
            NameClaimType = JwtRegisteredClaimNames.Sub,
            RoleClaimType = "role"
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.StatusCode = 403;
                    context.Response.ContentType = "application/json";
                    return context.Response.WriteAsync("{\"message\": \"Token hết hạn\"}");
                }

                return Task.CompletedTask;
            },

            OnTokenValidated = async context =>
            {
                // Lấy service kiểm tra blacklist token từ DI container
                var tokenBlacklistService = context.HttpContext.RequestServices.GetRequiredService<ITokenBlacklistService>();

                // Lấy claim jti (unique id của token) trong token vừa được xác thực
                var jti = context.Principal?.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)?.Value;

                // Nếu token không có jti thì fail xác thực
                if (string.IsNullOrEmpty(jti))
                {
                    context.Fail("Token does not contain jti");
                    return;
                }

                // Kiểm tra jti này có bị blacklist hay không (ví dụ bị logout trước đó)
                var isBlacklisted = await tokenBlacklistService.IsBlacklistedAsync(jti);

                // Nếu token nằm trong blacklist thì fail xác thực
                if (isBlacklisted)
                {
                    context.Fail("Token is blacklisted");
                }
            }
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // domain frontend
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Cái này tao cũng không biết cấu hình cái gì đừng hỏi tao
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.TypeInfoResolver = JsonContext.Default;
});

StartRedisIfNotRunning();

var app = builder.Build();

// Bật Swagger nếu đang ở môi trường Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowFrontend");
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// Map route cho controller
app.MapControllers();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "storage", "cover_images")),
    RequestPath = "/cover_images"
});

app.Run();

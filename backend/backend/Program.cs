using backend.Models;
using backend.Repositories;
using backend.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using System.Text.Json.Serialization;

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

builder.Services.AddControllers();

var app = builder.Build();

// Bật Swagger nếu đang ở môi trường Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Map route cho controller
app.MapControllers();

app.Run();

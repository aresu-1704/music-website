﻿using backend.Models;

namespace backend.Interfaces
{
    public interface IUsersService
    {
        //Task<List<Users>> GetAllAsync();
        Task<(string?, string?)> VerifyLogin(string username, string password);
        Task<string> Register(string username, string fullname, string email, string password, string phoneNumber, DateTime dateOfBirth, int gender);
        Task<bool> Logout(string token);
        Task<Users> GetProfileInfo(string userID);
        Task<string> UpdatePersonalData(string userID, string fullname, int gender, DateTime dateOfBirth, string avtUrl = null);
        Task<string> UpgradeTier(string userID, string tier);
        Task<bool> SendOtpAsync(string email);
        Task<bool> VerifyOtpAsync(string email, string otp, string newPassword);
        //Task UpdateAsync(string id, Users user);
        //Task DeleteAsync(string id);
    }
}

// services/notificationService.js

const API_BASE = 'http://localhost:5270/api/Notification'; // đổi URL tùy backend

export const getNotificationsByUserId = async (userId) => {
    const res = await fetch(`${API_BASE}/my-notification/${userId}`,{
        method: 'GET'
    });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return await res.json();
};

export const markNotificationAsViewed = async (id) => {
    const res = await fetch(`${API_BASE}/mark-viewed/${id}`, {
        method: 'PUT',
    });
    if (!res.ok) throw new Error("Failed to mark as viewed");
};


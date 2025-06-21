const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api/Notification`;

const authHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
});

export const getNotificationsByUserId = async (userId) => {
    const res = await fetch(`${API_BASE}/my-notification/${userId}`, {
        method: 'GET',
        headers: authHeader(),
    });

    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
};

export const markNotificationAsViewed = async (id) => {
    const res = await fetch(`${API_BASE}/mark-viewed/${id}`, {
        method: 'PUT',
        headers: authHeader(),
    });

    if (!res.ok) throw new Error('Failed to mark as viewed');
};

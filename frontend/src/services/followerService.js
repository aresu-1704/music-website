// services/followerService.js
const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api/Followers`;

const authHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
});

// Theo dõi người dùng
export const followUser = async (userId, handleSessionOut) => {
    const token = localStorage.getItem('token');
    if (!token) return handleSessionOut();

    const res = await fetch(`${API_BASE}/follow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) return handleSessionOut();
    if (!res.ok) throw new Error('Không thể theo dõi người dùng.');
    return { success: true };
};

// Bỏ theo dõi người dùng
export const unfollowUser = async (userId, handleSessionOut) => {
    const token = localStorage.getItem('token');
    if (!token) return handleSessionOut();

    const res = await fetch(`${API_BASE}/unfollow/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) return handleSessionOut();
    if (!res.ok) throw new Error('Không thể bỏ theo dõi người dùng.');
    return { success: true };
};

// Kiểm tra trạng thái follow
export const checkFollowing = async (userId, handleSessionOut) => {
    const token = localStorage.getItem('token');
    if (!token) return handleSessionOut();

    const res = await fetch(`${API_BASE}/check/${userId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) return handleSessionOut();
    if (!res.ok) throw new Error('Không thể kiểm tra trạng thái theo dõi.');
    return await res.json();
};

// Danh sách đang theo dõi
export const getFollowingList = async (userId, handleSessionOut) => {
    const res = await fetch(`${API_BASE}/FollowingList/${userId}`, {
        method: 'GET',
        headers: authHeader(),
    });

    if (res.status === 401 || res.status === 403) return handleSessionOut();
    if (!res.ok) throw new Error('Không thể lấy danh sách đang theo dõi.');
    return await res.json();
};

// Kiểm tra followerId có theo dõi followingId
export const checkUserFollowsAnother = async (followerId, followingId, handleSessionOut) => {
    const res = await fetch(`${API_BASE}/CheckFollowing/${followerId}/${followingId}`, {
        method: 'GET',
        headers: authHeader(),
    });

    if (res.status === 401 || res.status === 403) return handleSessionOut();
    if (!res.ok) throw new Error('Không thể kiểm tra trạng thái theo dõi.');
    return await res.json();
};

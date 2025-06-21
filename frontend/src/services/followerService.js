export const followUser = async (userId, handleSessionOut) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5270/api/Followers/follow/${userId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (res.status === 401 || res.status === 403) {
        handleSessionOut();
        return;
    }
    if (!res.ok) throw new Error('Không thể theo dõi người dùng.');
    return await res.json().catch(() => ({}));
};

export const unfollowUser = async (userId, handleSessionOut) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5270/api/Followers/unfollow/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (res.status === 401 || res.status === 403) {
        handleSessionOut();
        return;
    }
    if (!res.ok) throw new Error('Không thể hủy theo dõi người dùng.');
    return await res.json().catch(() => ({}));
};

export const checkFollowStatus = async (userId, handleSessionOut) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5270/api/Followers/check/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (res.status === 401 || res.status === 403) {
        handleSessionOut();
        return;
    }
    if (!res.ok) throw new Error('Không thể kiểm tra trạng thái theo dõi.');
    return await res.json();
}; 
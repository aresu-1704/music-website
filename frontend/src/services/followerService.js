export const followUser = async (userId, handleSessionOut) => {
    const token = localStorage.getItem('token');
    if (!token) {
        handleSessionOut();
        return;
    }

    const res = await fetch(`http://localhost:5270/api/Followers/follow/${userId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error('Không thể theo dõi người dùng.');
    // Không cần parse JSON vì response trống
    return { success: true };
};

export const unfollowUser = async (userId, handleSessionOut) => {
    const token = localStorage.getItem('token');
    if (!token) {
        handleSessionOut();
        return;
    }

    const res = await fetch(`http://localhost:5270/api/Followers/unfollow/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error('Không thể bỏ theo dõi người dùng.');
    // Không cần parse JSON vì response trống
    return { success: true };
};

export const checkFollowing = async (userId, handleSessionOut) => {
    const token = localStorage.getItem('token');
    if (!token) {
        handleSessionOut();
        return;
    }

    const res = await fetch(`http://localhost:5270/api/Followers/check/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error('Không thể kiểm tra trạng thái theo dõi.');
    return await res.json();
};

export const followerService = {
    // Lấy danh sách người dùng mà user đang theo dõi
    getFollowingList: async (userId) => {
        try {
            const response = await fetch(`http://localhost:5270/api/Followers/FollowingList/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Lỗi khi lấy danh sách theo dõi');
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(error.message || 'Lỗi khi lấy danh sách theo dõi');
        }
    },

    // Kiểm tra xem user có đang theo dõi một người khác không
    checkFollowing: async (followerId, followingId) => {
        try {
            const response = await fetch(`http://localhost:5270/api/Followers/CheckFollowing/${followerId}/${followingId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Lỗi khi kiểm tra trạng thái theo dõi');
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(error.message || 'Lỗi khi kiểm tra trạng thái theo dõi');
        }
    },

    // Theo dõi một người dùng
    followUser: async (followerId, followingId) => {
        try {
            const response = await fetch(`http://localhost:5270/api/Followers/follow/${followingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Lỗi khi theo dõi người dùng');
            }
            
            // Không cần parse JSON vì response trống
            return { success: true };
        } catch (error) {
            throw new Error(error.message || 'Lỗi khi theo dõi người dùng');
        }
    },

    // Bỏ theo dõi một người dùng
    unfollowUser: async (followerId, followingId) => {
        try {
            const response = await fetch(`http://localhost:5270/api/Followers/unfollow/${followingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Lỗi khi bỏ theo dõi người dùng');
            }
            
            // Không cần parse JSON vì response trống
            return { success: true };
        } catch (error) {
            throw new Error(error.message || 'Lỗi khi bỏ theo dõi người dùng');
        }
    }
}; 
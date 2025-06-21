import { useQuery } from "@tanstack/react-query";

export const fetchProfileData = async (userID) => {
    try {
        const res = await fetch(`http://localhost:5270/api/Profile/my-profile/${userID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!res.ok) {
            throw new Error("Không thể tìm thấy dữ liệu người dùng !");
        }

        return res.json();
    }
    catch (error) {
        throw new Error(error.message);
    }
};

export const getProfileData = async (userID) => {
    try {
        const res = await fetch(`http://localhost:5270/api/Profile/profile/${userID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (!res.ok) {
            throw new Error("Không thể tìm thấy dữ liệu người dùng !");
        }

        return res.json();
    }
    catch (error) {
        throw new Error(error.message);
    }
};

export const updatePersonalData = async (userID, data) => {
    try {
        const res = await fetch(`http://localhost:5270/api/Profile/personal/${userID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: data,
        })

        if (res.ok) {
            return "Thành công"
        }

        else if (res.status === 403 ||  res.status === 401) {
            return "Phiên đăng nhập hết hạn";
        }

        else if (res.status === 404) {
            return "Không tìm thấy người dùng";
        }

        else if (res.status === 500) {
            return "Máy chủ bảo trì";
        }
    }
    catch (error) {
        return error.message;
    }
}

export const updatePersonalDataWithAvatar = async (userID, data) => {
    try {
        const res = await fetch(`http://localhost:5270/api/Profile/personal-avt/${userID}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: data,
        })

        if (res.ok) {
            return "Thành công"
        }

        else if (res.status === 403) {
            return "Phiên đăng nhập hết hạn";
        }

        else if (res.status === 404) {
            return "Không tìm thấy người dùng";
        }

        else if (res.status === 500) {
            return "Máy chủ bảo trì";
        }
    }
    catch (error) {
        return "Không thể kết nối đến maáy chủ"
    }
}

export function useUserProfile(userID) {
    return useQuery({
        queryKey: ['profile', userID],
        queryFn: () => fetchProfileData(userID),
        staleTime: 1000 * 60 * 60 * 6,
        refetchOnWindowFocus: false
    });
}

// Admin methods
export const getAllUsers = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5270/api/Profile/admin/all-users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const updateUserStatus = async (userId, status) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5270/api/Profile/admin/update-status/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            const errorData = await response.text();
            console.error('Server error:', errorData);
            throw new Error(`Server error: ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

export const updateUserRole = async (userId, role) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5270/api/Profile/admin/update-role/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role }),
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            const errorData = await response.text();
            console.error('Server error:', errorData);
            throw new Error(`Server error: ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

export async function deleteUserFromDatabase(userId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/profile/admin/delete/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Lỗi xóa user');
    }
    return await response.json();
}
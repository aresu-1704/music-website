import { useQuery } from "@tanstack/react-query";

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api/Profile`;

const authHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const fetchProfileData = async (userID) => {
    const res = await fetch(`${API_BASE}/my-profile/${userID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    if (!res.ok) throw new Error("Không thể tìm thấy dữ liệu người dùng !");
    return await res.json();
};

export const getProfileData = async (userID) => {
    const res = await fetch(`${API_BASE}/profile/${userID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });

    if (!res.ok) throw new Error("Không thể tìm thấy dữ liệu người dùng !");
    return await res.json();
};

export const updatePersonalData = async (userID, data) => {
    try {
        const res = await fetch(`${API_BASE}/personal/${userID}`, {
            method: 'PUT',
            headers: authHeader(),
            body: data,
        });

        if (res.ok) return "Thành công";
        if (res.status === 403 || res.status === 401) return "Phiên đăng nhập hết hạn";
        if (res.status === 404) return "Không tìm thấy người dùng";
        if (res.status === 500) return "Máy chủ bảo trì";
    } catch (error) {
        return error.message;
    }
};

export const updatePersonalDataWithAvatar = async (userID, data) => {
    try {
        const res = await fetch(`${API_BASE}/personal-avt/${userID}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: data,
        });

        if (res.ok) return "Thành công";
        if (res.status === 403) return "Phiên đăng nhập hết hạn";
        if (res.status === 404) return "Không tìm thấy người dùng";
        if (res.status === 500) return "Máy chủ bảo trì";
    } catch (error) {
        return "Không thể kết nối đến máy chủ";
    }
};

export const updateAddress = async (userID, address) => {
    try {
        const res = await fetch(`${API_BASE}/address/${userID}`, {
            method: 'PUT',
            headers: authHeader(),
            body: JSON.stringify({ address }),
        });

        if (res.ok) return 'Thành công';
        if (res.status === 403 || res.status === 401) return 'Phiên đăng nhập hết hạn';
        return 'Lỗi';
    } catch (error) {
        return 'Không thể kết nối đến máy chủ';
    }
};

export const sendVerifyEmailOtp = async (userID) => {
    try {
        const res = await fetch(`${API_BASE}/send-verify-email-otp/${userID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });

        if (res.ok) return 'Đã gửi OTP';
        if (res.status === 403 || res.status === 401) return 'Phiên đăng nhập hết hạn';
        return 'Lỗi';
    } catch (error) {
        return 'Không thể kết nối đến máy chủ';
    }
};

export const verifyEmailOtp = async (userID, otp) => {
    try {
        const res = await fetch(`${API_BASE}/verify-email-otp/${userID}`, {
            method: 'POST',
            headers: authHeader(),
            body: JSON.stringify({ otp }),
        });

        if (res.ok) return 'Xác minh thành công';
        if (res.status === 403 || res.status === 401) return 'Phiên đăng nhập hết hạn';
        return 'Lỗi';
    } catch (error) {
        return 'Không thể kết nối đến máy chủ';
    }
};

export function useUserProfile(userID) {
    return useQuery({
        queryKey: ['profile', userID],
        queryFn: () => fetchProfileData(userID),
        staleTime: 1000 * 60 * 60 * 6,
        refetchOnWindowFocus: false
    });
}

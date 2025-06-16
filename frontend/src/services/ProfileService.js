import { useQuery } from "@tanstack/react-query";

export const fetchProfileData = async (userID) => {
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
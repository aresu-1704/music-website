import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api/VnPay`;

export const getPaymentsUrl = async (data) => {
    try {
        const res = await fetch(`${API_BASE}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: data, // ← bạn đã stringify rồi, giữ nguyên
        });

        if (res.status === 403) {
            return { success: false, message: 'Phiên đăng nhập hết hạn' };
        }

        if (res.status === 500 || res.status === 404) {
            return { success: false, message: 'Máy chủ đang bảo trì' };
        }

        if (res.ok) {
            const json = await res.json();
            return { success: true, data: json };
        }

        return { success: false, message: 'Lỗi không xác định' };
    } catch (err) {
        return { success: false, message: err.message };
    }
};

export const fetchPaymentResult = async (searchParams) => {
    const url = `${API_BASE}/return${searchParams}`;

    const responseCode = new URLSearchParams(searchParams).get('vnp_ResponseCode');
    const transactionStatus = new URLSearchParams(searchParams).get('vnp_TransactionStatus');

    const success = responseCode === '00' && transactionStatus === '00';

    const response = await axios.get(url);
    return {
        ...response.data,
        success,
    };
};


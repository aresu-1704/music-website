const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api/Track`;
const PROFILE_API = `${process.env.REACT_APP_API_BASE_URL}/api/Profile`;

const authHeader = () => ({
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
});

// Upload track
export const uploadTrack = async (formData, handleSessionOut) => {
    try {
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData,
            headers: authHeader(),
        });

        const data = await res.text();
        if (res.status === 401 || res.status === 403) handleSessionOut();
        if (!res.ok) throw new Error(data);
        return data;
    } catch (err) {
        throw err;
    }
};

export const getTopTracks = async () => {
    const res = await fetch(`${API_BASE}/top-played`);
    if (res.ok) return res.json();
    return { success: false, status: res.status };
};

export const getTopLikeTracks = async () => {
    const res = await fetch(`${API_BASE}/top-like`);
    if (res.ok) return res.json();
    return { success: false, status: res.status };
};

export const getTrackById = async (id) => {
    const res = await fetch(`${API_BASE}/track-info/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy bài hát.');
    return res.json();
};

export const updateTrackPlayCount = async (id) => {
    const res = await fetch(`${API_BASE}/play-count/${id}`, { method: 'PUT' });
    if (!res.ok) throw new Error('Có lỗi xảy ra.');
};

export const getTrackDetail = async (trackId) => {
    const res = await fetch(`${API_BASE}/track-detail/${trackId}`);
    if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
    return res.json();
};

export const getTracksByArtistId = async (profileId) => {
    const res = await fetch(`${PROFILE_API}/my-tracks/${profileId}`);
    if (!res.ok) throw new Error('Không thể lấy danh sách bài hát.');
    return res.json();
};

export const getAllTracks = async () => {
    const res = await fetch(`${API_BASE}/all-track`);
    if (!res.ok) throw new Error('Lấy dữ liệu thất bại');
    return res.json();
};

export const changeApprove = async (trackId) => {
    const res = await fetch(`${API_BASE}/approve/${trackId}`, { method: 'PUT' });
    if (!res.ok) throw new Error('Cập nhật thất bại');
};

export const changePublic = async (trackId) => {
    const res = await fetch(`${API_BASE}/public/${trackId}`, { method: 'PUT' });
    if (!res.ok) throw new Error('Cập nhật thất bại');
};

export const deleteTrack = async (trackId, handleSessionOut) => {
    const res = await fetch(`${API_BASE}/delete/${trackId}`, {
        method: 'DELETE',
        headers: {
            ...authHeader(),
            'Content-Type': 'application/json',
        }
    });

    if (res.status === 401 || res.status === 403) {
        handleSessionOut();
    } else if (!res.ok) {
        throw new Error(res.statusText);
    }
};

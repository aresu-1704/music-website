const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api/Track`;

export async function getRecommendTrack(userId, handleSessionOut) {
    const res = await fetch(`${API_BASE}/recommend-track/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (res.status === 200) {
        return await res.json();
    }

    if (res.status === 401 || res.status === 403) {
        handleSessionOut();
    }

    return { success: false, status: res.status };
}

const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/History`;

const authHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const getUserHistory = async (userId) => {
    const res = await fetch(`${BASE_URL}/user/${userId}`, {
        headers: authHeader(),
    });

    if (!res.ok) {
        console.error('Error fetching user history:', res.statusText);
        throw new Error('Failed to fetch history');
    }

    return await res.json();
};

export const deleteHistoryTrack = async (trackId) => {
    const res = await fetch(`${BASE_URL}/delete/${trackId}`, {
        method: 'DELETE',
        headers: authHeader(),
    });

    if (!res.ok) {
        console.error('Error deleting history track:', res.statusText);
        throw new Error('Failed to delete history track');
    }

    return true;
};

export const deleteAllHistory = async () => {
    const res = await fetch(`${BASE_URL}/delete-all`, {
        method: 'DELETE',
        headers: authHeader(),
    });

    if (!res.ok) {
        console.error('Error deleting all history:', res.statusText);
        throw new Error('Failed to delete all history');
    }

    return true;
};

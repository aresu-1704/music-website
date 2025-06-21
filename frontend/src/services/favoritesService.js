const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api/Favorites`;

const authHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const checkUserIsFavorites = async (trackId) => {
    const res = await fetch(`${API_BASE}/check/${trackId}`, {
        method: 'GET',
        headers: authHeader(),
    });

    if (res.status === 200) {
        return await res.json();
    }

    if (res.status === 401 || res.status === 403) {
        return false;
    }

    return null;
};

export const toggleFavorites = async (trackId, handleSessionOut) => {
    const res = await fetch(`${API_BASE}/toggle/${trackId}`, {
        method: 'POST',
        headers: authHeader(),
    });

    if (res.status === 401 || res.status === 403) {
        handleSessionOut();
    }

    return res.ok;
};

export const getMyFavoriteTracks = async (handleSessionOut) => {
    const res = await fetch(`${API_BASE}/my-tracks`, {
        method: 'GET',
        headers: authHeader(),
    });

    if (res.status === 200) {
        return await res.json();
    }

    if (res.status === 401 || res.status === 403) {
        handleSessionOut();
    }

    return [];
};

export const deleteAllFavorites = async (handleSessionOut) => {
    const res = await fetch(`${API_BASE}/delete-all`, {
        method: 'DELETE',
        headers: authHeader(),
    });

    if (res.status === 401 || res.status === 403) {
        handleSessionOut();
        return false;
    }

    return res.status === 200;
};

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api/Playlist`;

const authHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const getUserPlaylists = async (userId) => {
    const res = await fetch(`${API_BASE}/user/${userId}`, {
        method: 'GET',
        headers: authHeader(),
    });

    if (!res.ok) throw new Error('Failed to fetch playlists');
    return await res.json();
};

export const getPlaylistDetail = async (playlistId) => {
    const res = await fetch(`${API_BASE}/${playlistId}`, {
        method: 'GET',
        headers: authHeader(),
    });

    if (!res.ok) throw new Error('Failed to fetch playlist detail');
    return await res.json();
};

export const createPlaylist = async (playlistData) => {
    const res = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(playlistData),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create playlist');
    }

    return await res.json();
};

export const updatePlaylist = async (playlistId, playlistData) => {
    const res = await fetch(`${API_BASE}/${playlistId}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(playlistData),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update playlist');
    }

    return await res.json();
};

export const deletePlaylist = async (playlistId) => {
    const res = await fetch(`${API_BASE}/${playlistId}`, {
        method: 'DELETE',
        headers: authHeader(),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete playlist');
    }

    return await res.json();
};

export const addTrackToPlaylist = async (playlistId, trackId) => {
    const res = await fetch(`${API_BASE}/${playlistId}/tracks`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ trackId }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add track to playlist');
    }

    return await res.json();
};

export const removeTrackFromPlaylist = async (playlistId, trackId) => {
    const res = await fetch(`${API_BASE}/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE',
        headers: authHeader(),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to remove track from playlist');
    }

    return await res.json();
};

export const getUserPlaylistLimits = async (userId) => {
    const res = await fetch(`${API_BASE}/limits/${userId}`, {
        method: 'GET',
        headers: authHeader(),
    });

    if (!res.ok) throw new Error('Failed to fetch playlist limits');
    return await res.json();
};

export const checkUserIsFavorites = async (trackId, handleSessionOut) => {
    const res = await fetch(`http://localhost:5270/api/Favorites/check/${trackId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
        }
    })

    if (res.status === 200) {
        return await res.json();
    }

    else if (res.status === 401 ||  res.status === 403) {
        handleSessionOut()
    }
}

export const toggleFavorites = async (trackId, handleSessionOut) => {
    const res = await fetch(`http://localhost:5270/api/Favorites/toggle/${trackId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
        }
    })

    if (res.status === 401 || res.status === 403) {
        handleSessionOut()
    }
}

export const getMyFavoriteTracks = async (handleSessionOut) => {
    const res = await fetch('http://localhost:5270/api/Favorites/my-tracks', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
        }
    });

    if (res.status === 200) {
        return await res.json();
    } else if (res.status === 401 || res.status === 403) {
        handleSessionOut();
    } else {
        return [];
    }
}

export const deleteAllFavorites = async (handleSessionOut) => {
    const res = await fetch('http://localhost:5270/api/Favorites/delete-all', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
        }
    });
    const text = await res.text();
    console.log('Delete all favorites status:', res.status, text);
    if (res.status === 401 || res.status === 403) {
        handleSessionOut();
    }
    return res.status === 200;
}
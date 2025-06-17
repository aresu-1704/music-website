

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
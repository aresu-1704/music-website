
export async function getTopTracks() {
    const res = await fetch('http://localhost:5270/api/Track/top-played', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (res.status === 200) {
        return res.json();
    }

    else {
        return { success: false, status: res.status };
    }
}

export async function getTopLikeTracks() {
    const res = await fetch('http://localhost:5270/api/Track/top-like', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (res.status === 200) {
        return res.json();
    }

    else {
        return { success: false, status: res.status };
    }
}


export const getTrackById = async (id) => {
    const res = await fetch(`http://localhost:5270/api/Track/track-info/${id}`, {
        method: 'GET',
    });

    if (!res.ok) {
        throw new Error('Không tìm thấy bài hát.');
    }

    return await res.json();
};

export const updateTrackPlayCount = async (id) => {
    const res = await fetch(`http://localhost:5270/api/Track/play-count/${id}`, {
        method: 'PUT',
    });

    if (!res.ok) {
        throw new Error('Có lỗi xảy ra.');
    }
}
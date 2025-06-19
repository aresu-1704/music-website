
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

export const getTrackDetail = async (trackId) => {
    const response = await fetch(`http://localhost:5270/api/Track/track-detail/${trackId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
};

export const getAllTracks = async () => {
    const res = await fetch('http://localhost:5270/api/Track/all-track', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if (res.status !== 200) {
        throw new Error("Lấy dữ liệu thất bại");
    }

    return res.json();
}

export const changeApprove = async (trackId) => {
    const res = await fetch(`http://localhost:5270/api/Track/approve/${trackId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if (res.status !== 200) {
        throw new Error("Cập nhật thất bại");
    }
}


export const changePublic = async (trackId) => {
    const res = await fetch(`http://localhost:5270/api/Track/public/${trackId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if (res.status !== 200) {
        throw new Error("Cập nhật thất bại");
    }
}


export const updateHistory = async (trackId, handleSessionOut) => {
    var res = await fetch(`http://localhost:5270/api/History/play/${trackId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
    })

    if (!res.status === 401) {
        handleSessionOut()
    }
}
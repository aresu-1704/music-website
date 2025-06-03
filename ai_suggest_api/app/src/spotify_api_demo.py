import base64
import requests

# === THAY BẰNG Client ID và Client Secret của bạn ===
CLIENT_ID = '89245380144a4d8d8fd7502b86484b49'
CLIENT_SECRET = '717c855c59a745d3b1e70f9dcdd01a59'

# === Hàm lấy access token ===
def get_access_token():
    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()

    headers = {
        "Authorization": f"Basic {b64_auth_str}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {
        "grant_type": "client_credentials"
    }

    response = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)

    if response.status_code != 200:
        raise Exception("Failed to get access token:", response.text)

    token = response.json()["access_token"]
    return token

# === Hàm tìm bài hát theo tên ===
def search_track(track_name, token):
    headers = {
        "Authorization": f"Bearer {token}"
    }

    params = {
        "q": track_name,
        "type": "track",
        "limit": 1
    }

    response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)

    if response.status_code != 200:
        raise Exception("Failed to search track:", response.text)

    track = response.json()["tracks"]["items"][0]
    return {
        "name": track["name"],
        "artist": track["artists"][0]["name"],
        "album": track["album"]["name"],
        "preview_url": track["preview_url"],
        "spotify_url": track["external_urls"]["spotify"]
    }

# === Chạy thử ===
if __name__ == "__main__":
    token = get_access_token()
    result = search_track("Shape of You", token)

    print("🎵 Tên bài hát:", result["name"])
    print("👤 Ca sĩ:", result["artist"])
    print("💿 Album:", result["album"])
    print("▶️ Nghe thử:", result["preview_url"])
    print("🔗 Spotify:", result["spotify_url"])

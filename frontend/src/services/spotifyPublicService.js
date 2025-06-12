const BACKEND_URL = 'http://localhost:5000';

let accessToken = null;
let refreshToken = null;
let tokenExpire = 0;

export async function getSpotifyLoginUrl() {
  const response = await fetch(`${BACKEND_URL}/api/spotify/login`);
  const data = await response.json();
  return data.authUrl;
}

export async function handleCallback(code) {
  const response = await fetch(`${BACKEND_URL}/api/spotify/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });
  const data = await response.json();
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  tokenExpire = Date.now() + (data.expires_in - 60) * 1000;
  return data;
}

async function refreshAccessToken() {
  if (!refreshToken) throw new Error('No refresh token available');
  
  const response = await fetch(`${BACKEND_URL}/api/spotify/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const data = await response.json();
  accessToken = data.access_token;
  tokenExpire = Date.now() + (data.expires_in - 60) * 1000;
  return data;
}

async function getValidToken() {
  if (!accessToken) {
    throw new Error('Not authenticated');
  }
  
  if (Date.now() >= tokenExpire) {
    await refreshAccessToken();
  }
  
  return accessToken;
}

export async function getFeaturedPlaylists() {
  const token = await getValidToken();
  const res = await fetch('https://api.spotify.com/v1/browse/featured-playlists?limit=12', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return (await res.json()).playlists.items;
}

export async function getPlaylistTracks(playlistId) {
  const token = await getValidToken();
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return (await res.json()).items;
}

export async function getTopTracks() {
  const token = await getValidToken();
  const res = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=5', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return (await res.json()).items;
}

export async function createPlaylist(name, description, tracksUri) {
  const token = await getValidToken();
  
  // First get user ID
  const userRes = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const { id: userId } = await userRes.json();

  // Create playlist
  const playlistRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      description,
      public: false
    })
  });
  const playlist = await playlistRes.json();

  // Add tracks to playlist
  await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(',')}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  return playlist;
}

export async function getNewReleases() {
  const token = await getValidToken();
  const res = await fetch('https://api.spotify.com/v1/browse/new-releases?limit=10', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return (await res.json()).albums.items;
}

export async function getRecommendations(seedTracks) {
  const token = await getValidToken();
  const res = await fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${seedTracks.join(',')}&limit=10`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return (await res.json()).tracks;
}
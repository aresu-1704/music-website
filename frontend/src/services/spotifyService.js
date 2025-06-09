const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const CLIENT_ID = '27490114471042cc9f5d6c427e460780';
const REDIRECT_URI = "http://127.0.0.1:3000/callback";

// Get access token from URL hash
const getAccessToken = () => {
  const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce((initial, item) => {
      let parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});

  if (hash.access_token) {
    localStorage.setItem('spotify_token', hash.access_token);
    return hash.access_token;
  }

  return localStorage.getItem('spotify_token');
};

// Login to Spotify
export const loginToSpotify = () => {
  const scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private';
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  
  const params = {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: scope,
    response_type: 'token',
    show_dialog: true
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
};

export const fetchWebApi = async (endpoint, method, body) => {
  const token = getAccessToken();
  if (!token) {
    loginToSpotify();
    return null;
  }

  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
      if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('spotify_token');
        loginToSpotify();
        return null;
      }
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching from Spotify API:', error);
    throw error;
  }
};

export const getTopTracks = async () => {
  try {
    const response = await fetchWebApi(
      'me/top/tracks?time_range=long_term&limit=5',
      'GET'
    );
    return response?.items || [];
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return [];
  }
};

export const getNewReleases = async () => {
  try {
    const response = await fetchWebApi(
      'browse/new-releases?limit=20',
      'GET'
    );
    return response?.albums?.items || [];
  } catch (error) {
    console.error('Error fetching new releases:', error);
    return [];
  }
};

export const getRecommendations = async () => {
  try {
    const response = await fetchWebApi(
      'recommendations?limit=20&seed_genres=pop',
      'GET'
    );
    return response?.tracks || [];
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

export const searchTracks = async (query) => {
  try {
    const response = await fetchWebApi(
      `search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      'GET'
    );
    return response?.tracks?.items || [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

export const searchAlbums = async (query) => {
  try {
    const response = await fetchWebApi(
      `search?q=${encodeURIComponent(query)}&type=album&limit=20`,
      'GET'
    );
    return response?.albums?.items || [];
  } catch (error) {
    console.error('Error searching albums:', error);
    return [];
  }
};

export const createPlaylist = async (tracksUri) => {
  try {
    const { id: user_id } = await fetchWebApi('me', 'GET');
    if (!user_id) return null;

    const playlist = await fetchWebApi(
      `users/${user_id}/playlists`,
      'POST',
      {
        name: "My top tracks playlist",
        description: "Playlist created by Musicresu",
        public: false
      }
    );

    if (playlist?.id) {
      await fetchWebApi(
        `playlists/${playlist.id}/tracks?uris=${tracksUri.join(',')}`,
        'POST'
      );
    }

    return playlist;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
}; 
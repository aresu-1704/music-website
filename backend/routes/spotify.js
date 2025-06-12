const express = require('express');
const router = express.Router();
const axios = require('axios');

const CLIENT_ID = '27490114471042cc9f5d6c427e460780';
const CLIENT_SECRET = '4222264d8434410e82146cd8f135bde9';
const REDIRECT_URI = 'http://localhost:3000/callback';

// Get Spotify login URL
router.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private';
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(scope)}`;
  res.json({ authUrl });
});

// Handle callback and get access token
router.post('/token', async (req, res) => {
  const { code } = req.body;
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error getting token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get access token' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router; 
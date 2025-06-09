const express = require('express');
const router = express.Router();
const axios = require('axios');

const CLIENT_ID = '27490114471042cc9f5d6c427e460780';
const CLIENT_SECRET = ''; // Add your client secret here

// Get Spotify access token
router.get('/token', async (req, res) => {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    res.status(500).json({ error: 'Failed to get Spotify token' });
  }
});

module.exports = router; 
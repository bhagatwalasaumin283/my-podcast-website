// =================================================================
//                 COMPLETE BACKEND/SERVER.JS FILE
// =================================================================

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing

// --- SPOTIFY API LOGIC ---
let spotifyAccessToken = '';

const getSpotifyAccessToken = async () => {
    // This function gets a new access token from Spotify
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
            }
        });
        console.log('Successfully refreshed Spotify token.');
        spotifyAccessToken = response.data.access_token;
    } catch (error) {
        console.error('Error getting Spotify access token:', error.response ? error.response.data : error.message);
    }
};

const fetchSpotifyAPI = async (url) => {
    // This function makes a request to Spotify and automatically refreshes the token if it has expired
    try {
        const response = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + spotifyAccessToken } });
        return response;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('Spotify token expired, refreshing...');
            await getSpotifyAccessToken();
            // Retry the original request with the new token
            const response = await axios.get(url, { headers: { 'Authorization': 'Bearer ' + spotifyAccessToken } });
            return response;
        }
        // For other errors, just re-throw them
        throw error;
    }
};

// --- API ENDPOINTS ---

// Endpoint for the company bio and host information
app.get('/api/bio', (req, res) => {
    res.json({
        podcastName: "A Little Perspective",
        companyBio: "All of us have a story to tell. We have our unique perspective towards life, its challenges, situations, etc. and this podcast is here to understand and share those perspectives with all of you. A podcast where hosts, Nikhil and Pranav seek to engage with people and have meaningful conversations to get insight into how they see life through their eyes. Join them on their journey, to build an atmosphere where people can be themselves, they can feel they've been heard and in the end, leave you with…A Little Perspective",
        hosts: [
            { 
                name: "Host One", 
                bio: "Bio of the first host, who specializes in cutting-edge technology.",
                image: "/images/nikhil.png"
            },
            {  
                name: "Host Two", 
                bio: "Bio of the second host, who brings a creative perspective to the conversation.",
                image: "/images/pranav.png"
            }
        ]
    });
});

// ======================= NEW ENDPOINT ADDED HERE =======================
// Endpoint for the main show details (including genres)
app.get('/api/spotify-show-details', async (req, res) => {
    if (!spotifyAccessToken) {
        await getSpotifyAccessToken();
    }
    try {
        const response = await fetchSpotifyAPI(`https://api.spotify.com/v1/shows/${process.env.SPOTIFY_SHOW_ID}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching show details from Spotify:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch show details from Spotify' });
    }
});
// =======================================================================

// Endpoint for all Spotify episodes for a given show
app.get('/api/spotify-episodes', async (req, res) => {
    if (!spotifyAccessToken) {
        await getSpotifyAccessToken();
    }
    try {
        const response = await fetchSpotifyAPI(`https://api.spotify.com/v1/shows/${process.env.SPOTIFY_SHOW_ID}/episodes?limit=50`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching episodes from Spotify:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch episodes from Spotify' });
    }
});

// Endpoint for YouTube videos from a given channel
app.get('/api/youtube-videos', async (req, res) => {
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&channelId=${process.env.YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=50`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching from YouTube:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch videos from YouTube' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
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
                name: "Nikhil Kumar", 
                bio: "Utterly curious guy who loves having meaningful conversations with people in this game called LIFE. You will find me in the gym, chiseling myself bit by bit everyday. I have been fortune enough to surround myself with like minded people who focus on the light they see not the darkness that surrounds them. Btw my name is Nikhil but you can call me Nick.",
                image: "/images/nikhil.jpeg"
            },
            {  
                name: "Pranav Sud", 
                bio: "I am Pranav Kanwal Sud — a finance major at the University of Regina, almost at the finish line of my degree, and stepping into the worlds of finance and entrepreneurship. I also co-host A Little Perspective, a podcast where I get to sit down with people, hear their stories, and share lessons that stick. Outside of work and school, you will probably find me in the gym chasing PRs, running marathons, kicking a ball around on the soccer field, or hiking new trails. I\’m big on consistency, discipline, and always bettering myself — but I also love spending time with close friends and family. For me, it’s all about growth, connection, and finding balance between building big things and enjoying the little moments.",
                image: "/images/pranav.jpeg"
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
        const channelId = process.env.YOUTUBE_CHANNEL_ID;
        if (!channelId) {
            throw new Error("YouTube Channel ID is not defined in .env file");
        }
        
        const uploadsPlaylistId = 'UU' + channelId.substring(2);

        // --- STEP 1: Fetch ALL video IDs using a pagination loop ---
        let allVideoIds = [];
        let nextPageToken = null;
        let pagesFetched = 0;
        
        console.log('Starting to fetch all YouTube video IDs...');

        do {
            // Construct the URL for the current page
            let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&key=${process.env.YOUTUBE_API_KEY}&maxResults=50`;
            if (nextPageToken) {
                playlistUrl += `&pageToken=${nextPageToken}`;
            }

            const playlistResponse = await axios.get(playlistUrl);
            const data = playlistResponse.data;

            // Add the IDs from this page to our master list
            const idsFromThisPage = data.items
                .map(item => item.snippet?.resourceId?.videoId)
                .filter(id => id);
            
            allVideoIds.push(...idsFromThisPage);

            // Get the token for the NEXT page
            nextPageToken = data.nextPageToken;
            pagesFetched++;
            console.log(`Fetched page ${pagesFetched}. Total IDs so far: ${allVideoIds.length}`);

        } while (nextPageToken); // Loop as long as there is a next page

        console.log(`Finished fetching. Found ${allVideoIds.length} total video IDs.`);

        if (allVideoIds.length === 0) {
            return res.json({ items: [] });
        }

        // --- STEP 2: Get video details for ALL IDs (in batches of 50) ---
        let allVideoDetails = [];
        // YouTube API's 'videos' endpoint can only take 50 IDs at a time.
        for (let i = 0; i < allVideoIds.length; i += 50) {
            const idBatch = allVideoIds.slice(i, i + 50);
            const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${idBatch.join(',')}&key=${process.env.YOUTUBE_API_KEY}`;
            const videosResponse = await axios.get(videosUrl);
            allVideoDetails.push(...videosResponse.data.items);
        }

        // --- STEP 3: Filter out the Shorts from the complete list ---
        const longFormVideos = allVideoDetails.filter(video => {
            const duration = video.contentDetails.duration;
            const durationRegex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
            const matches = duration.match(durationRegex);
            const hours = parseInt(matches[1] || 0);
            const minutes = parseInt(matches[2] || 0);
            const seconds = parseInt(matches[3] || 0);
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            return totalSeconds > 120; // Filter out videos under 70 seconds
        });

        // --- STEP 4: Format the final data for the frontend ---
        const formattedVideos = longFormVideos.map(video => ({
            snippet: video.snippet,
            id: {
                kind: "youtube#video",
                videoId: video.id
            }
        }));

        res.json({ items: formattedVideos });

    } catch (error) {
        console.error('Error fetching from YouTube:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch videos from YouTube' });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
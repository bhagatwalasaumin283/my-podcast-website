import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './HomePage.css';

const HomePage = () => {
    const [latestSpotify, setLatestSpotify] = useState(null);
    const [latestYouTube, setLatestYouTube] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestEpisodes = async () => {
            try {
                // Fetch latest Spotify episode
                const spotifyRes = await axios.get('http://localhost:5001/api/spotify-episodes');
                setLatestSpotify(spotifyRes.data.items[0]);

                // Fetch latest YouTube video
                const youtubeRes = await axios.get('http://localhost:5001/api/youtube-videos');
                // Ensure the item is a video before setting it
                const firstVideo = youtubeRes.data.items.find(item => item.id.kind === "youtube#video");
                setLatestYouTube(firstVideo);

            } catch (error) {
                console.error("Error fetching latest episodes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestEpisodes();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="home-page">
            <h1>Welcome to the Podcast</h1>
            <p>Listen to our latest episodes from Spotify and YouTube right here.</p>
            
            <div className="latest-episodes">
                {latestSpotify && (
                    <div className="episode-card">
                        <h3>Latest from Spotify</h3>
                        <h4>{latestSpotify.name}</h4>
                        <iframe 
                            src={`https://open.spotify.com/embed/episode/${latestSpotify.id}`} 
                            width="100%" 
                            height="232" 
                            frameBorder="0" 
                            allow="encrypted-media"
                            title="Spotify Player">
                        </iframe>
                    </div>
                )}
                {latestYouTube && (
                    <div className="episode-card">
                        <h3>Latest from YouTube</h3>
                        <h4>{latestYouTube.snippet.title}</h4>
                        <iframe 
                            width="100%" 
                            height="315" 
                            src={`https://www.youtube.com/embed/${latestYouTube.id.videoId}`} 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen>
                        </iframe>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
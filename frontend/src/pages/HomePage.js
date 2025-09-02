import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './HomePage.css';

// IMPORT THE ICONS AND TITLE IMAGE
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';
import titleImage from '../assets/title.jpeg';

const HomePage = () => {
    const [latestSpotify, setLatestSpotify] = useState(null);
    const [latestYouTube, setLatestYouTube] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestEpisodes = async () => {
            setLoading(true);
            try {
                const [spotifyRes, youtubeRes] = await Promise.all([
                    axios.get('/api/spotify-episodes'),
                    axios.get('/api/youtube-videos')
                ]);

                if (spotifyRes.data?.items) {
                    const firstValidEpisode = spotifyRes.data.items.find(ep => 
                        ep && ep.id && ep.name && ep.images && ep.images.length > 0
                    );
                    setLatestSpotify(firstValidEpisode);
                }
                
                if (youtubeRes.data?.items?.length > 0) {
                    const firstValidVideo = youtubeRes.data.items.find(item => item?.id?.videoId);
                    setLatestYouTube(firstValidVideo);
                }
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
            <div className="title-image-container">
                <img src={titleImage} alt="A Little Perspective Podcast Title" className="title-image" />
                <div className="social-links">
                    <a href="https://www.instagram.com/alittleperspective__" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <FaInstagram />
                    </a>
                    <a href="https://www.tiktok.com/@alittleperspectiv?_t=ZS-8yzqoRnpgS0&_r=1" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                        <FaTiktok />
                    </a>
                    <a href="https://www.youtube.com/@alittleperspective1626" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <FaYoutube />
                    </a>
                </div>
            </div>

            <div className="latest-episodes-container">
                <h2>Latest Episodes</h2>
                <div className="latest-episodes">
                    {/* Spotify Card */}
                    <div className="episode-card">
                        <h3>Latest from Spotify</h3>
                        {latestSpotify ? (
                            <>
                                <h4>{latestSpotify.name}</h4>
                                <iframe src={`https://open.spotify.com/embed/episode/${latestSpotify.id}`} width="100%" height="232" frameBorder="0" allow="encrypted-media" title="Spotify Player"></iframe>
                            </>
                        ) : ( <p>Could not load the latest episode from Spotify.</p> )}
                    </div>
                    {/* YouTube Card */}
                    <div className="episode-card">
                        <h3>Latest from YouTube</h3>
                        {latestYouTube ? (
                            <>
                                <h4>{latestYouTube.snippet.title}</h4>
                                <iframe width="100%" height="232" src={`https://www.youtube.com/embed/${latestYouTube.id.videoId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            </>
                        ) : ( <p>Could not load the latest video from YouTube.</p> )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
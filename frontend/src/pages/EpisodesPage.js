import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './EpisodesPage.css';

const EpisodesPage = () => {
    // State for the original, complete lists from the APIs
    const [allSpotifyEpisodes, setAllSpotifyEpisodes] = useState([]);
    const [allYoutubeVideos, setAllYoutubeVideos] = useState([]);
    
    // State for the filtered lists that are actually displayed
    const [filteredSpotify, setFilteredSpotify] = useState([]);
    const [filteredYoutube, setFilteredYoutube] = useState([]);

    // State to hold the user's current search term
    const [searchQuery, setSearchQuery] = useState('');
    
    // State to track the active tab ('spotify' or 'youtube')
    const [activeView, setActiveView] = useState('spotify'); 

    const [loading, setLoading] = useState(true);

    // This effect runs only ONCE to fetch all initial data
    useEffect(() => {
        const fetchAllEpisodes = async () => {
            setLoading(true);
            try {
                const [spotifyRes, youtubeRes] = await Promise.all([
                    axios.get('/api/spotify-episodes'),
                    axios.get('/api/youtube-videos')
                ]);

                if (spotifyRes.data && spotifyRes.data.items) {
                    setAllSpotifyEpisodes(spotifyRes.data.items);
                    setFilteredSpotify(spotifyRes.data.items); // Set initial display list
                }
                if (youtubeRes.data && youtubeRes.data.items) {
                    setAllYoutubeVideos(youtubeRes.data.items);
                    setFilteredYoutube(youtubeRes.data.items); // Set initial display list
                }
            } catch (error) {
                console.error("Failed to fetch episodes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllEpisodes();
    }, []);

    // This effect runs whenever the user types in the search bar
    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();

        // Filter Spotify list
        const spotifyResults = allSpotifyEpisodes.filter(episode =>
            episode.name.toLowerCase().includes(lowercasedQuery) ||
            episode.description.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredSpotify(spotifyResults);

        // Filter YouTube list
        const youtubeResults = allYoutubeVideos.filter(video =>
            video.snippet.title.toLowerCase().includes(lowercasedQuery) ||
            video.snippet.description.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredYoutube(youtubeResults);

    }, [searchQuery, allSpotifyEpisodes, allYoutubeVideos]); // Re-run when query or master lists change

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="episodes-page">
            <h1>All Episodes</h1>

            {/* --- SEARCH BAR --- */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search for an episode by title or topic..."
                    className="search-input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {/* --- SUB-NAVIGATION TABS --- */}
            <div className="view-switcher">
                <button
                    className={`view-btn ${activeView === 'spotify' ? 'active' : ''}`}
                    onClick={() => setActiveView('spotify')}
                >
                    Spotify ({filteredSpotify.length})
                </button>
                <button
                    className={`view-btn ${activeView === 'youtube' ? 'active' : ''}`}
                    onClick={() => setActiveView('youtube')}
                >
                    YouTube ({filteredYoutube.length})
                </button>
            </div>

            {/* --- CONDITIONAL RENDERING OF FILTERED LISTS --- */}
            {activeView === 'spotify' && (
                <section>
                    <h2>From Spotify</h2>
                    {filteredSpotify.length > 0 ? (
                        <div className="episodes-grid">
                            {filteredSpotify.map(ep => (
                                // ... Spotify episode item JSX ...
                                <div key={ep.id} className="episode-item">
                                    <img src={ep.images[1]?.url} alt={ep.name} />
                                    <h3>{ep.name}</h3>
                                    <p className="release-date">{new Date(ep.release_date).toDateString()}</p>
                                    <details>
                                        <summary>Show Description & Player</summary>
                                        <p className="description">{ep.description}</p>
                                        <iframe src={`https://open.spotify.com/embed/episode/${ep.id}`} width="100%" height="152" frameBorder="0" allow="encrypted-media" title={ep.name}></iframe>
                                    </details>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No episodes found matching your search for "{searchQuery}".</p>
                    )}
                </section>
            )}

            {activeView === 'youtube' && (
                <section>
                    <h2>From YouTube</h2>
                    {filteredYoutube.length > 0 ? (
                        <div className="episodes-grid">
                            {filteredYoutube.map(vid => (
                                // ... YouTube episode item JSX ...
                                <div key={vid.id.videoId} className="episode-item">
                                    <img src={vid.snippet.thumbnails.medium.url} alt={vid.snippet.title} />
                                    <h3>{vid.snippet.title}</h3>
                                    <p className="release-date">{new Date(vid.snippet.publishedAt).toDateString()}</p>
                                    <details>
                                        <summary>Show Description & Player</summary>
                                        <p className="description">{vid.snippet.description}</p>
                                        <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${vid.id.videoId}`} title={vid.snippet.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                    </details>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No videos found matching your search for "{searchQuery}".</p>
                    )}
                </section>
            )}
        </div>
    );
};

export default EpisodesPage;
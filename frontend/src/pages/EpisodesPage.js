import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './EpisodesPage.css';

const EpisodesPage = () => {
    // State for the original, complete list of episodes from the API
    const [allSpotifyEpisodes, setAllSpotifyEpisodes] = useState([]);
    // State to hold the user's current search term
    const [searchQuery, setSearchQuery] = useState('');
    // State for the filtered list of episodes that will actually be displayed
    const [filteredEpisodes, setFilteredEpisodes] = useState([]);

    const [loading, setLoading] = useState(true);

    // This effect runs only ONCE to fetch the initial data
    useEffect(() => {
        const fetchAllSpotifyEpisodes = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5001/api/spotify-episodes');
                if (response.data && response.data.items) {
                    // Set both the master list and the initial displayed list
                    setAllSpotifyEpisodes(response.data.items);
                    setFilteredEpisodes(response.data.items);
                }
            } catch (error) {
                console.error("Failed to fetch Spotify episodes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllSpotifyEpisodes();
    }, []);

    // This effect runs whenever the user's search query changes
    useEffect(() => {
        // Create a lowercase version of the query for case-insensitive search
        const lowercasedQuery = searchQuery.toLowerCase();

        const filtered = allSpotifyEpisodes.filter(episode => {
            // Check if the query is in the episode title OR the description
            const titleMatch = episode.name.toLowerCase().includes(lowercasedQuery);
            const descriptionMatch = episode.description.toLowerCase().includes(lowercasedQuery);
            return titleMatch || descriptionMatch;
        });

        setFilteredEpisodes(filtered);
    }, [searchQuery, allSpotifyEpisodes]); // Dependency array: re-run when these change

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

            <section>
                <h2>From Spotify</h2>
                {filteredEpisodes.length > 0 ? (
                    <div className="episodes-grid">
                        {/* We now map over the filteredEpisodes list */}
                        {filteredEpisodes.map(ep => (
                            <div key={ep.id} className="episode-item">
                                <img src={ep.images[1]?.url} alt={ep.name} />
                                <h3>{ep.name}</h3>
                                <p className="release-date">{new Date(ep.release_date).toDateString()}</p>
                                <details>
                                    <summary>Show Description & Player</summary>
                                    <p className="description">{ep.description}</p>
                                    <iframe 
                                        src={`https://open.spotify.com/embed/episode/${ep.id}`} 
                                        width="100%" height="152" frameBorder="0" 
                                        allow="encrypted-media" title={ep.name}>
                                    </iframe>
                                </details>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Show a helpful message if the search yields no results
                    <p>No episodes found matching your search for "{searchQuery}".</p>
                )}
            </section>
        </div>
    );
};

export default EpisodesPage;
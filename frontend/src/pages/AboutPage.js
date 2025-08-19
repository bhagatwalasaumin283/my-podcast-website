import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './AboutPage.css';

const AboutPage = () => {
    const [bio, setBio] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBio = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/bio');
                setBio(response.data);
            } catch (error) {
                console.error("Error fetching bio", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBio();
    }, []);

    if (loading) return <LoadingSpinner />;
    if (!bio) return <p>Could not load bio information.</p>;

    return (
        <div className="about-page">
            <h1>About {bio.podcastName}</h1>
            <p className="company-bio">{bio.companyBio}</p>

            <h2>The Hosts</h2>
            <div className="hosts-container">
                {bio.hosts.map(host => (
                    <div key={host.name} className="host-card">
                        {/* Add the image tag here */}
                        <img src={host.image} alt={host.name} className="host-image" />
                        
                        {/* Wrap the text in a div for easier styling */}
                        <div className="host-info">
                            <h3>{host.name}</h3>
                            <p>{host.bio}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AboutPage;
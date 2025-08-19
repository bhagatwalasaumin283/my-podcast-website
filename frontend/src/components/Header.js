import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';
// 1. IMPORT your logo from its location
import podcastLogo from '/home/saumin/my_podcast_website/frontend/src/assets/logo.jpg'; 

const Header = () => {
  return (
    <header className="app-header">
      {/* 2. WRAP LOGO AND TITLE IN A LINK */}
      <Link to="/" className="logo-container"> 
        <img src={podcastLogo} alt="Podcast logo" className="logo-image" /> &nbsp;
        <span className="logo-text">A Little Perspective</span>
      </Link>
      <nav>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/episodes">Episodes</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
    </header>
  );
};

export default Header;
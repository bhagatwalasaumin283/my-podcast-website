import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';
import podcastLogo from '../assets/logo.jpg'; // Make sure your logo path is correct

const Header = () => {
  return (
    <header className="app-header">
      {/* 
        This empty div is the key. It will take up the same amount of space
        as the <nav> element, pushing the logo container to the perfect center.
      */}
      <div className="header-spacer"></div>

      {/* The logo and title container remains the same */}
      <Link to="/" className="logo-container"> 
        <img src={podcastLogo} alt="Podcast logo" className="logo-image" />
        <span className="logo-text">A Little Perspective</span>
      </Link>

      {/* The navigation remains the same */}
      <nav className="header-nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/episodes">Episodes</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
    </header>
  );
};

export default Header;
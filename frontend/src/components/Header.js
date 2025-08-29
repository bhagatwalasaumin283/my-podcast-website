import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';
import podcastLogo from '../assets/logo.jpg';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  }

  return (
    <>
      <header className="app-header">
        <Link to="/" className="logo-container" onClick={closeMenu}> 
          <img src={podcastLogo} alt="Podcast logo" className="logo-image" />
          <span className="logo-text">A Little Perspective</span>
        </Link>

        {/* This is the regular desktop navigation */}
        <nav className="header-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/episodes">Episodes</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>

        {/* This is the hamburger icon */}
        <div className="menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </header>
      
      {/* This is the separate sliding mobile menu */}
      <nav className={`mobile-nav-menu ${isMenuOpen ? 'active' : ''}`}>
        <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
        <NavLink to="/episodes" onClick={closeMenu}>Episodes</NavLink>
        <NavLink to="/about" onClick={closeMenu}>About</NavLink>
      </nav>
    </>
  );
};

export default Header;
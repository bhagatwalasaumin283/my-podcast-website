import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <p>&copy; {currentYear} My Friend's Podcast. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
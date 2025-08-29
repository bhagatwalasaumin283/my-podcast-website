import React from 'react';
import './Modal.css';

// The Google Form URL you copied in Part 1
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdM1RK1wu1FDaG03Sezw5wOFZyVneXNoythcNqwZ0FfC-2MCA/viewform?usp=sharing&ouid=106685878026176003729";

const Modal = ({ isOpen, onClose }) => {
  // If the modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  return (
    // The dark overlay that covers the page
    <div className="modal-overlay" onClick={onClose}>
      {/* The modal content itself. We stop propagation so clicking inside it doesn't close it. */}
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* The close button */}
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        
        {/* The iframe that will display the Google Form */}
        <iframe
          src={GOOGLE_FORM_URL}
          width="100%"
          height="100%"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          title="Contact Form"
        >
          Loading…
        </iframe>
      </div>
    </div>
  );
};

export default Modal;
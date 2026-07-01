import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo-placeholder">BrandLogo</span>
      </div>
      <div className="navbar-links">
        <a href="#about" className="nav-link">About</a>
        <a href="#services" className="nav-link">Services</a>
        <a href="#contact" className="nav-link">Contact</a>
      </div>
      <div className="navbar-actions">
        <button 
          className="book-btn" 
          onClick={() => navigate('/application')}
        >
          Book Appointment
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

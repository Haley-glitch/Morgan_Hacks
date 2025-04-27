// src/components/NavBar.jsx
import React from 'react';
import '../App.css'; // for navbar styles

export default function NavBar() {
  return (
    <div className="navbar-container">
      <div className="navbar-name" onClick={() => window.location.replace('/')}>
        DIGITEXT
      </div>
      <div className="row-container add-gaps">
        <div className="navbar-button" onClick={() => window.location.replace('/about')}>
          About
        </div>
        <div className="navbar-button" onClick={() => window.location.replace('/generate')}>
          Generate
        </div>
      </div>
    </div>
  );
}

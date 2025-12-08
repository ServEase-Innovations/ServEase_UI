/* eslint-disable */
import React from "react";
import "./LoadingScreen.css";

function LoadingScreen() {
  return (
    <div className="loading-wrapper">
      <div className="loading-content">

        {/* Logo */}
        <img
          src="ServEaso_Logo.png"
          alt="ServEase_Logo"
          className="logo-img"
        />

        {/* Wave Loader */}
        <div className="wave-loader">
          <div className="wave"></div>
        </div>

        {/* Text */}
        <p className="loading-text">FETCHING INITIAL DATA...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;

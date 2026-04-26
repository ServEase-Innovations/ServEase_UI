import React from "react";
import { publicAsset } from "src/utils/publicAsset";
import "./LoadingScreen.css";

/**
 * Shown on first paint while the app fetches base pricing and initializes.
 * Keep assets minimal so first paint stays fast; styles live in LoadingScreen.css.
 */
function LoadingScreen() {
  return (
    <div
      className="loading-wrapper"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-ambient" aria-hidden="true" />
      <div className="loading-vignette" aria-hidden="true" />

      <div className="loading-card">
        <img
          src={publicAsset("ServEaso_Logo.png")}
          alt="ServEase"
          className="loading-logo"
          decoding="async"
          fetchPriority="high"
        />

        <h1 className="loading-sr-only">Loading ServEase</h1>

        <div
          className="loading-track"
          aria-hidden="true"
        >
          <div className="loading-bar" />
        </div>

        <p className="loading-title">Getting things ready</p>
        <p className="loading-sub">
          We&apos;re loading the latest service information for you
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;

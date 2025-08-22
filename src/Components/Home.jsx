import React from "react";
import "./HomePage.css";
import bgVideo from "../Images/bg.mp4";

function HomePage({ onGoNow }) {
  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <a href="/" className="brand">
          <h1>Snow Strom</h1>
        </a>
      </nav>

      {/* Background Video */}
      <video className="bg-video" autoPlay loop muted playsInline>
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      <div className="center-button">
        <button onClick={onGoNow}>Go Now →</button>
      </div>
    </div>
  );
}

export default HomePage;
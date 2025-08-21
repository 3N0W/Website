import React from "react";
import "./HomePage.css";
import bgVideo from "../Images/bg.mp4";

function HomePage({ onGoNow }) {
  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="brand">Snow Strom</h1>
      </nav>

      {/* Background Video */}
      <video className="bg-video" autoPlay loop muted playsInline>
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      <div className="overlay">
        <button className="go-now-btn" onClick={onGoNow}>
          Go Now →
        </button>
      </div>
    </div>
  );
}

export default HomePage;
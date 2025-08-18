import React from "react";
import "./HomePage.css";
import bgVideo from "../Images/bg.mp4"; // import video

function HomePage({ onGoNow }) {
  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <h1>Snow Strom</h1>
      </nav>

      {/* Fullscreen Video */}
      <video className="bg-video" autoPlay loop muted>
        <source src={bgVideo} type="video/mp4" />
      </video>

      {/* Center Button */}
      <div className="center-button">
        <button onClick={onGoNow}>Go now</button>
      </div>
    </div>
  );
}

export default HomePage;
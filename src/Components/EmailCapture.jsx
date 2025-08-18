import React, { useState } from "react";
import "./EmailCapture.css";

function EmailCapture({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return alert("Fill all fields");
    onSubmit({ name, email });
  };

  return (
    <form className="email-capture" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Save Info</button>
    </form>
  );
}

export default EmailCapture;
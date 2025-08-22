import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "./EmailCapture.css";

function EmailCapture({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Load saved info from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("buyer_name");
    const savedEmail = localStorage.getItem("buyer_email");
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Fill in all fields", { position: "bottom-center" });
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Invalid email format", { position: "bottom-center" });
      return;
    }

    localStorage.setItem("buyer_name", name);
    localStorage.setItem("buyer_email", email);

    onSubmit({ name, email });
    toast.success("Info saved", { position: "bottom-center" });
  };

  return (
    <form className="email-capture" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
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
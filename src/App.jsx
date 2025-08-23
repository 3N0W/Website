import React, { useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import HomePage from "./Components/Home";
import EmailCapture from "./Components/EmailCapture";
import ProductPage from "./Components/ProductPage";
import Contact from "./Components/Contact";
import RefundPolicy from "./Components/RefundPolicy";
import Terms from "./Components/Terms";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import AffiliateLanding from "./Components/AffiliateLanding"; // <-- New component

function App() {
  const productRef = useRef(null);

  const handleGoNow = () => {
    if (productRef.current) {
      productRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Router>
      <Routes>
        {/* Affiliate landing page */}
        <Route path="/:code" element={<AffiliateLanding />} />

        {/* Home with products */}
        <Route
          path="/"
          element={
            <>
              <HomePage onGoNow={handleGoNow} />
              <main ref={productRef}>
                <ProductPage />
              </main>
              <footer className="footer">
                <Link to="/contact">Contact Us</Link> |{" "}
                <Link to="/refund-policy">Refund Policy</Link> |{" "}
                <Link to="/terms">Terms & Conditions</Link>
                <span>&copy; 2025 Snow Strom. All rights reserved.</span>
              </footer>
            </>
          }
        />

        {/* Admin dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Razorpay compliance pages */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Router>
  );
}

export default App;
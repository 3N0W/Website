import React, { useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import HomePage from "./Components/Home";
import ProductPage from "./Components/ProductPage";
import Contact from "./Compoments/Contact";
import RefundPolicy from "./Components/RefundPolicy";
import Terms from "./Components/Terms";

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
        {/* Home with products on same page */}
        <Route
          path="/"
          element={
            <>
              <HomePage onGoNow={handleGoNow} />
              <main ref={productRef}>
                <ProductPage />
              </main>
              <footer className="p-4 text-center text-gray-400">
                <Link to="/contact" className="mx-2">Contact Us</Link> | 
                <Link to="/refund-policy" className="mx-2">Refund Policy</Link> | 
                <Link to="/terms" className="mx-2">Terms & Conditions</Link>
              </footer>
            </>
          }
        />

        {/* Razorpay compliance pages */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Router>
  );
}

export default App;
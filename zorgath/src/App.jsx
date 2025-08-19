import React, { useRef } from "react";
import HomePage from "./Components/Home";
import ProductPage from "./Components/ProductPage";

function App() {
  const productRef = useRef(null);

  const handleGoNow = () => {
    // Scroll to ProductPage smoothly
    productRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <HomePage onGoNow={handleGoNow} />
      <div ref={productRef}>
        <ProductPage />
      </div>
    </>
  );
}

export default App;
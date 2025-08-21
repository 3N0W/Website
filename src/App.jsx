import React, { useRef } from "react";
import HomePage from "./Components/Home";
import ProductPage from "./Components/ProductPage";

function App() {
  const productRef = useRef(null);

  const handleGoNow = () => {
    if (productRef.current) {
      productRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <HomePage onGoNow={handleGoNow} />
      <main ref={productRef}>
        <ProductPage />
      </main>
    </>
  );
}

export default App;
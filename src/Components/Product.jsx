import React from "react";
import "./Product.css"; // optional for styling

function Product({ image, name, price, onClick, disabled }) {
  return (
    <div className="product-box">
      <img src={image} alt={name} className="product-img" />
      <div className="product-meta">
        <h3>{name}</h3>
        <p className="price">₹{price}</p>
      </div>
      <div className="buy-button">
        <button
          className="collect-btn"
          onClick={onClick}
          disabled={disabled}
          aria-disabled={disabled}
        >
          {disabled ? "Processing…" : "Collect Now"}
        </button>
      </div>
    </div>
  );
}

export default Product;
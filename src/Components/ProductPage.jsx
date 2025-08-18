import React, { useState } from "react";
import img1 from "../Images/P.png";
import img2 from "../Images/LIFE.png";
import EmailCapture from "./EmailCapture";
import "./ProductPage.css";

const products = [
  { src: img1, name: "Product 1", price: 299 },
  { src: img2, name: "Product 2", price: 299 },
];

function ProductPage() {
  const [user, setUser] = useState(null); // store name/email

  const handlePayment = (product) => {
    if (!user) return alert("Please enter your name and email first!");

    const options = {
      key: "rzp_test_R6bB1GOrVnKh8K",
      amount: product.price * 100,
      currency: "INR",
      name: "Snow Strom Products",
      description: product.name,
      image: product.src,
      handler: function (response) {
        alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: "",
      },
      theme: {
        color: "#ff1a1a",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div>
      {!user && <EmailCapture onSubmit={setUser} />}
      <div className="p-page">
        {products.map((product, index) => (
          <div className="product-box" key={index}>
            <img src={product.src} alt={product.name} />
            <div className="buy-button">
              <button onClick={() => handlePayment(product)}>
                Collect Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductPage;
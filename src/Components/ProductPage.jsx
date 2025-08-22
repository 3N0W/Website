import React, { useState } from "react";
import "./ProductPage.css"

export default function ProductPage() {
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const products = [
    { id: "prod_1", name: "Product 1", price: 299 },
    { id: "prod_2", name: "Product 2", price: 299 },
  ];

  // Create order on backend
  const handleBuy = async (productId) => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          buyer: { email: "test@example.com" },
        }),
      });

      const data = await res.json();
      if (!data.id) throw new Error("Order not created");

      setOrderId(data.id);

      // Call Razorpay popup
      openRazorpayCheckout(data, productId);
    } catch (err) {
      console.error("Buy error:", err);
      alert("Failed to start payment");
    } finally {
      setLoading(false);
    }
  };

  // Razorpay popup
  const openRazorpayCheckout = (order, productId) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // from .env
      amount: order.amount,
      currency: order.currency,
      name: "Zorgath Store",
      description: products.find((p) => p.id === productId).name,
      order_id: order.id,
      handler: async function (response) {
        // Verify payment on backend
        const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setDownloadUrl(verifyData.downloadUrl);
        } else {
          alert("Payment verification failed");
        }
      },
      prefill: { email: "test@example.com" },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      <div className="grid grid-cols-2 gap-6">
        {products.map((p) => (
          <div key={p.id} className="border p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="mb-2">₹{p.price}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => handleBuy(p.id)}
              disabled={loading}
            >
              {loading ? "Processing..." : "Buy"}
            </button>
          </div>
        ))}
      </div>

      {orderId && <p className="mt-4">Order created: {orderId}</p>}
      {downloadUrl && (
        <div className="mt-4">
          <a
            href={downloadUrl}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Download Product
          </a>
        </div>
      )}
    </div>
  );
}
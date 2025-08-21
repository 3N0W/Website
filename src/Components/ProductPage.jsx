// src/Components/ProductPage.jsx
import React, { useEffect, useState, useRef } from "react";
import EmailCapture from "./EmailCapture";
import "./ProductPage.css";
import toast, { Toaster } from "react-hot-toast";
import prod1Img from "../Images/prod1.png";
import prod2Img from "../Images/prod2.png";

const productImages = {
  prod_1: prod1Img,
  prod_2: prod2Img,
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_R6bB1GOrVnKh8K";

export default function ProductPage() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [products, setProducts] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => () => { isMounted.current = false; }, []);
  useEffect(() => { if (user) localStorage.setItem("user", JSON.stringify(user)); }, [user]);

  // Fetch products
  useEffect(() => {
  (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
      else setProducts([]); // fallback
    } catch {
      setProducts([]); // fallback
    }
  })();
}, []);

  // Razorpay script
  useEffect(() => {
    if (window.Razorpay) return setScriptLoaded(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { if (isMounted.current) setScriptLoaded(true); };
    script.onerror = () => toast.error("Payment gateway failed to load.", { style: toastStyle(), position: "bottom-center" });
    document.body.appendChild(script);
  }, []);

  const toastStyle = (overrides = {}) => ({
    borderRadius: "12px",
    background: "#0f0f11",
    color: "#e6eef0",
    padding: "12px 16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
    ...overrides
  });

  async function createOrder(productId) {
    const res = await fetch(`${API_BASE}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, buyer: { name: user.name, email: user.email } })
    });
    if (!res.ok) throw new Error(await safeJsonError(res));
    return res.json();
  }

  async function verifyPayment(response) {
    const res = await fetch(`${API_BASE}/api/payment/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response)
    });
    if (!res.ok) throw new Error(await safeJsonError(res));
    return res.json();
  }

  async function safeJsonError(res) {
    try {
      const data = await res.json();
      return data?.error || data?.message || JSON.stringify(data);
    } catch {
      return `${res.status} ${res.statusText}`;
    }
  }

  const handlePayment = async (product) => {
    if (!user) return toast.error("Enter your name and email first.", { style: toastStyle(), position: "bottom-center" });
    if (!scriptLoaded) return toast.error("Payment gateway still loading.", { style: toastStyle(), position: "bottom-center" });

    setLoadingProduct(product.id);

    try {
      const order = await createOrder(product.id);
      if (!order?.id) throw new Error("Invalid order response");

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Snow Storm Products",
        description: product.name,
        order_id: order.id,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#ff1a1a" },
        handler: async (razorpayResponse) => {
          toast.loading("Verifying payment...", { id: "verify", style: toastStyle(), position: "bottom-center" });
          try {
            const verifyData = await verifyPayment(razorpayResponse);
            toast.dismiss("verify");
            if (verifyData.success && verifyData.downloadUrl) {
              toast.success("Payment verified — starting download", { style: { ...toastStyle(), color: "#bfffbf" }, position: "bottom-center" });
              window.location.href = verifyData.downloadUrl;
            } else {
              toast.error("Payment verification failed.", { style: toastStyle(), position: "bottom-center" });
              console.error("Verify failed:", verifyData);
            }
          } catch (err) {
            toast.dismiss("verify");
            toast.error(err.message || "Verification error", { style: toastStyle(), position: "bottom-center" });
            console.error("Verification error:", err);
          } finally { if (isMounted.current) setLoadingProduct(null); }
        },
        modal: {
          ondismiss: () => { if (isMounted.current) setLoadingProduct(null); toast("Checkout closed", { icon: "✖️", style: toastStyle(), position: "bottom-center" }); }
        }
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error("Payment flow error:", err);
      toast.error(err.message || "Payment setup failed", { style: toastStyle(), position: "bottom-center" });
      setLoadingProduct(null);
    }
  };

  return (
    <div className="product-page-root">
      <Toaster />
      {!user && <EmailCapture onSubmit={setUser} />}
      <div className="p-page">
        {products.length === 0 && <p style={{ color: "#fff" }}>Loading products...</p>}
        {products.map((product) => (
          <div className="product-box" key={product.id}>
  <img
  src={productImages[product.id] || "https://via.placeholder.com/150"}
  alt={product.name}
  className="product-img"
/>
            <div className="product-meta">
              <h3>{product.name}</h3>
              <p className="price">₹{product.price}</p>
            </div>
            <div className="buy-button">
              <button
                className="collect-btn"
                onClick={() => handlePayment(product)}
                disabled={loadingProduct === product.id}
              >
                {loadingProduct === product.id ? "Processing…" : "Collect Now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
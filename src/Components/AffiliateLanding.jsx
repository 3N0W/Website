import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AffiliateLanding() {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      localStorage.setItem("affiliate_code", code);
    }
    // Redirect user to homepage (or directly to products)
    navigate("/", { replace: true });
  }, [code, navigate]);

  return <p>Applying affiliate code... Redirecting.</p>;
}
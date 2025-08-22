import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./Dashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const ADMIN_TOKEN_KEY = "affiliate_admin_token";

export default function Dashboard() {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem(ADMIN_TOKEN_KEY) || "");

  const ensureToken = async () => {
    if (!token) {
      const entered = prompt("Enter admin token:");
      if (!entered) {
        toast.error("No token entered. Access denied.");
        return false;
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, entered);
      setToken(entered);
    }
    return true;
  };

  const fetchAffiliates = async () => {
    if (!(await ensureToken())) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/affiliate`, {
        headers: { "x-admin-token": token }
      });
      if (!res.ok) throw new Error("Unauthorized or failed");
      const data = await res.json();
      setAffiliates(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to fetch affiliates");
    } finally {
      setLoading(false);
    }
  };

  const createAffiliate = async () => {
    if (!(await ensureToken())) return;
    const name = prompt("Enter affiliate name:");
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/affiliate/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token
        },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (data?.code) {
        toast.success(`Affiliate link created: https://snowstrom.shop/${data.code}`);
        fetchAffiliates();
      } else {
        toast.error(data.error || "Failed to create affiliate");
      }
    } catch (err) {
      toast.error("Failed to create affiliate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" />
      <h1>Affiliate Dashboard</h1>
      <button onClick={createAffiliate} disabled={loading}>
        {loading ? "Processing..." : "Create New Affiliate"}
      </button>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Link</th>
            <th>Total Sales</th>
            <th>Total Revenue (₹)</th>
          </tr>
        </thead>
        <tbody>
          {affiliates.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                No affiliates yet
              </td>
            </tr>
          )}
          {affiliates.map((aff) => (
            <tr key={aff.code}>
              <td>{aff.name}</td>
              <td>
                <a
                  href={`https://snowstrom.shop/${aff.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  snowstrom.shop/{aff.code}
                </a>
              </td>
              <td>{aff.sales}</td>
              <td>₹{aff.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
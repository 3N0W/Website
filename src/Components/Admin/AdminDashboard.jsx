import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AffiliatesTable from "./AffiliatesTable";
import PaymentsTable from "./PaymentsTable";
import StatsPanel from "./StatsPanel";
import AdminHeader from "./AdminHeader";
import "./AdminDashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const ADMIN_TOKEN_KEY = "affiliate_admin_token";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [affiliates, setAffiliates] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAffiliates: 0,
    totalRevenue: 0,
  });

  // ensure token prompt
  const ensureToken = async () => {
    let token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      const entered = prompt("Enter admin token:");
      if (!entered) {
        toast.error("Access denied. No token entered.");
        return false;
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, entered);
      token = entered;
    }
    return true;
  };

  // fetch affiliates
  const fetchAffiliates = async () => {
    try {
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      const res = await fetch(`${API_BASE}/api/affiliate`, {
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAffiliates(Array.isArray(data.data) ? data.data : []);
    } catch {
      toast.error("Failed to fetch affiliates");
    }
  };

  // fetch payments
  const fetchPayments = async () => {
    try {
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      const res = await fetch(`${API_BASE}/api/payment`, {
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPayments(Array.isArray(data.data) ? data.data : []);
    } catch {
      toast.error("Failed to fetch payments");
    }
  };

  // calculate stats
  const computeStats = () => {
    const totalPayments = payments.length;
    const totalAffiliates = affiliates.length;
    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    setStats({ totalPayments, totalAffiliates, totalRevenue });
  };

  // create affiliate
  const createAffiliate = async () => {
    if (!(await ensureToken())) return;
    const name = prompt("Enter affiliate name:");
    if (!name) return;
    setLoading(true);
    try {
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      const res = await fetch(`${API_BASE}/api/affiliate/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data?.data?.code) {
        toast.success(`Affiliate created: snowstrom.shop/${data.data.code}`);
        await fetchAffiliates();
        computeStats();
      } else {
        toast.error(data.error || "Failed to create affiliate");
      }
    } catch {
      toast.error("Failed to create affiliate");
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    (async () => {
      if (!(await ensureToken())) return;
      setLoading(true);
      await Promise.all([fetchAffiliates(), fetchPayments()]);
      computeStats();
      setLoading(false);
    })();
  }, []);

  // recompute stats when data changes
  useEffect(() => {
    computeStats();
  }, [affiliates, payments]);

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" />
      <AdminHeader />
      <StatsPanel stats={stats} />
      <button onClick={createAffiliate} disabled={loading}>
        {loading ? "Processing..." : "Create Affiliate"}
      </button>
      <AffiliatesTable affiliates={affiliates} />
      <PaymentsTable payments={payments} />
    </div>
  );
}
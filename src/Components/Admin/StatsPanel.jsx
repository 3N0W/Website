import React from "react";

export default function StatsPanel({ stats }) {
  return (
    <div className="stats-panel">
      <div>Total Payments: {stats.totalPayments}</div>
      <div>Total Affiliates: {stats.totalAffiliates}</div>
      <div>Total Revenue: ₹{stats.totalRevenue}</div>
    </div>
  );
}
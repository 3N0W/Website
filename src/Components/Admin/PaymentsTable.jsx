import React from "react";

export default function PaymentsTable({ payments }) {
  return (
    <div className="table-container">
      <h2>Payments</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Email</th>
            <th>Status</th>
            <th>Affiliate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.order_id}>
              <td>{p.order_id}</td>
              <td>{p.product_id}</td>
              <td>{p.email}</td>
              <td>{p.status}</td>
              <td>{p.affiliate || "N/A"}</td>
              <td>₹{p.amount || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
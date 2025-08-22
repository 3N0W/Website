import React from "react";

export default function AffiliatesTable({ affiliates }) {
  return (
    <div className="table-container">
      <h2>Affiliates</h2>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {affiliates.map((a) => (
            <tr key={a.code}>
              <td>{a.code}</td>
              <td>{a.name}</td>
              <td>₹{a.totalSales || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
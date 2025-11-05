import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./componentstyles/graph.css";

function SalesGraph() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://the-farm-backend.onrender.com/sales/graph")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="graph-wrapper">
      <h3 className="graph-title">Daily Sales in Crates</h3>

      <div className="graph-container">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.2)" />
            <XAxis dataKey="date" stroke="#fff" tick={{ fontSize: 12, fill: "#fff" }} />
            <YAxis stroke="#fff" tick={{ fontSize: 12, fill: "#fff" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
              }}
              labelStyle={{ fontWeight: "bold" }}
            />
            <Legend wrapperStyle={{ color: "#fff", fontWeight: 600 }} />
            <Line
              type="monotone"
              dataKey="quantity in crates"
              stroke="#FFD93D"
              strokeWidth={4}
              dot={{ r: 5, fill: "#FF6B6B", strokeWidth: 2 }}
              activeDot={{ r: 8, fill: "#FF6B6B", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SalesGraph;

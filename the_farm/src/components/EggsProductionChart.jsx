import { useEffect, useState } from "react";
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
import "./componentstyles/graph.css"; // Shared CSS with SalesGraph

function EggProductionChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/eggproduction/chartdata")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="graph-wrapper">
      <h3 className="graph-title">Daily Egg Production</h3>

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
              dataKey="eggs"
              stroke="#FFD93D"
              strokeWidth={4}
              dot={{ r: 5, fill: "#6BCB77", strokeWidth: 2 }}
              activeDot={{ r: 8, fill: "#6BCB77", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="broken"
              stroke="#FF6B6B"
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

export default EggProductionChart;

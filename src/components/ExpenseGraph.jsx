import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import "./componentstyles/Expense.css";

function ExpenseGraph() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://the-farm-backend.onrender.com/expenses/graph")
      .then((res) => res.json())
      .then((records) => {
        const grouped = {};
        records.forEach((r) => {
          if (!grouped[r.date]) grouped[r.date] = { date: r.date };
          grouped[r.date][r.category] = r.amount_spent;
        });
        setData(Object.values(grouped));
      })
      .catch((err) => console.error(err));
  }, []);

  const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#845EC2", "#FF9671", "#FFC75F", "#00C9A7"];
  const categories = [...new Set(data.flatMap(Object.keys))].filter(key => key !== "date");

  return (
    <div className="expenses-wrapper">
      <h3 className="expenses-title">Last 8 Expenses</h3>
      <div className="graph-container">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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

            {categories.map((category, index) => (
              <Bar
                key={category}
                dataKey={category}
                stackId={false}
                fill={colors[index % colors.length]}
                radius={[10, 10, 0, 0]}
                barSize={30}
                animationDuration={800}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ExpenseGraph;

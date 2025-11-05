import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import toast from "react-hot-toast";
import "./componentstyles/populationgraph.css"; // shared graph CSS

function PopulationGraph() {
  const [batchList, setBatchList] = useState([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    fetch("https://the-farm-backend.onrender.com/batches")
      .then(res => res.json())
      .then(data => setBatchList(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (batchList.length > 0) {
      const batchId = batchList[currentBatchIndex].id;
      fetch(`https://the-farm-backend.onrender.com/batch/${batchId}/population_graph`)
        .then(res => res.json())
        .then(data => setGraphData(data))
        .catch(err => console.error(err));
    }
  }, [batchList, currentBatchIndex]);

  const nextBatch = () => {
    if (currentBatchIndex < batchList.length - 1) {
      setCurrentBatchIndex(prev => prev + 1);
    } else {
      toast("You are on the last batch");
    }
  };

  const previousBatch = () => {
    if (currentBatchIndex > 0) {
      setCurrentBatchIndex(prev => prev - 1);
    } else {
      toast("Already on the first batch");
    }
  };

  return (
    <div className="graph-wrapper">
      {batchList.length > 0 && (
        <h3 className="graph-title text-center">
          Viewing: {batchList[currentBatchIndex].name}
        </h3>
      )}

      <div className="graph-container">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.2)" />
            <XAxis dataKey="date" stroke="#fff" tick={{ fontSize: 12, fill: "#fff" }} />
            <YAxis stroke="#fff" tick={{ fontSize: 12, fill: "#fff" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#222", borderRadius: "8px", border: "none", color: "#fff" }}
              labelStyle={{ fontWeight: "bold" }}
            />
            <Legend wrapperStyle={{ color: "#fff", fontWeight: 600 }} />
            <Line type="monotone" dataKey="birds" stroke="#FFD93D" strokeWidth={4} dot={{ r: 5, fill: "#6BCB77" }} activeDot={{ r: 8, fill: "#6BCB77" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="d-flex justify-content-center gap-3 mt-3">
        <button className="btn btn-outline-light" onClick={previousBatch}>Previous Batch</button>
        <button className="btn btn-outline-light" onClick={nextBatch}>Next Batch</button>
      </div>
    </div>
  );
}

export default PopulationGraph;

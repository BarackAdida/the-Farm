import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FeedAlert() {
  const [lowFeeds, setLowFeeds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const res = await fetch("https://the-farm-backend.onrender.com");
        const data = await res.json();

        const filtered = data.filter((f) => f.sacks_in_storage < 5);
        setLowFeeds(filtered);
      } catch (err) {
        console.error("Error fetching feeds:", err);
      }
    };

    fetchFeeds();
  }, []);

  const handleClick = () => {
    navigate("/feedrecords"); 
  };

  if (lowFeeds.length === 0) return null;

  return (
    <div
      onClick={handleClick}
      style={{
        background: "#FFFACD",
        padding: "12px",
        margin: "10px 0",
        borderRadius: "6px",
        cursor: "pointer",
        border: "1px solid #E1B000",
      }}
    >
      <strong>⚠ Low Feed Alert!</strong>
      <p style={{ margin: "4px 0" }}>
        The following feed types are below 5 sacks:
      </p>

      <ul style={{ marginLeft: "20px" }}>
        {lowFeeds.map((f) => (
          <li key={f.id}>
            {f.feed_name} — {f.sacks_in_storage} sacks left
          </li>
        ))}
      </ul>

      <p style={{ fontSize: "12px", opacity: 0.7 }}>
        Click to view full stock list
      </p>
    </div>
  );
}

export default FeedAlert;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function VaccinationAlert() {
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingVaccinations();
  }, []);

  const fetchUpcomingVaccinations = async () => {
    try {
      const response = await fetch("https://the-farm-stib.onrender.com/vaccination/upcoming");
      if (!response.ok) {
        throw new Error("Failed to fetch vaccination data");
      }

      const data = await response.json();
      const today = new Date();

      const filtered = data
        .map((item) => {
          const vDate = new Date(item.vaccination_date);
          const diffDays = Math.ceil((vDate - today) / (1000 * 60 * 60 * 24));

          let status = "";
          if (diffDays <= 1) status = "danger"; // Red alert
          else if (diffDays <= 5) status = "warning"; // Orange alert
          else status = "normal";

          return { ...item, diffDays, status };
        })
        .filter((v) => v.status !== "normal");

      setAlerts(filtered);
    } catch (error) {
      console.error("Error fetching vaccination data:", error);
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="mt-3">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`alert alert-${
            alert.status === "danger" ? "danger" : "warning"
          } shadow-sm alert-clickable`}
          role="alert"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/vaccinationschedule")}
        >
          <strong>{alert.vaccination_name}</strong> for Batch{" "}
          <strong>{alert.batch_id}</strong> is due{" "}
          {alert.diffDays <= 0
            ? "today!"
            : `in ${alert.diffDays} day${alert.diffDays > 1 ? "s" : ""}`}{" "}
          — click to view all schedules.
        </div>
      ))}
    </div>
  );
}

export default VaccinationAlert;

import { useEffect, useState } from "react";
import "./componentstyles/vaccination.css";

function VaccinationSchedule({ onClose }) {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    batch_id: "",
    vaccination_name: "",
    vaccination_date: "",
  });

  useEffect(() => {
    fetch("http://127.0.0.1:5000/vaccination/upcoming")
      .then((res) => res.json())
      .then((data) => setSchedules(data));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://127.0.0.1:5000/vaccination/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        fetch("http://127.0.0.1:5000/vaccination/upcoming")
          .then((res) => res.json())
          .then((data) => setSchedules(data));
        setFormData({
          batch_id: "",
          vaccination_name: "",
          vaccination_date: "",
        });
        setShowForm(false);
        onClose();
      });
  };

  return (
    <div className="vaccination-wrapper">
      <h2>Vaccination Schedule</h2>

      <button className="btn btn-outline-success mb-3" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Close Form" : "Add New Schedule"}
      </button>

      {showForm && (
        <form className="vaccination-form" onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="number"
                name="batch_id"
                value={formData.batch_id}
                onChange={handleChange}
                placeholder="Batch ID"
                required
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                name="vaccination_name"
                value={formData.vaccination_name}
                onChange={handleChange}
                placeholder="Vaccination Name"
                required
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <input
                type="date"
                name="vaccination_date"
                value={formData.vaccination_date}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-success mt-3">Save</button>
        </form>
      )}

      <table className="table table-hover align-middle text-center mt-4">
        <thead className="table-success">
          <tr>
            <th>Batch</th>
            <th>Vaccination</th>
            <th>Date</th>
            <th>Days Left</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => {
            const left = Math.ceil(
              (new Date(s.vaccination_date) - new Date()) / (1000 * 60 * 60 * 24)
            );
            return (
              <tr key={s.id} style={{ color: left <= 1 ? "red" : "black" }}>
                <td>{s.batch_name}</td>
                <td>{s.vaccination_name}</td>
                <td>{s.vaccination_date}</td>
                <td>{left} days</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default VaccinationSchedule;

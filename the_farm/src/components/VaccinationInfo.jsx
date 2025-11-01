import { useEffect, useState } from "react";
import "./componentstyles/vaccinationinfo.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import VaccinationSchedule from "./VaccinationSchedule";

function VaccinationInfo() {
  const [vaccData, setVaccData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    batch_id: "",
    date: "",
    drug_administered: "",
    veterinary_name: "",
    comments: ""
  });

  const BASE_URL = "http://127.0.0.1:5000";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return !isNaN(date) ? date.toISOString().split("T")[0] : dateStr;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchVaccinationData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/vaccinationinfo`);
      const data = await response.json();
      if (response.ok) setVaccData(data);
      else setError(data.message || "Could not fetch vaccination data");
    } catch (err) {
      setError("Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinationData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingRecord ? "PATCH" : "POST";
      const url = editingRecord
        ? `${BASE_URL}/vaccination/${editingRecord.id}`
        : `${BASE_URL}/vaccinationinfo`;
      const payload = editingRecord ? { id: editingRecord.id, ...formData } : formData;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setError("");
        setShowForm(false);
        setEditingRecord(null);
        resetForm();
        fetchVaccinationData();
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Error communicating with the server!");
    }
  };

  const resetForm = () => {
    setFormData({
      batch_id: "",
      date: "",
      drug_administered: "",
      veterinary_name: "",
      comments: ""
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const response = await fetch(`${BASE_URL}/vaccination/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (response.ok) fetchVaccinationData();
      else setError(data.message || "Failed to delete record!");
    } catch (err) {
      setError("Error deleting record");
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      batch_id: record.batch_id,
      date: formatDate(record.date),
      drug_administered: record.drug_administered,
      veterinary_name: record.veterinary_name,
      comments: record.comments
    });
    setShowForm(true);
  };

  if (loading) return <p>Loading vaccination data...</p>;

  return (
    <div id="vaccine-page"  style={{ overflowY: "auto", height: "100%" }}>
      <div id="vaccine-container" className="mt-4">
        <h2 className="text-center mb-3">Vaccination Records</h2>

        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-outline-warning shadow-sm me-2"
            onClick={() => {
              setShowForm(!showForm);
              setEditingRecord(null);
              resetForm();
            }}
          >
            {showForm ? "Cancel" : editingRecord ? "Edit Record" : "Add New Record"}
          </button>
          <button
            className="btn btn-success shadow-sm"
            onClick={() => setShowSchedule((prev) => !prev)}
          >
            {showSchedule ? "Hide Scheduler" : "Open Vaccination Scheduler"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="number"
                  name="batch_id"
                  placeholder="Batch ID"
                  value={formData.batch_id}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="col-md-4">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  name="drug_administered"
                  placeholder="Drug Administered"
                  value={formData.drug_administered}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="veterinary_name"
                  placeholder="Veterinary Name"
                  value={formData.veterinary_name}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="comments"
                  placeholder="Comments"
                  value={formData.comments}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-outline-warning mt-3">
              {editingRecord ? "Update Record" : "Save Record"}
            </button>
          </form>
        )}

        {error && <p className="text-danger text-center">{error}</p>}

        <div className="table-responsive">
          <table className="table table-hover align-middle text-center">
            <thead className="table-secondary">
              <tr>
                <th>ID</th>
                <th>Batch ID</th>
                <th>Date</th>
                <th>Drug Administered</th>
                <th>Veterinary</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vaccData.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.batch_id}</td>
                  <td>{formatDate(v.date)}</td>
                  <td>{v.drug_administered}</td>
                  <td>{v.veterinary_name}</td>
                  <td>{v.comments}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(v)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(v.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showSchedule && (
          <div className="vaccination-schedule-container mt-4">
            <VaccinationSchedule onClose={() => setShowSchedule(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default VaccinationInfo;

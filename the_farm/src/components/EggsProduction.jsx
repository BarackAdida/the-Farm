import { useEffect, useState } from "react";
import Stock from "./Stock";
import "./componentstyles/eggproduction.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function EggsProduction() {
    const [eggsData, setEggsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingEgg, setEditingEgg] = useState(null);
    const [formData, setFormData] = useState({
        batch_id: "",
        date: "",
        eggs_collected: "",
        broken_eggs: "",
        remarks: "",
    });
    const BASE_URL = "https://the-farm-stib.onrender.com";

    // Format date for input (YYYY-MM-DD)
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return !isNaN(date) ? date.toISOString().split("T")[0] : dateStr;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Fetch all eggs data
    const fetchEggsData = async () => {
        try {
            const response = await fetch(`${BASE_URL}/eggsproduction`);
            const data = await response.json();
            if (response.ok) {
                setEggsData(data);
            } else {
                setError(data.message || "Failed to load eggs production data!");
            }
        } catch (err) {
            setError("Server error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEggsData();
    }, []);

    // Create or update egg data
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingEgg ? "PATCH" : "POST";
            const url = editingEgg
                ? `${BASE_URL}/eggsproduct/${editingEgg.id}`
                : `${BASE_URL}/eggsproduction`;

            const payload = editingEgg
                ? { id: editingEgg.id, ...formData }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                setError("");
                setShowForm(false);
                setEditingEgg(null);
                setFormData({
                    batch_id: "",
                    date: "",
                    eggs_collected: "",
                    broken_eggs: "",
                    remarks: "",
                });
                fetchEggsData();
            } else {
                setError(data.message || "Something went wrong!");
            }
        } catch (err) {
            setError("Error communicating with the server!");
        }
    };

    // Delete egg record
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            const response = await fetch(`${BASE_URL}/eggsproduct/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const data = await response.json();

            if (response.ok) {
                setError("");
                fetchEggsData();
            } else {
                setError(data.message || "Failed to delete record!");
            }
        } catch (err) {
            setError("Error deleting record: " + err.message);
        }
    };

    // Edit egg record
    const handleEdit = (egg) => {
        setEditingEgg(egg);
        setFormData({
            batch_id: egg.batch_id,
            date: formatDate(egg.date),
            eggs_collected: egg.eggs_collected,
            broken_eggs: egg.broken_eggs,
            remarks: egg.remarks,
        });
        setShowForm(true);
    };

    if (loading) return <p>Loading egg production data...</p>;

    return (
       <div id="eggs-page">
  <div id="eggs-container" className="mt-4">
    {/* 🧭 Header Section */}
    <h3 className="eggs-title mb-3 text-center">Eggs Production</h3>

    {/* ➕ Top Controls */}
    <div className="eggs-controls">
      <button
        id="toggle-eggs-form-btn"
        className="btn btn-outline-warning shadow-sm"
        onClick={() => {
          setShowForm(!showForm);
          setEditingEgg(null);
          setFormData({
            batch_id: "",
            date: "",
            eggs_collected: "",
            broken_eggs: "",
            remarks: "",
          });
        }}
      >
        {showForm ? "Cancel" : editingEgg ? "Edit Record" : "Add New Record"}
      </button>
    </div>

    {/* 🧾 Form */}
    {showForm && (
      <form id="eggs-form" onSubmit={handleSubmit} className="mb-4">
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
              required
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <input
              type="number"
              name="eggs_collected"
              placeholder="Eggs Collected"
              value={formData.eggs_collected}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <input
              type="number"
              name="broken_eggs"
              placeholder="Broken Eggs"
              value={formData.broken_eggs}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-8">
            <input
              type="text"
              name="remarks"
              placeholder="Remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>
        <button type="submit" id="save-eggs-btn" className="btn btn-outline-warning mt-3">
          {editingEgg ? "Update Record" : "Save Record"}
        </button>
      </form>
    )}

    {error && <p className="text-danger text-center">{error}</p>}

    {/* 📊 Table */}
    <div className="table-responsive">
      <table id="eggs-table" className="table table-hover align-middle text-center">
        <thead className="table-secondary">
          <tr>
            <th>Batch ID</th>
            <th>Date</th>
            <th>Eggs Collected</th>
            <th>Broken Eggs</th>
            <th>Remaining Eggs</th>
            <th>Crates</th>
            <th>Extra Eggs</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {eggsData.map((egg) => (
            <tr key={egg.id} className="eggs-row">
              <td data-label="Batch ID">{egg.batch_id}</td>
              <td data-label="Date">{formatDate(egg.date)}</td>
              <td data-label="Eggs Collected">{egg.eggs_collected}</td>
              <td data-label="Broken Eggs">{egg.broken_eggs}</td>
              <td data-label="Remaining Eggs">{egg.remaining_eggs}</td>
              <td data-label="Crates">{egg.quantity_in_crates}</td>
              <td data-label="Extra Eggs">{egg.extra_eggs}</td>
              <td data-label="Remarks">{egg.remarks}</td>
              <td data-label="Actions">
                <div className="eggs-actions">
                  <button className="btn btn-sm btn-outline-success" onClick={() => handleEdit(egg)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(egg.id)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  <Stock />
</div>

    );
}
export default EggsProduction;

import { useEffect, useState } from "react";
import "./componentstyles/batch.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Batch() {
  const [batch, setBatch] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    batch_name: "",
    breed: "",
    acquisition_date: "",
    initial_number: "",
    current_number: "",
    status: "",
  });
  const BASE_URL = "http://127.0.0.1:5000";

  // Format date correctly for input fields
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

  // ✅ Handle PATCH (edit) and POST (create)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingBatch ? "PATCH" : "POST";
      const url = editingBatch
        ? `${BASE_URL}/batches/${editingBatch.id}`
        : `${BASE_URL}/batch`;

      const payload = editingBatch
        ? { id: editingBatch.id, ...formData }
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
        setEditingBatch(null);
        setFormData({
          batch_name: "",
          breed: "",
          acquisition_date: "",
          initial_number: "",
          current_number: "",
          status: "",
        });
        fetchBatch(); // refresh
      } else {
        setError(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      setError("Server error: " + err.message);
    }
  };

  // ✅ Fetch all batches
  const fetchBatch = async () => {
    try {
      const response = await fetch(`${BASE_URL}/batch`);
      const data = await response.json();

      if (response.ok) {
        setBatch(Array.isArray(data) ? data : []);
      } else {
        setError(data.message || "Failed to load batch data!");
      }
    } catch (err) {
      setError("Server error: " + err.message);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete batch ID ${id}?`)) return;
    try {
      const response = await fetch(`${BASE_URL}/batches/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (response.ok) {
        setError("");
        fetchBatch();
      } else {
        setError(data.message || "Failed to delete batch!");
      }
    } catch (err) {
      setError("Error deleting batch: " + err.message);
    }
  };

  // ✅ Edit Batch
  const handleEdit = (b) => {
    setEditingBatch(b);
    setFormData({
      batch_name: b.batch_name,
      breed: b.breed,
      acquisition_date: formatDate(b.acquisition_date),
      initial_number: b.initial_number,
      current_number: b.current_number,
      status: b.status,
    });
    setShowForm(true);
  };

  return (
    <div id="batch-page">
      <div id="batch-container" className="mt-4">

        <h3 className="batch-title text-center mb-3">Batch Records</h3>
        {error && <p className="text-danger text-center">{error}</p>}
        <div className="batch-controls d-flex justify-content-end mb-3">
          <button
            id="toggle-batch-form-btn"
            className="btn btn-outline-warning"
            onClick={() => {
              setShowForm(!showForm);
              setEditingBatch(null);
              setFormData({
                batch_name: "",
                breed: "",
                acquisition_date: "",
                initial_number: "",
                current_number: "",
                status: "",
              });
            }}
          >
            {showForm ? "Cancel" : editingBatch ? "Edit Batch" : "Add New Batch"}
          </button>
        </div>
        {showForm && (
          <form id="batch-form" onSubmit={handleSubmit} className="mb-4">
            <div className="row g-2 form-row">
              <div className="col-md-4">
                <input
                  type="text"
                  name="batch_name"
                  placeholder="Batch Name"
                  className="form-control batch-input"
                  value={formData.batch_name}
                  onChange={handleChange}
                  required
                  disabled={!!editingBatch}
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  name="breed"
                  placeholder="Breed"
                  className="form-control batch-input"
                  value={formData.breed}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="date"
                  name="acquisition_date"
                  className="form-control batch-input"
                  value={formData.acquisition_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="row g-2 mt-2">
              <div className="col-md-4">
                <input
                  type="number"
                  name="initial_number"
                  placeholder="Initial Number"
                  className="form-control batch-input"
                  value={formData.initial_number}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="number"
                  name="current_number"
                  placeholder="Current Number"
                  className="form-control batch-input"
                  value={formData.current_number}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  name="status"
                  placeholder="Status"
                  className="form-control batch-input"
                  value={formData.status}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button type="submit" id="save-batch-btn" className="btn btn-outline-warning mt-3">
              {editingBatch ? "Update Batch" : "Save Batch"}
            </button>
          </form>
        )}

        <div className="table-responsive">
          <table id="batch-table" className="table table-hover align-middle text-center">
            <thead className="table-secondary">
              <tr>
                <th>ID</th>
                <th>Batch Name</th>
                <th>Breed</th>
                <th>Acquisition Date</th>
                <th>Initial Number</th>
                <th>Current Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batch.map((b) => (
                <tr key={b.id} className="batch-row">
                  <td data-label="ID">{b.id}</td>
                  <td data-label="Batch Name">{b.batch_name}</td>
                  <td data-label="Breed">{b.breed}</td>
                  <td data-label="Acquisition Date">{formatDate(b.acquisition_date)}</td>
                  <td data-label="Initial Number">{b.initial_number}</td>
                  <td data-label="Current Number">{b.current_number}</td>
                  <td data-label="Status">{b.status}</td>
                  <td data-label="Actions">
                    <div className="batch-actions">
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleEdit(b)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(b.id)}
                      >
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
    </div>
  );
}

export default Batch;
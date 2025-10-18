import { useState, useEffect } from "react";
import "./componentstyles/Expense.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  // const [showMenu, setShowMenu] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    category: "",
    amount_spent: "",
    description: "",
  });
  const BASE_URL = "http://127.0.0.1:5000";

  // ✅ Convert any incoming date to ISO (for HTML date input)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return !isNaN(date) ? date.toISOString().split("T")[0] : dateString;
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Create or update expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingExpense ? "PATCH" : "POST";
      const url = editingExpense
        ? `${BASE_URL}/expense/${editingExpense.id}`
        : `${BASE_URL}/expenses`;

      const payload = editingExpense
        ? { id: editingExpense.id, ...formData } // Flask PATCH expects "id" in JSON body
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
        setEditingExpense(null);
        setFormData({ date: "", category: "", amount_spent: "", description: "" });
        fetchExpenses();
      } else {
        setError(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      setError("Error communicating with the server!");
    }
  };

  // ✅ Fetch all expenses
  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/expenses`);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setExpenses(data);
      } else {
        setExpenses([]);
        setError(data.message || "Invalid data format!");
      }
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ✅ Delete expense by ID
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/expense/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }), // Flask DELETE expects JSON body
      });

      const data = await response.json();

      if (response.ok) {
        setError("");
        fetchExpenses();
      } else {
        setError(data.message || "Failed to delete expense!");
      }
    } catch (err) {
      setError("Error deleting expense: " + err.message);
    }
  };

  // Edit expense
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      date: formatDate(expense.date),
      category: expense.category,
      amount_spent: expense.amount_spent,
      description: expense.description,
    });
    setShowForm(true);
    // setShowMenu(null);
  };

  return (
    <div id="expenses-page">
      <div id="expenses-container" className="mt-4">
        <h3 className="expenses-title text-center mb-3">💰 Expenses Tracker</h3>
        {/* Top Controls */}
        <div className="expenses-controls d-flex justify-content-end mb-3">
          <button
            id="toggle-form-btn"
            className="btn btn-secondary"
            onClick={() => {
              setShowForm(!showForm);
              setEditingExpense(null);
              setFormData({ date: "", category: "", amount_spent: "", description: "" });
            }}
          >
            {showForm ? "Cancel" : "Add New Expense"}
          </button>
        </div>
        {showForm && (
          <form id="expense-form" onSubmit={handleSubmit} className="mb-4">
            <div className="row g-2 form-row">
              <div className="col-md-3">
                <input
                  type="date"
                  name="date"
                  className="form-control expense-input"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  className="form-control expense-input"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="number"
                  name="amount_spent"
                  placeholder="Amount"
                  className="form-control expense-input"
                  value={formData.amount_spent}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  className="form-control expense-input"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button type="submit" id="save-btn" className="btn btn-secondary mt-3">
              {editingExpense ? "Update Expense" : "Save Expense"}
            </button>
          </form>
        )}
        {error && <p id="error-message" className="text-danger text-center">{error}</p>}
        <div className="table-responsive">
          <table id="expenses-table" className="table table-hover text-center align-middle">
            <thead className="table-secondary">
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount Spent</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="expense-row">
                  <td>{formatDate(expense.date)}</td>
                  <td>{expense.category}</td>
                  <td>{expense.amount_spent}</td>
                  <td>{expense.description}</td>
                  <td>
                    <div className="expense-actions">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(expense)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(expense.id)}
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

export default Expenses;

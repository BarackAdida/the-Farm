import { useEffect, useState } from "react";
import Stock from "./Stock";
import "./componentstyles/Sales.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Sales() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [formData, setFormData] = useState({
        date: "",
        buyer_name: "",
        quantity_in_crates: "",
        price_per_tray: "",
        transport_costs: "",
    });

    const BASE_URL = "http://127.0.0.1:5000";

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

    // Create or update sale
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingSale ? "PATCH" : "POST";
            const url = editingSale
                ? `${BASE_URL}/sale/${editingSale.id}`
                : `${BASE_URL}/sales`;

            const payload = editingSale
                ? { id: editingSale.id, ...formData }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setShowForm(false);
                setEditingSale(null);
                setFormData({
                    date: "",
                    buyer_name: "",
                    quantity_in_crates: "",
                    price_per_tray: "",
                    transport_costs: "",
                });
                setError("");
                fetchSales();
            } else {
                setError(data.message || "Something went wrong!");
            }
        } catch (err) {
            console.error(err);
            setError("Error communicating with the server!");
        }
    };

    // Fetch all sales
    const fetchSales = async () => {
        try {
            const response = await fetch(`${BASE_URL}/sales`);
            const data = await response.json();
            if (response.ok) {
                setSales(data);
            } else {
                setError(data.message || "Failed to load sales data!");
            }
        } catch (err) {
            setError("Server error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    // Delete a sale
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this sale?")) return;
        try {
            const response = await fetch(`${BASE_URL}/sale/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await response.json();

            if (response.ok) {
                setError("");
                fetchSales();
            } else {
                setError(data.message || "Failed to delete sale!");
            }
        } catch (err) {
            setError("Error deleting sale: " + err.message);
        }
    };

    // Edit a sale
    const handleEdit = (sale) => {
        setEditingSale(sale);
        setFormData({
            date: formatDate(sale.date),
            buyer_name: sale.buyer_name,
            quantity_in_crates: sale.quantity_in_crates,
            price_per_tray: sale.price_per_tray,
            transport_costs: sale.transport_costs,
        });
        setShowForm(true);
    };

    if (loading) return <p>Loading sales...</p>;

    return (
        <div id="sales-page">
            <div id="sales-container" className="mt-4">
                <h3 className="sales-title text-center mb-3">Sales</h3>

                {/* 🔘 Top Controls */}
                <div className="sales-controls d-flex justify-content-end flex-wrap gap-2 mb-3">
                    <button
                        id="toggle-form-btn"
                        className="btn btn-outline-warning"
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingSale(null);
                            setFormData({
                                date: "",
                                buyer_name: "",
                                quantity_in_crates: "",
                                price_per_tray: "",
                                transport_costs: "",
                            });
                        }}
                    >
                        {showForm ? "Cancel" : editingSale ? "Edit Sale" : "Add New Sale"}
                    </button>
                </div>

                {/* 🧾 Sales Form */}
                {showForm && (
                    <form id="sales-form" onSubmit={handleSubmit} className="mb-4">
                        <div className="row g-2">
                            <div className="col-md-2 col-12">
                                <input
                                    type="date"
                                    name="date"
                                    className="form-control sales-input"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-2 col-12">
                                <input
                                    type="text"
                                    name="buyer_name"
                                    className="form-control sales-input"
                                    placeholder="Buyer"
                                    value={formData.buyer_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-2 col-12">
                                <input
                                    type="number"
                                    name="quantity_in_crates"
                                    className="form-control sales-input"
                                    placeholder="Crates"
                                    value={formData.quantity_in_crates}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-2 col-12">
                                <input
                                    type="number"
                                    name="price_per_tray"
                                    className="form-control sales-input"
                                    placeholder="Price/tray"
                                    value={formData.price_per_tray}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-2 col-12">
                                <input
                                    type="number"
                                    name="transport_costs"
                                    className="form-control sales-input"
                                    placeholder="Transport Cost"
                                    value={formData.transport_costs}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-2 col-12">
                                <button type="submit" id="save-btn" className="btn btn-outline-warning w-100">
                                    {editingSale ? "Update" : "Save"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {error && <p id="error-message" className="text-danger text-center">{error}</p>}

                {/* 📊 Table Section */}
                <div className="table-responsive">
                    <table id="sales-table" className="table table-hover text-center align-middle">
                        <thead className="table-secondary">
                            <tr>
                                <th>Date</th>
                                <th>Buyer</th>
                                <th>Crates</th>
                                <th>Price/tray</th>
                                <th>Selling Price</th>
                                <th>Transport Cost</th>
                                <th>Final Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale) => (
                                <tr key={sale.id} className="sales-row">
                                    <td data-label="Date">{formatDate(sale.date)}</td>
                                    <td data-label="Buyer">{sale.buyer_name}</td>
                                    <td data-label="Crates">{sale.quantity_in_crates}</td>
                                    <td data-label="Price/tray">{sale.price_per_tray}</td>
                                    <td data-label="Selling Price">{sale.selling_price}</td>
                                    <td data-label="Transport Cost">{sale.transport_costs}</td>
                                    <td data-label="Final Amount">{sale.final_amount}</td>
                                    <td data-label="Actions" className="sales-actions">
                                        <button
                                            className="btn btn-sm btn-outline-success"
                                            onClick={() => handleEdit(sale)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(sale.id)}
                                        >
                                            Delete
                                        </button>
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

export default Sales;

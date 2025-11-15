import { useEffect, useState } from "react";
import "./componentstyles/createuser.css"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function CreateUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        role: "",
        username: "",
        email: "",
        phone_number: "",
        password: "",
        admin_code: "", 
    });

    const BASE_URL = "https://the-farm-backend.onrender.com";

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${BASE_URL}/theusers`);
            const data = await response.json();
            if (response.ok) {
                setUsers(data);
            } else {
                setError(data.message || "Failed to fetch users");
            }
        } catch (err) {
            setError("Server error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingUser ? "PATCH" : "POST";
            const url = editingUser
                ? `${BASE_URL}/userupdate/${editingUser.id}`
                : `${BASE_URL}/newuser`;

            const payload = editingUser
                ? formData
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
                setEditingUser(null);
                setFormData({
                    role: "",
                    username: "",
                    email: "",
                    phone_number: "",
                    password: "",
                    admin_code: "",
                });
                fetchUsers();
            } else {
                setError(data.message || "Something went wrong!");
            }
        } catch (err) {
            setError("Server error: " + err.message);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            role: user.role,
            username: user.username,
            email: user.email,
            phone_number: user.phone_number,
            password: "", 
            admin_code: "",
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const response = await fetch(`${BASE_URL}/userupdate/${id}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (response.ok) {
                setError("");
                fetchUsers();
            } else {
                setError(data.message || "Failed to delete user");
            }
        } catch (err) {
            setError("Server error: " + err.message);
        }
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div id="admin-users-page" className="container mt-4">
            <h3 className="text-center mb-3">Admin: Manage Users</h3>

            <div className="mb-3">
                <button
                    className="btn btn-outline-primary"
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingUser(null);
                        setFormData({
                            role: "",
                            username: "",
                            email: "",
                            phone_number: "",
                            password: "",
                            admin_code: "",
                        });
                    }}
                >
                    {showForm ? "Cancel" : editingUser ? "Edit User" : "Add New User"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <input
                                type="text"
                                name="role"
                                placeholder="Role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-4">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-4">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-4">
                            <input
                                type="text"
                                name="phone_number"
                                placeholder="Phone Number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>
                        {!editingUser && (
                            <div className="col-md-4">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                />
                            </div>
                        )}
                        {!editingUser && (
                            <div className="col-md-4">
                                <input
                                    type="text"
                                    name="admin_code"
                                    placeholder="Admin Code"
                                    value={formData.admin_code}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        )}
                    </div>
                    <button type="submit" className="btn btn-outline-success mt-3">
                        {editingUser ? "Update User" : "Create User"}
                    </button>
                </form>
            )}

            {error && <p className="text-danger text-center">{error}</p>}

            {/* Users Table */}
            <div className="table-responsive">
                <table className="table table-hover text-center align-middle">
                    <thead className="table-secondary">
                        <tr>
                            <th>ID</th>
                            <th>Role</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.role}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.phone_number}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-success me-2"
                                        onClick={() => handleEdit(user)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(user.id)}
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
    );
}

export default CreateUser;

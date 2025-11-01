import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./componentstyles/signup.css";

function SignUp() {
  const [formData, setFormData] = useState({
    role: "user",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    admin_code: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://the-farm-stib.onrender.com/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Signup successful! Redirecting...");
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong!");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-left">
          <h2>Already have an account?</h2>
          <p>Log in to get started!</p>
          <button onClick={() => navigate("/login")}>Log In</button>
        </div>

        <div className="signup-right">
          <h2>Sign Up</h2>
          <form
            onSubmit={handleSubmit}
            className="d-flex flex-column gap-3 w-75 mx-auto mt-4"
          >
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-control"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <input
              type="text"
              name="username"
              placeholder="Name"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-control"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />

            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className="form-control"
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-control"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {formData.role === "admin" && (
              <input
                type="text"
                name="admin_code"
                placeholder="Admin Code"
                value={formData.admin_code}
                onChange={handleChange}
                className="form-control"
              />
            )}

            <button type="submit" className="signup-submit">
              Sign Up
            </button>
          </form>

          <p>
            Already have an account? <a href="/login">Login here</a>
          </p>
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default SignUp;

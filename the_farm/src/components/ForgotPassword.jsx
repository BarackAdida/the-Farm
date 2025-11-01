import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./componentstyles/forgotpassword.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("https://the-farm-stib.onrender.com/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/resetpassword")
        setMessage("A reset code has been sent to your email.");
      } else {
        setError(data.message || "Error sending reset code, account not found.");
      }
    } catch (err) {
      console.error(err)
      setError("Something went wrong, please try again.");
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <h2 className="forgot-title">Forgot Password</h2>

        {message && <p className="forgot-success">{message}</p>}
        {error && <p className="forgot-error">{error}</p>}

        <form onSubmit={handleSubmit} className="forgot-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="forgot-input"
          />
          <button type="submit" className="forgot-btn">Send Reset Code</button>
        </form>

        <p className="forgot-back">
          Remembered your password? <a href="/login">Go back to login</a>
        </p>
      </div>
    </div>

  );
}

export default ForgotPassword;

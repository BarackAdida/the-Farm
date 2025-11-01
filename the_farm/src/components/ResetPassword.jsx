import { useState } from "react";
import "./componentstyles/resertpassword.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("https://the-farm-stib.onrender.com/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password has been reset. You can now log in.");
      } else {
        setError(data.message || "Reset failed.");
      }
    } catch (err) {
      console.error(err)
      setError("Something went wrong, please try again.");
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-container">
        <h2 className="reset-title">Reset Password</h2>

        {message && <p className="reset-success">{message}</p>}
        {error && <p className="reset-error">{error}</p>}

        <form onSubmit={handleReset} className="reset-form">
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="reset-input"
          />

          <input
            type="text"
            placeholder="Reset Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="reset-input"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="reset-input"
          />

          <button type="submit" className="reset-btn">Reset Password</button>
        </form>

        <p className="reset-back">
          Remembered your password? <a href="/login">Go back to login</a>
        </p>
      </div>
    </div>

  );
}

export default ResetPassword;
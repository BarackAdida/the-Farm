import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; 
import "./componentstyles/login.css";

function Login() {
    const [username_or_email, setusername] = useState("");
    const [password, setpassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username_or_email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("username", data.username);
                localStorage.setItem("role", data.role);
                localStorage.setItem("token", data.access_token);

                if (data.role === "admin") {
                    navigate("/dashboard");
                } else {
                    navigate("/userdashboard");
                }
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-section">
                    <h2>Login</h2>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="input-box">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username or Email"
                                value={username_or_email}
                                onChange={(e) => setusername(e.target.value)}
                            />

                            <div className="password-field">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setpassword(e.target.value)}
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
                        </div>

                        <div className="forgot">
                            <a href="/forgotpassword">Forgot password?</a>
                        </div>

                        <button type="submit" className="login-btn">Login</button>
                    </form>
                </div>

                <div className="right-panel">
                    <h2>Don't have an account?</h2>
                    <p>Sign up to get started!</p>
                    <button onClick={() => navigate("/signup")}>Sign Up</button>
                </div>
            </div>
        </div>
    );
}

export default Login;

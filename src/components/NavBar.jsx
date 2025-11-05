import { Link } from "react-router-dom"
import "./componentstyles/navbar.css";
function NavBar() {
    return (
        <nav className="navbar-section">
            <Link className="navbar-link" to="/dashboard">Dashboard</Link>
        </nav>
    );
}
export default NavBar;
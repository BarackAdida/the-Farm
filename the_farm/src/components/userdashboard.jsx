import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import "./componentstyles/userdashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import EggProductionChart from "./EggsProductionChart";
import SalesGraph from "./SalesGraph";
import PopulationGraph from "./PopulationGraph";
import VaccinationAlert from "./VaccinationAlert";
import FeedAlert from "./FeedAlert";
import {
  LayoutDashboard,
  Layers,
  Egg,
  ShoppingCart,
  Syringe,
  LogOut,
} from "lucide-react";

function Userdashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const isDashboardHome =
    location.pathname === "/dashboard" ||
    location.pathname === "/userdashboard" ||
    location.pathname === "/";

  return (
    <div className="dashboard-layout">
      <header className="topbar">
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? "×" : "☰"}
        </button>
        <h1 className="topbar-title text-warning">Golden Yolk</h1>
        <div className="topbar-right">
          <button
            className="btn btn-outline-warning btn-sm gap-2 d-flex align-items-center"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <aside className={`sidebar ${isMobile ? isSidebarOpen ? "open" : "hidden" : isSidebarOpen ? "open" : "closed"}`}>
        <nav className="sidebar-nav">
          <NavLink to="" end className="nav-item">
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </NavLink>
          <NavLink to="batch" className="nav-item">
            <Layers size={18} /> <span>Batch</span>
          </NavLink>
          <NavLink to="eggsproduction" className="nav-item">
            <Egg size={18} /> <span>Egg Production</span>
          </NavLink>
          <NavLink to="sales" className="nav-item">
            <ShoppingCart size={18} /> <span>Sales</span>
          </NavLink>
          <NavLink to="vaccinationinfo" className="nav-item">
            <Syringe size={18} /> <span>Vaccination Records</span>
          </NavLink>
        </nav>
      </aside>

      <main className={`dashboard-content ${isSidebarOpen ? "" : "expanded"}`}>
        <Outlet />

        {isDashboardHome && (
          <div>
            <VaccinationAlert />
            <FeedAlert />
            <div className="charts-grid">
              <EggProductionChart />
              <SalesGraph />
              <PopulationGraph />
            </div>
          </div>
        )}
      </main>
    </div>

  );
}

export default Userdashboard;

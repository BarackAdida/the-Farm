import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  Egg,
  Users,
  Receipt,
  BarChart3,
  ShoppingCart,
  Syringe,
  LogOut,
  Wheat,
} from "lucide-react";
import VaccinationAlert from "./VaccinationAlert";
// import "./componentstyles/dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import EggProductionChart from "./EggsProductionChart";
import SalesGraph from "./SalesGraph";
import PopulationGraph from "./PopulationGraph";
import ExpenseGraph from "./ExpenseGraph";
import FeedAlert from "./FeedAlert";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setIsSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const isDashboardHome =
    location.pathname === "/dashboard" || location.pathname === "/";

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
            className="btn btn-outline-warning btn-sm d-flex align-items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <nav className="sidebar-nav">
          <NavLink to="" className="nav-item">
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </NavLink>
          <NavLink to="batch" className="nav-item">
            <Layers size={18} /> <span>Batch</span>
          </NavLink>
          <NavLink to="eggsproduction" className="nav-item">
            <Egg size={18} /> <span>Egg Production</span>
          </NavLink>
          <NavLink to="employees" className="nav-item">
            <Users size={18} /> <span>Employees</span>
          </NavLink>
          <NavLink to="expenses" className="nav-item">
            <Receipt size={18} /> <span>Expenses</span>
          </NavLink>
          <NavLink to="profits" className="nav-item">
            <BarChart3 size={18} /> <span>Profits</span>
          </NavLink>
          <NavLink to="sales" className="nav-item">
            <ShoppingCart size={18} /> <span>Sales</span>
          </NavLink>
          <NavLink to="vaccinationinfo" className="nav-item">
            <Syringe size={18} /> <span>Vaccination Records</span>
          </NavLink>

          <NavLink to="feedrecords" className="nav-item">
            <Wheat size={18} /> <span>Feeds</span>
          </NavLink>
        </nav>
      </aside>

      <main className={`dashboard-content ${isSidebarOpen ? "" : "expanded"}`}>
        <Outlet />

        {isDashboardHome && (
          <div>
            <FeedAlert />
            <VaccinationAlert />
            <div className="charts-grid">
              <EggProductionChart />
              <SalesGraph />
              <PopulationGraph />
              <ExpenseGraph />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

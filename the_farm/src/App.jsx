import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Expenses from "./components/Expenses";
import Batch from "./components/Batch";
import Employees from "./components/Employees";
import EggsProduction from "./components/EggsProduction";
import Stock from "./components/Stock";
import Profits from "./components/Profits";
import Sales from "./components/Sales";
import ResetPassword from "./components/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";
import Logout from "./components/Logout";
import Dashboard from "./components/dashboard";
import Userdashboard from "./components/userdashboard";
import VaccinationInfo from "./components/VaccinationInfo";
import EggProductionChart from "./components/EggsProductionChart";
import SalesGraph from "./components/SalesGraph";
import PopulationGraph from "./components/PopulationGraph";
import VaccinationAlert from "./components/VaccinationAlert";
import VaccinationSchedule from "./components/VaccinationSchedule";
import FeedRecords from "./components/FeedRecords";
import FeedAlert from "./components/FeedAlert";
import ExpenseGraph from "./components/ExpenseGraph";

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/resetpassword" element={<ResetPassword />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="vaccinationinfo" element={<VaccinationInfo />} />
      <Route path="eggproductionchart" element={<EggProductionChart />} />
      <Route path="eggproductionchart" element={<EggProductionChart />} />
      <Route path="salesgraph" element={<SalesGraph />} />
      <Route path="vaccinationschedule" element={<VaccinationSchedule />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Routes>

              <Route path="/dashboard" element={<Dashboard />}>
                <Route path="batch" element={<Batch />} />
                <Route path="employees" element={<Employees />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="profits" element={<Profits />} />
                <Route path="sales" element={<Sales />} />
                <Route path="eggsproduction" element={<EggsProduction />} />
                <Route path="stock" element={<Stock />} />
                <Route path="vaccinationinfo" element={<VaccinationInfo />} />
                <Route path="populationgraph" element={<PopulationGraph />} />
                <Route path="expensegraph" element={<ExpenseGraph />} />
                <Route path="feedrecords" element={<FeedRecords />} />
                <Route path="vaccinationalert" element={<VaccinationAlert />} />
                <Route path="feedrecords" element={<FeedRecords />} />
                <Route path="feedalert" element={<FeedAlert />} />
                <Route path="vaccinationinfo" element={<VaccinationInfo />} />
                <Route path="eggproductionchart" element={<EggProductionChart />} />
                <Route path="eggproductionchart" element={<EggProductionChart />} />
                <Route path="salesgraph" element={<SalesGraph />} />
                <Route path="vaccinationschedule" element={<VaccinationSchedule />} />
              </Route>

              <Route path="/userdashboard" element={<Userdashboard />}>
                <Route path="batch" element={<Batch />} />
                <Route path="eggsproduction" element={<EggsProduction />} />
                <Route path="sales" element={<Sales />} />
                <Route path="vaccinationinfo" element={<VaccinationInfo />} />
                <Route path="populationgraph" element={<PopulationGraph />} />
                <Route path="feedrecords" element={<FeedRecords />} />
                <Route path="vaccinationalert" element={<VaccinationAlert />} />
                <Route path="feedalert" element={<FeedAlert />} />
              </Route>

              <Route path="/logout" element={<Logout />} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
    
  );
}

export default App;

import { Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./components/dashboard/Dashboard";
import TelemetryViewer from "./components/dashboard/TelemetryViewer";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="telemetry" element={<TelemetryViewer />} />
      </Route>
    </Routes>
  );
};

export default App;

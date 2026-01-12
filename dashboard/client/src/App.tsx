import { Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./components/dashboard/Dashboard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default App;

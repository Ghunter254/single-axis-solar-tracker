import { Outlet } from "react-router-dom";
import Header from "./Header";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 p-6">
      {/* 1. Top Navigation */}
      <Header />

      {/* 2. Main Content Area */}
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="container mx-auto max-w-7xl">
          {/* Outlet renders the child route (Dashboard.tsx) */}
          <Outlet />
        </div>
      </main>

      {/* 3. Simple Footer (Optional) */}
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for the Control Systems Project.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;

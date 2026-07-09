import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";
import DashboardNavbar from "../dashboard/DashboardNavbar";

// Maps current path -> navbar title. Add entries here as you add pages.
const PAGE_TITLES = {
  "/teacher/dashboard": "Teacher Dashboard",
  "/teacher/courses": "Manage Courses",
  "/teacher/courses/create": "Create Course",
  "/teacher/students": "Students",
  "/teacher/analytics": "Analytics",
  "/teacher/profile": "Profile", 
  "/teacher/quiz/create": "Create Quiz",
};

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || "Teacher Dashboard";

  const handleLogout = () => {
    // TODO: wire this to AuthContext / clear token once auth is implemented
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar title={title} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}